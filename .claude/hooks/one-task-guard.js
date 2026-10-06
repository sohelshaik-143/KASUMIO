#!/usr/bin/env node

/**
 * PostToolUse hook that enforces the one-task-per-invocation rule.
 *
 * Reads .agent/tasks.json, counts tasks with passes: true,
 * and warns if more than one task was completed since the session started.
 * The baseline is stored in .agent/.task-count (ephemeral per session).
 */

const fs = require('fs');
const path = require('path');

// Find project root by looking for .agent directory
function findProjectRoot() {
  let dir = __dirname;
  // Walk up from .claude/hooks
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, '.agent', 'tasks.json'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

// Read tool input from stdin to check if this was a git commit
function readStdin() {
  try {
    return fs.readFileSync('/dev/stdin', 'utf8');
  } catch {
    return '';
  }
}

try {
  const input = readStdin();

  // Only check after git commit commands
  let parsed = {};
  try {
    parsed = JSON.parse(input);
  } catch {
    // Not JSON input, skip
    process.exit(0);
  }

  const toolInput = parsed.tool_input || {};
  const command = toolInput.command || '';

  // Only trigger on git commit commands
  if (!command.includes('git commit')) {
    process.exit(0);
  }

  const root = findProjectRoot();
  if (!root) {
    process.exit(0);
  }

  const agentDir = path.join(root, '.agent');
  const tasksFile = path.join(agentDir, 'tasks.json');
  const countFile = path.join(agentDir, '.task-count');

  if (!fs.existsSync(tasksFile)) {
    process.exit(0);
  }

  const tasks = JSON.parse(fs.readFileSync(tasksFile, 'utf8'));
  const passCount = tasks.filter((t) => t.passes === true).length;

  if (!fs.existsSync(countFile)) {
    // First commit this session — store baseline
    fs.writeFileSync(countFile, String(passCount));
  } else {
    const baseline = parseInt(fs.readFileSync(countFile, 'utf8'), 10);
    const completed = passCount - baseline;

    if (completed > 1) {
      console.log(
        `⚠️ VIOLATION: ${completed} tasks completed in this invocation. ` +
          'PROMPT.md requires ONE task per invocation. ' +
          'Stop now and output <promise>TASK-{ID}:DONE</promise>.'
      );
    }
  }
} catch (error) {
  // Fail silently — don't block work if the guard has a bug
  if (process.env.DEBUG) {
    console.error(`one-task-guard error: ${error.message}`);
  }
}
