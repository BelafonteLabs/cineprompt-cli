/**
 * CinePrompt prompt text builder.
 * Mirrors the frontend's prompt assembly logic: section ordering,
 * field merging, and sentence construction.
 */

// Natural language join: ["a", "b", "c"] → "a, b and c"
function nlJoin(arr) {
  if (!Array.isArray(arr)) return arr;
  if (arr.length <= 1) return arr[0] || '';
  return arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];
}

// Section ordering (Universal model default)
const SECTION_ORDER = [
  { section: 'STYLE', fields: ['media_type', 'commercial_type', 'documentary_style', 'animation_style', 'music_video_style', 'social_media_style', 'genre', 'tone', 'format'] },
  { section: 'SUBJECT', fields: ['char_label', 'age_range', 'build', 'hair_style', 'hair_color', 'subject_description', 'wardrobe', 'expression', 'body_language', 'framing', 'creature_category', 'creature_label', 'creature_size', 'creature_body', 'creature_skin', 'creature_description', 'creature_expression', 'creature_framing', 'obj_description', 'obj_material', 'obj_condition', 'obj_scale', 'prod_description', 'prod_material', 'prod_staging', 'prod_condition', 'food_description', 'food_state', 'food_presentation', 'food_texture', 'cloth_description', 'cloth_fabric', 'cloth_presentation', 'cloth_fit', 'art_description', 'art_medium', 'art_setting', 'art_condition', 'botan_description', 'botan_type', 'botan_stage', 'botan_detail', 'veh_type', 'veh_description', 'veh_era', 'veh_condition', 'land_season', 'land_scale', 'abs_description', 'abs_quality', 'abs_movement'] },
  { section: 'ACTIONS', fields: ['movement_type', 'pacing', 'interaction_type', 'action_primary', 'beat_1', 'beat_2', 'beat_3'] },
  { section: 'ENVIRONMENT', fields: ['setting', 'isolation', 'location_type', 'abstract_environment', 'custom_location', 'location', 'env_time', 'weather', 'props', 'env_fg', 'env_mg', 'env_bg'] },
  { section: 'CINEMATOGRAPHY', fields: ['shot_type', 'movement', 'camera_body', 'focal_length', 'lens_brand', 'lens_filter', 'dof', 'lighting_style', 'lighting_type', 'key_light', 'fill_light'] },
  { section: 'PALETTE', fields: ['color_science', 'film_stock', 'color_grade', 'palette_colors', 'skin_tones'] },
  { section: 'SOUND', fields: ['sound_mode', 'voiceover_text', 'sfx_environment', 'sfx_interior', 'sfx_mechanical', 'sfx_dramatic', 'ambient', 'music_genre', 'music_mood', 'music'] }
];

// Media type subcategory fields
const MEDIA_SUBCAT_FIELDS = {
  'commercial': 'commercial_type', 'cinematic': 'genre', 'documentary': 'documentary_style',
  'animation': 'animation_style', 'music video': 'music_video_style', 'social media': 'social_media_style'
};
const MEDIA_ABSORBED = new Set(['media_type', 'commercial_type', 'documentary_style', 'animation_style', 'music_video_style', 'social_media_style', 'genre']);

// Merge rules for field pairs
function buildMergeRules(fields) {
  return {
    'shot_type': { mergeWith: 'movement', fn: (a, b) => {
      if (a && b) return b === 'static' ? `${a}, locked-off static camera` : `${a} with ${b} camera movement`;
      if (b) return b === 'static' ? 'locked-off static camera' : `${b} camera movement`;
      return a;
    }},
    'setting': { mergeWith: 'location_type', fn: (s, lt) => {
      const custom = fields.custom_location || '';
      let loc = lt && custom ? `${lt}, ${custom}` : (lt || custom || '');
      if (s && loc) return `${s}, ${loc}`;
      return s || loc;
    }},
    'focal_length': { mergeWith: 'lens_brand', fn: (fl, b) => {
      if (fl && b) return `${fl.replace(/ lens$/, '')} ${b}`;
      return fl || b;
    }},
    'lighting_style': { mergeWith: 'lighting_type', fn: (s, t) => {
      if (s && t) return `${s.replace(/ light$/, '').replace(/ lighting$/, '')} ${t}`;
      return s || t;
    }},
    'env_time': { mergeWith: 'weather', fn: (t, w) => {
      if (t && w) return `${t}, ${w}`;
      return t || w;
    }},
    'key_light': { mergeWith: 'fill_light', fn: (k, f) => {
      if (k && f) return `${k}, ${f}`;
      return k || f;
    }},
    'camera_body': { mergeWith: 'color_science', fn: (cam, cs) => {
      if (cam && cs) {
        let profileName = cs.split(' flat log')[0].split(' flat ')[0];
        const brands = ['ARRI', 'Sony', 'RED', 'Canon', 'Panasonic', 'Blackmagic'];
        for (const brand of brands) {
          if (cam.includes(brand) && profileName.startsWith(brand + ' ')) {
            profileName = profileName.slice(brand.length + 1);
            break;
          }
        }
        return `${cam} in ${profileName}, flat log footage, ungraded`;
      }
      return cam || cs;
    }},
    'film_stock': { mergeWith: 'color_grade', fn: (s, g) => {
      if (s && g) return `${s}, ${g}`;
      return s || g;
    }},
    'hair_style': { mergeWith: 'hair_color', fn: (s, c) => {
      if (s && c) return `${s.replace(/ hair$/, '')} ${c.replace(/ hair$/, '')} hair`;
      return s || c;
    }},
    'expression': { mergeWith: 'body_language', fn: (e, b) => {
      if (e && b) return `${e}, ${b}`;
      return e || b;
    }},
    'char_label': { mergeWith: 'age_range', fn: (l, a) => {
      if (l && a) return a.startsWith('in their') ? `${l} ${a}` : `${l}, ${a}`;
      return l || a;
    }},
    'creature_category': { mergeWith: 'creature_label', fn: (c, l) => {
      if (c && l) return `${c}, ${l}`;
      return c || l;
    }},
    'music_genre': { mergeWith: 'music_mood', fn: (g, m) => {
      if (g && m) return `${m.split(',')[0].trim()} ${g}`;
      return g || m;
    }},
    'sound_mode': { mergeWith: 'voiceover_text', fn: (m, t) => {
      if (m && t) {
        let vo = t.trim();
        if (!vo.startsWith('"') && !vo.startsWith('\u201c')) vo = `"${vo}"`;
        return `${m}: ${vo}`;
      }
      return m || t;
    }}
  };
}

export function buildPromptText(state) {
  const fields = state.fields || {};
  const mergeRules = buildMergeRules(fields);

  const skipFields = new Set();
  for (const [, rule] of Object.entries(mergeRules)) {
    if (rule.mergeWith) skipFields.add(rule.mergeWith);
  }
  skipFields.add('custom_location');

  // Media type smart merge
  let mediaTypeMerged = null;
  if (fields.media_type) {
    const types = Array.isArray(fields.media_type) ? fields.media_type : [fields.media_type];
    const parts = [];
    for (const mt of types) {
      const subcatField = MEDIA_SUBCAT_FIELDS[mt];
      const subcatVal = subcatField ? fields[subcatField] : null;
      if (subcatVal) {
        if (mt === 'cinematic' && subcatVal) {
          const genreArr = Array.isArray(subcatVal) ? subcatVal : [subcatVal];
          parts.push(`cinematic ${nlJoin(genreArr)}`);
        } else if (Array.isArray(subcatVal)) {
          parts.push(nlJoin(subcatVal));
        } else {
          parts.push(subcatVal);
        }
      } else {
        parts.push(mt);
      }
    }
    mediaTypeMerged = parts.join(' ');
  }

  // Build ordered values
  const allValues = [];
  for (const { section, fields: sectionFields } of SECTION_ORDER) {
    for (const field of sectionFields) {
      if (MEDIA_ABSORBED.has(field)) {
        if (field === 'media_type' && mediaTypeMerged) {
          allValues.push({ text: mediaTypeMerged, section, field });
        }
        continue;
      }
      if (skipFields.has(field)) continue;
      if (mergeRules[field]) {
        const partner = mergeRules[field].mergeWith;
        const v1 = fields[field], v2 = fields[partner];
        if (v1 || v2) {
          allValues.push({ text: mergeRules[field].fn(v1, v2), section, field });
        }
        continue;
      }
      if (fields[field]) {
        const val = fields[field];
        if (field === 'dialogue') {
          let lines = val;
          if (!lines.startsWith('"') && !lines.startsWith('\u201c')) lines = `"${lines}"`;
          allValues.push({ text: `Dialogue: ${lines}`, section, field });
        } else if (Array.isArray(val)) {
          allValues.push({ text: nlJoin(val), section, field });
        } else {
          allValues.push({ text: val, section, field });
        }
      }
    }
  }

  if (allValues.length === 0) return '';

  // Assemble with merge groups
  const gearFields = new Set(['camera_body', 'focal_length', 'lens_filter']);
  const segments = [];
  let subjectBuf = [], gearBuf = [];
  const flushSubject = () => { if (subjectBuf.length) { segments.push(subjectBuf.map((s, i) => i === 0 ? s.text : (s.field === 'framing' ? '; ' + s.text : ', ' + s.text)).join('')); subjectBuf = []; } };
  const flushGear = () => { if (gearBuf.length) { segments.push(gearBuf.map(g => g.text).join(', ')); gearBuf = []; } };

  for (const v of allValues) {
    if (v.section === 'SUBJECT') { flushGear(); subjectBuf.push(v); }
    else if (v.section === 'CINEMATOGRAPHY' && gearFields.has(v.field)) { flushSubject(); gearBuf.push(v); }
    else { flushSubject(); flushGear(); segments.push(v.text); }
  }
  flushSubject(); flushGear();

  return segments.map(s => {
    let t = s.charAt(0).toUpperCase() + s.slice(1);
    if (!t.endsWith('.') && !t.endsWith('!') && !t.endsWith('"')) t += '.';
    return t;
  }).join(' ');
}
