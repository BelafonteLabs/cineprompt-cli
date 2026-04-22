# cineprompt

CLI tool for building structured AI video prompts and share links via [cineprompt.io](https://cineprompt.io).

Turn shot descriptions into optimized prompts for Kling, Seedance, Grok Imagine, Pixverse, LTX, Runway, Veo, WAN, and other AI video generators.

## Install

```bash
npm install -g cineprompt
```

Or run directly:

```bash
npx cineprompt --help
```

## Setup

Get your API key from [cineprompt.io](https://cineprompt.io) → Settings → API Access (Pro subscription required).

```bash
cineprompt auth cp_your_api_key_here
```

## Usage

### Build a share link from state JSON

```bash
cineprompt build '{"mode":"single","complexity":"complex","subjectType":"character","fields":{"media_type":["cinematic"],"mood":["contemplative"],"genre":["drama"],"char_label":"A retired boxer","subject_description":"Weathered face, broken nose","setting":"interior","location_type":["apartment"],"env_time":"night","shot_type":"medium close-up","framing":["positioned left-third of frame"],"focal_length":"85mm","dof":"shallow depth of field, bokeh","movement_type":["static, locked-off"],"lighting_type":["practical lights"],"film_stock":["Kodak Vision3 500T 5219"],"color_grade":["desaturated"],"ambient":"Refrigerator hum, distant sirens"}}'
```

Output:

```
🎬 https://cineprompt.io/p/a8k2mf
```

### Build from a JSON file

```bash
cineprompt build --file shot.json
```

### Build from stdin

```bash
cat shot.json | cineprompt build
```

### Browse available fields

```bash
# List all 130 fields
cineprompt fields

# Show valid values for a specific field
cineprompt fields mood
cineprompt fields movement_type
cineprompt fields media_type
```

## State JSON format

```json
{
  "mode": "single",
  "complexity": "complex",
  "subjectType": "character",
  "fields": {
    "media_type": ["cinematic"],
    "mood": ["nostalgic"],
    "genre": ["drama"],
    "char_label": "A weathered fisherman",
    "subject_description": "Deep wrinkles, sun-damaged skin, calloused hands",
    "expression": "quietly content",
    "wardrobe": "Faded yellow slicker, wool cap",
    "action_primary": "mending a net",
    "setting": "exterior",
    "location_type": ["dock, pier"],
    "custom_location": "A fog-wrapped fishing dock at dawn",
    "env_time": "dawn, first light",
    "weather": "fog",
    "shot_type": "close-up",
    "framing": ["positioned left-third of frame"],
    "focal_length": "85mm",
    "dof": "shallow depth of field, bokeh",
    "movement_type": ["handheld"],
    "lighting_type": ["daylight"],
    "key_light": "Diffused morning light through fog",
    "film_stock": ["Kodak Portra 400"],
    "color_grade": ["desaturated"],
    "sfx_environment": ["waves crashing, water ambience"],
    "ambient": "Creaking dock, distant foghorn, gulls"
  }
}
```

### Required fields

- **mode** — `"single"` or `"multi_shot"`
- **fields** — object mapping field names to values

### Optional fields

- **complexity** — `"simple"` (default) or `"complex"` (unlocks camera body, lens brand, film stock, color science, environment layers)
- **subjectType** — `"character"`, `"object"`, `"vehicle"`, `"creature"`, `"landscape"`, or `"abstract"`

### Field types

- **Button fields** accept exact string values (use `cineprompt fields <name>` to see options)
- **Array fields** accept multiple values: `"media_type": ["cinematic", "documentary"]`
- **Text fields** accept any string: `"subject_description": "whatever you want"`

## Modes

**Single Shot** — full cinematography control over one shot. 130 fields across subject, camera, lighting, color, environment, and sound.

**Multi-Shot** — sequence of shots with global settings + per-shot overrides. Recurring characters, 28 transition types.

**Frame → Motion** — dual-prompt workflow for img2vid. Build the frame first (image prompt), then direct the motion with quick-insert chips for camera moves, pacing, transitions, and directing cues.

## Use with AI agents

The CLI is designed to work with AI coding agents and automation tools. Your agent builds the state JSON, pipes it to `cineprompt build`, and gets back a share link.

```bash
# Agent workflow
echo "$STATE_JSON" | cineprompt build
```

Works with [OpenClaw](https://openclaw.ai), Claude, GPT, and any agent that can run shell commands.

## Authentication

API keys are scoped to share link creation only. They cannot read other users' data, access saved prompts, or modify accounts.

```bash
# Save key locally (~/.cineprompt/config.json)
cineprompt auth cp_your_key

# Or pass per-command
cineprompt build --api-key cp_your_key '{"fields":{...}}'

# Or set env var
CINEPROMPT_API_KEY=cp_your_key cineprompt build '{"fields":{...}}'
```

## Links

- [CinePrompt](https://cineprompt.io) — prompt builder
- [Guides](https://cineprompt.io/guides) — articles on AI video prompting
- [Models](https://cineprompt.io/models) — AI video model comparison
- [Light Owl](https://lightowl.com) — production company behind CinePrompt

## License

MIT
