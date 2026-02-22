/**
 * CinePrompt share link creation via Supabase RPC.
 * Requires a CinePrompt API key (Pro subscribers).
 */

const SUPABASE_URL = 'https://jbeuvbsremektkwqmnps.supabase.co';
const ANON_KEY = 'sb_publishable_W-tmZXUJsPIwjMBQVeH2bw_VIIS5PWw';

export async function createShareLink(apiKey, stateJson, promptText, mode) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/create_share_link`, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      api_key: apiKey,
      prompt_text: promptText,
      state_json: stateJson,
      share_mode: mode || 'single'
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`CinePrompt API error: ${err}`);
  }

  const data = await res.json();
  return {
    url: data.url,
    shortCode: data.short_code
  };
}
