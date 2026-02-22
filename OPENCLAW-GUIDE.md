# CinePrompt + OpenClaw: Build Better AI Video Prompts

## The problem

You type "cinematic drone shot of a mountain at sunset" into Sora or Runway and get something... fine. Generic. The AI gave you its default idea of cinematic because you didn't tell it what you actually meant.

Real cinematographers think in lenses, movement, lighting rigs, color science, depth of field. That vocabulary exists. Most people just don't know it.

## What CinePrompt does

CinePrompt translates cinematography knowledge into structured prompts that AI video generators actually respond to. Instead of "cinematic sunset," you get:

> Cinematic documentary. Peaceful. Summer, lush and warm, vast panoramic landscape. Exterior, open field, meadow. Golden hour, warm late afternoon light, clear sky. Establishing shot with pull out camera movement. 24mm lens. Deep focus. Soft daylight. Warm tones. Birds singing, nature ambience.

Same idea. Wildly different output from any model.

## What the CLI does

Your OpenClaw agent becomes your cinematographer. Describe a shot in plain English, your agent builds the structured prompt, and you get a link to view and copy it.

## Setup (2 minutes)

### 1. Install

```
npm install -g cineprompt
```

### 2. Get your API key

Sign up at [cineprompt.io](https://cineprompt.io) and upgrade to Pro. Go to Settings → API Access → Generate Key.

### 3. Save your key

```
cineprompt auth cp_your_key_here
```

That's it. You're ready.

## How to use it with your agent

Just ask your OpenClaw agent to build a prompt. It will construct the state JSON from your description, run the CLI, and hand you a share link.

**You say:**
> "Build me a CinePrompt for a moody close-up of a detective in a dark office, cigarette smoke, noir lighting"

**Your agent runs:**
```
cineprompt build '{"mode":"single","subjectType":"character","fields":{"media_type":["cinematic"],"genre":["noir"],"tone":["moody","dramatic"],"char_label":"A hardened detective","subject_description":"Sharp jawline, tired eyes, loosened tie","setting":"interior","location_type":"office","env_time":"night","shot_type":"close-up","movement":"static","dof":"shallow depth of field, bokeh","lighting_style":"hard light","lighting_type":"practical lights","color_grade":"desaturated","sfx_environment":["room tone"],"props":"cigarette smoke curling through a desk lamp beam"}}'
```

**You get:**
```
🎬 https://cineprompt.io/p/x7k2mf
```

Click the link. See the full prompt. Copy it into Sora, Runway, Kling, Veo, Seedance, or whatever you're generating with.

## Why this matters

- **92 cinematography fields** your agent can dial in — lens, movement, lighting, color science, film stock, sound design
- **Prompt output matches what models actually respond to** — not vague adjectives, real visual language
- **Share links let you view, tweak, and reuse prompts** — build a library of shots for any project
- **Works with any AI video model** — Universal output, plus model-specific optimization coming soon

## Quick reference

```
cineprompt --help              # see all commands
cineprompt fields              # browse all 92 fields
cineprompt fields shot_type    # see options for a specific field
cineprompt build --file s.json # build from a JSON file
```

## Links

- [cineprompt.io](https://cineprompt.io) — the prompt builder
- [cineprompt.io/guides](https://cineprompt.io/guides) — articles on AI video prompting
- [npm package](https://www.npmjs.com/package/cineprompt) — the CLI
