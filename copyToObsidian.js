import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

const source = path.resolve(process.env.SOURCE);
const target = path.resolve(process.env.TARGET);

// Ensure target folder exists
fs.mkdirSync(path.dirname(target), { recursive: true });

// Copy file
fs.copyFileSync(source, target);
console.log(`Copied ${source} → ${target}`);
