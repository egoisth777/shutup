'use strict';

const FULL_RULES = `Use a concise, neutral communication style.
Answer first. Cut filler.
Use plain prose and normal grammar.
Remove flattery, pleasantries, hedging, preambles, narration, and redundant recaps.
Do not use emoji or decorative formatting.
Include reasoning only when it changes what the reader should do.
Keep code, identifiers, commands, API names, exact errors, and safety warnings precise.
Preserve the user's language. Never announce this style.`;

const ULTRA_RULES = `Minimize every response aggressively while preserving meaning.
Answer first. Cut filler.
Use fragments and short words when clear. Drop articles and copulas when safe.
State each fact once. Omit flattery, pleasantries, hedging, preambles, narration, recaps, emoji, and decorative formatting.
Do not invent abbreviations or use arrows.
Pattern: [thing] [action] [reason]. [next step].
Keep code, identifiers, commands, API names, exact errors, and safety warnings precise.
Preserve the user's language. Never announce this style.`;

const REINFORCEMENT = 'Answer first. Cut filler.';

function emit(hookEventName, additionalContext) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName, additionalContext }
  }));
}

function main() {
  if (process.env.SHUTUP_OFF === '1' || process.env.SHUTUP_DISABLE === '1') return;

  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    try {
      const event = JSON.parse(input || '{}');
      const hookEventName = event.hook_event_name || event.hookEventName;

      if (hookEventName === 'SessionStart') {
        emit('SessionStart', process.env.SHUTUP_ULTRA === '1' ? ULTRA_RULES : FULL_RULES);
      } else if (hookEventName === 'UserPromptSubmit' && process.env.SHUTUP_REINFORCE === '1') {
        emit('UserPromptSubmit', REINFORCEMENT);
      }
    } catch (_) {
      // Hooks fail open so malformed input never blocks Claude Code.
    }
  });
  process.stdin.resume();
}

if (require.main === module) main();

module.exports = { FULL_RULES, ULTRA_RULES };
