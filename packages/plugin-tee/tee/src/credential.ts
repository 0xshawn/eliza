import { Command } from "commander";
import * as path from "path";
import fs from "fs";

const CONFIG_DIR = path.join(
    process.env.HOME || process.env.USERPROFILE || "~",
    ".config",
    "tee-cli",
);
const CREDENTIAL_FILE = path.join(CONFIG_DIR, "credential.json");

// Function to ensure the config directory exists
function ensureConfigDir() {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
}

// Function to write API key to credential.json
function writeApiKey(apiKey: string) {
    ensureConfigDir();

    const credentialData = {
        "X-API-Key": apiKey,
    };

    fs.writeFileSync(CREDENTIAL_FILE, JSON.stringify(credentialData, null, 2));
    console.log(`API key saved to ${CREDENTIAL_FILE}`);
}

function getApiKey() {
    try {
        const credentialData = JSON.parse(
            fs.readFileSync(CREDENTIAL_FILE, "utf8"),
        );
        return credentialData["X-API-Key"];
    } catch (error) {
        console.error("Error reading API key:", (error as Error).message);
        return null;
    }
}

export { writeApiKey, getApiKey };
