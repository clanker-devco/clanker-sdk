#!/usr/bin/env node

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--create")) {
    const createClanker = await import("./create-clanker.js");
    await createClanker.default();
  } else {
    console.log("\n🚀 Clanker SDK CLI\n");
    console.log("Available commands:");
    console.log("  --create    Create a new token");
    console.log("\nExample:");
    console.log("  npx clanker-sdk --create\n");
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
