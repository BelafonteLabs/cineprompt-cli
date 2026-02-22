#!/usr/bin/env node

/**
 * CinePrompt CLI
 * 
 * Create AI video prompts and share links via cineprompt.io.
 * 
 * Usage:
 *   cineprompt build '{"mode":"single","fields":{...}}'   → share link from state JSON
 *   cineprompt build --file state.json                    → share link from JSON file
 *   cat state.json | cineprompt build                     → share link from stdin
 * 
 * Auth:
 *   cineprompt auth <api-key>                             → save API key locally
 *   --api-key <key> or CINEPROMPT_API_KEY env var
 * 
 * Info:
 *   cineprompt --help
 *   cineprompt --version
 *   cineprompt fields                                     → list all valid field names
 *   cineprompt fields <name>                              → show values for a field
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { buildPromptText } from '../lib/prompt-builder.js';
import { createShareLink } from '../lib/share.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

// --- Config ---
const CONFIG_DIR = join(homedir(), '.cineprompt');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

function loadConfig() {
  try { return JSON.parse(readFileSync(CONFIG_FILE, 'utf8')); }
  catch { return {}; }
}

function saveConfig(config) {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function resolveApiKey(args) {
  // 1. --api-key flag
  const idx = args.indexOf('--api-key');
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  // 2. Env var
  if (process.env.CINEPROMPT_API_KEY) return process.env.CINEPROMPT_API_KEY;
  // 3. Saved config
  const config = loadConfig();
  if (config.apiKey) return config.apiKey;
  return null;
}

// --- Commands ---

async function cmdAuth(args) {
  const key = args[0];
  if (!key || !key.startsWith('cp_')) {
    console.error('Usage: cineprompt auth <api-key>');
    console.error('Get your API key at cineprompt.io → Settings → API Access');
    process.exit(1);
  }
  saveConfig({ ...loadConfig(), apiKey: key });
  console.log('✓ API key saved to ~/.cineprompt/config.json');
}

async function cmdBuild(args) {
  const apiKey = resolveApiKey(args);
  if (!apiKey) {
    console.error('No API key. Set one with:');
    console.error('  cineprompt auth <your-api-key>');
    console.error('  --api-key <key>');
    console.error('  CINEPROMPT_API_KEY=<key>');
    console.error('');
    console.error('Get your key at cineprompt.io → Settings → API Access (Pro required)');
    process.exit(1);
  }

  let stateJson;

  // --file flag
  const fileIdx = args.indexOf('--file');
  if (fileIdx !== -1 && args[fileIdx + 1]) {
    stateJson = JSON.parse(readFileSync(args[fileIdx + 1], 'utf8'));
  }
  // Inline JSON argument (skip flags)
  else {
    const jsonArg = args.find(a => !a.startsWith('--') && a !== args[args.indexOf('--api-key') + 1]);
    if (jsonArg) {
      try { stateJson = JSON.parse(jsonArg); }
      catch { /* not JSON, ignore */ }
    }
  }

  // Stdin
  if (!stateJson && !process.stdin.isTTY) {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const input = Buffer.concat(chunks).toString().trim();
    if (input) stateJson = JSON.parse(input);
  }

  if (!stateJson) {
    console.error('No state JSON provided. Use:');
    console.error('  cineprompt build \'{"mode":"single","fields":{...}}\'');
    console.error('  cineprompt build --file state.json');
    console.error('  cat state.json | cineprompt build');
    process.exit(1);
  }

  // Ensure required structure
  if (!stateJson.fields) {
    console.error('Error: state JSON must have a "fields" object.');
    process.exit(1);
  }
  stateJson.mode = stateJson.mode || 'single';
  stateJson.complexity = stateJson.complexity || 'simple';

  const promptText = buildPromptText(stateJson);
  if (!promptText) {
    console.error('Error: no prompt text generated. Check your field values.');
    process.exit(1);
  }

  try {
    const result = await createShareLink(apiKey, stateJson, promptText, stateJson.mode);
    console.log(`🎬 ${result.url}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

function cmdFields(args) {
  const fieldValues = require('../data/field-values.json');
  const fieldName = args[0];

  if (fieldName) {
    const values = fieldValues[fieldName];
    if (!values) {
      console.error(`Unknown field: ${fieldName}`);
      console.error(`Run "cineprompt fields" to see all field names.`);
      process.exit(1);
    }
    if (Array.isArray(values)) {
      values.forEach(v => console.log(`  ${v}`));
    } else {
      console.log(JSON.stringify(values, null, 2));
    }
  } else {
    const names = Object.keys(fieldValues);
    console.log(`${names.length} fields available:\n`);
    names.forEach(n => {
      const v = fieldValues[n];
      const count = Array.isArray(v) ? `(${v.length} options)` : '(free text)';
      console.log(`  ${n} ${count}`);
    });
    console.log(`\nRun "cineprompt fields <name>" to see values for a field.`);
  }
}

function showHelp() {
  console.log(`
cineprompt v${pkg.version} — AI video prompt builder

Commands:
  build <json>           Create a share link from state JSON
  build --file <path>    Create a share link from a JSON file
  auth <api-key>         Save your API key locally
  fields                 List all valid field names
  fields <name>          Show valid values for a field

Options:
  --api-key <key>        Use this API key (or set CINEPROMPT_API_KEY)
  --version, -v          Show version
  --help, -h             Show this help

Examples:
  cineprompt auth cp_abc123
  cineprompt build '{"mode":"single","complexity":"complex","subjectType":"landscape","fields":{"media_type":["cinematic"],"env_time":"golden hour, warm late afternoon light"}}'
  cat shot.json | cineprompt build

Get your API key: cineprompt.io → Settings → API Access (Pro required)
Docs: cineprompt.io/guides
`.trim());
}

// --- Main ---
const args = process.argv.slice(2);
const cmd = args[0];

if (!cmd || cmd === '--help' || cmd === '-h') {
  showHelp();
} else if (cmd === '--version' || cmd === '-v') {
  console.log(pkg.version);
} else if (cmd === 'auth') {
  cmdAuth(args.slice(1));
} else if (cmd === 'build') {
  cmdBuild(args.slice(1));
} else if (cmd === 'fields') {
  cmdFields(args.slice(1));
} else {
  console.error(`Unknown command: ${cmd}`);
  console.error('Run "cineprompt --help" for usage.');
  process.exit(1);
}
