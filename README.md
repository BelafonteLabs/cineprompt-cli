# cineprompt

CLI tool for building structured AI video prompts and share links via [cineprompt.io](https://cineprompt.io).

Turn shot descriptions into optimized prompts for Sora, Runway, Kling, Veo, Seedance, and other AI video generators.

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
cineprompt build '{"mode":"single","complexity":"complex","subjectType":"landscape","fields":{"media_type":["cinematic"],"tone":["peaceful"],"env_time":"golden hour, warm late afternoon light","shot_type":"establishing shot","movement":"pull out","focal_length":"24mm lens","dof":"deep focus","color_grade":"warm tones"}}'
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
# List all 92 fields
cineprompt fields

# Show valid values for a specific field
cineprompt fields env_time
cineprompt fields shot_type
cineprompt fields media_type
```

## State JSON format

```json
{
  "mode": "single",
  "complexity": "simple",
  "subjectType": "character",
  "fields": {
    "media_type": ["cinematic"],
    "tone": ["moody"],
    "char_label": "A weathered fisherman",
    "subject_description": "Deep wrinkles, sun-damaged skin",
    "setting": "exterior",
    "location_type": "dock, pier",
    "env_time": "dawn, first light",
    "weather": "fog",
    "shot_type": "close-up",
    "movement": "handheld",
    "dof": "shallow depth of field, bokeh",
    "lighting_style": "soft light",
    "color_grade": "desaturated",
    "sfx_environment": ["waves crashing, water ambience"]
  }
}
```

### Required fields

- **mode** — `"single"` (multishot and frame-to-motion coming soon)
- **fields** — object mapping field names to values

### Optional fields

- **complexity** — `"simple"` (default) or `"complex"` (unlocks camera body, lens brand, film stock, color science)
- **subjectType** — `"character"`, `"object"`, `"vehicle"`, `"creature"`, `"landscape"`, or `"abstract"`

### Field types

- **Button fields** accept exact string values (use `cineprompt fields <name>` to see options)
- **Array fields** accept multiple values: `"media_type": ["cinematic", "documentary"]`
- **Free text fields** accept any string: `"subject_description": "whatever you want"`

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
- [Light Owl](https://lightowl.com) — production company behind CinePrompt

## License

MIT
