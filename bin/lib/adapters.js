'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

function homePath(...parts) { return path.join(os.homedir(), ...parts); }

const ADAPTERS = Object.freeze({
  claude: { id: 'claude', kind: 'native', description: 'Claude Code marketplace plugin' },
  codex: {
    id: 'codex', kind: 'block+prompts', description: 'OpenAI Codex', verified: true,
    rulesPath: () => homePath('.codex', 'AGENTS.md'),
    promptsPath: () => homePath('.codex', 'prompts'),
    probes: () => [homePath('.codex')],
  },
  agy: { id: 'agy', kind: 'block', description: 'Google Antigravity', verified: false },
  pi: { id: 'pi', kind: 'block+prompts', description: 'Pi', verified: false },
  'oh-my-pi': { id: 'oh-my-pi', kind: 'block+prompts', description: 'Oh My Pi', verified: false },
});

function resolveAdapter(id) {
  const adapter = ADAPTERS[id];
  if (!adapter) return null;
  if (!adapter.verified && adapter.kind !== 'native') {
    return { ...adapter, available: false, reason: 'install paths are not verified' };
  }
  return { ...adapter, available: true };
}

function detectTargets() {
  const detected = [];
  for (const id of Object.keys(ADAPTERS)) {
    const adapter = resolveAdapter(id);
    if (adapter.kind === 'native') {
      if (process.env.CLAUDE_CONFIG_DIR || fs.existsSync(homePath('.claude'))) detected.push(adapter);
      continue;
    }
    if (adapter.available && adapter.probes().some(p => fs.existsSync(p))) detected.push(adapter);
  }
  return detected;
}

module.exports = { ADAPTERS, resolveAdapter, detectTargets };
