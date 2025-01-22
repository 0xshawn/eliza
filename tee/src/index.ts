import axios from "axios";
import * as crypto from "crypto";
import fs from "fs";
import { getApiKey } from "./credential";
import { CLOUD_API_URL, CLOUD_URL } from "./constant";
import { createCvm, queryImages, queryTeepods } from "./phala-cloud";

// Define types for the options
interface DeployOptions {
    type?: string;
    mode?: string;
    name: string;
    secrets?: string;
    vcpu?: number;
    memory?: number;
    diskSize?: number;
    compose?: string;
}

// Helper function to encrypt secrets
function encryptSecrets(secrets: string): {
    encrypted: string;
    key: string;
    iv: string;
} {
    const algorithm = "aes-256-cbc";
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(secrets, "utf8", "hex");
    encrypted += cipher.final("hex");

    return {
        encrypted,
        key: key.toString("hex"),
        iv: iv.toString("hex"),
    };
}

// Function to handle deployment
async function deploy(options: DeployOptions): Promise<void> {
    console.log("Deploying CVM ...");
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error("Error: API key not found. Please set an API key first.");
        process.exit(1);
    }

    // Encrypt secrets if provided
    const { encrypted, key, iv } = options.secrets
        ? encryptSecrets(options.secrets)
        : { encrypted: "", key: "", iv: "" };

    // console.debug("Secrets encrypted:", { key, iv });

    let composeString = "";
    if (options.compose) {
        composeString = fs.readFileSync(options.compose, "utf8");
    }

    // Prepare payload for the request
    const payload = {
        teepod_id: 2, // TODO: get from /api/teepods
        name: options.name,
        image: "dstack-dev-0.3.4",
        vcpu: options.vcpu || 1,
        memory: options.memory || 2048,
        disk_size: options.diskSize || 20,
        compose_manifest: {
            docker_compose_file: composeString,
            docker_config: {
                url: "",
                username: "",
                password: "",
            },
            features: ["kms", "tproxy-net"],
            kms_enabled: true,
            manifest_version: 2,
            name: options.name,
            public_logs: true,
            public_sysinfo: true,
            tproxy_enabled: true,
        },
        encrypted_env: encrypted,
        listed: false,
    };

    // Make the POST request
    const response = await createCvm(payload, apiKey);
    if (!response) {
        console.error("Error during deployment");
        return;
    }

    const appId = response.app_id;
    console.log("Deployment successful");
    console.log("App Id:", appId);
    console.log("App URL:", `${CLOUD_URL}/dashboard/cvms/app_${appId}`);
    process.exit(0);
}

async function teepods() {
    console.log("Querying teepods...");
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error("Error: API key not found. Please set an API key first.");
        process.exit(1);
    }
    const teepods = await queryTeepods(apiKey);
    console.log("Teepods:");
    for (const teepod of teepods) {
        console.log(teepod.id, teepod.name, teepod.status);
    }
    process.exit(0);
}

async function images(teepodId: string) {
    console.log("Querying images for teepod:", teepodId);
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error("Error: API key not found. Please set an API key first.");
        process.exit(1);
    }
    const images = await queryImages(apiKey, teepodId);
    if (!images) {
        process.exit(1);
    }
    console.log("Images:");
    for (const image of images) {
        console.log(image.name);
    }
    process.exit(0);
}

export { deploy, DeployOptions, teepods, images };
