#!/usr/bin/env node
import Anthropic from "@anthropic-ai/sdk";
import { execSync } from "child_process";

const key = process.env.ANTHROPIC_API_KEY;
if (!key) { console.error("ANTHROPIC_API_KEY not set"); process.exit(1); }

const diff = execSync("git diff --staged", { encoding: "utf8" });
if (!diff.trim()) { console.error("No staged changes."); process.exit(1); }

const client = new Anthropic({ apiKey: key });
const msg = await client.messages.create({
  model: "claude-haiku-4-5-20251001",
  max_tokens: 256,
  messages: [{
    role: "user",
    content: `Generate a conventional commit message for this diff. Output ONLY the commit message, nothing else.\n\n${diff.slice(0, 8000)}`
  }]
});

const commitMsg = (msg.content[0] as { text: string }).text.trim();
console.log(`\nCommit message:\n  ${commitMsg}\n`);
execSync(`git commit -m ${JSON.stringify(commitMsg)}`, { stdio: "inherit" });
