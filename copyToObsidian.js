import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

const vaultPath = path.resolve(process.env.OBSIDIAN_VAULT);
const coreDir = path.join(vaultPath, "powerJournal", "core");

// Ensure core directory exists
fs.mkdirSync(coreDir, { recursive: true });

// Copy main file
const source = path.resolve("dist/runPowerJournal.js");
const target = path.join(coreDir, "runPowerJournal.js");
fs.copyFileSync(source, target);
console.log(`Copied ${source} → ${target}`);

// Copy templater template if it doesn't exist in core folder
const templateSource = path.resolve("templaterTemplate/powerJournal.tp.md");
const templateTarget = path.join(coreDir, "powerJournal.tp.md");

if (!fs.existsSync(templateTarget)) {
  fs.copyFileSync(templateSource, templateTarget);
  console.log(`Copied template: ${templateSource} → ${templateTarget}`);
} else {
  console.log(`Template already exists: ${templateTarget} (skipping)`);
}
