import axios from "axios";
import * as crypto from "crypto";
import fs from "fs";
import { getApiKey } from "./credential";
import { CLOUD_API_URL, CLOUD_URL } from "./constant";
import {
    createCvm,
    getPubkeyFromCvm,
    queryImages,
    queryTeepods,
} from "./phala-cloud";
import { x25519 } from "@noble/curves/ed25519";
import { hexToUint8Array, uint8ArrayToHex } from "./lib";

// Define types for the options
interface DeployOptions {
    debug?: boolean;
    type?: string;
    mode?: string;
    name: string;
    secrets?: string;
    vcpu?: number;
    memory?: number;
    diskSize?: number;
    compose?: string;
    env?: string[];
    envFile?: string;
    envs: Env[];
}

interface Env {
    key: string;
    value: string;
}

// Helper function to encrypt secrets
async function encryptSecrets(secrets: Env[], pubkey: string): Promise<string> {
    const envsJson = JSON.stringify({ env: secrets });

    // Generate private key and derive public key
    const privateKey = x25519.utils.randomPrivateKey();
    const publicKey = x25519.getPublicKey(privateKey);

    // Generate shared key
    const remotePubkey = hexToUint8Array(pubkey);
    const shared = x25519.getSharedSecret(privateKey, remotePubkey);

    // Import shared key for AES-GCM
    const importedShared = await crypto.subtle.importKey(
        "raw",
        shared,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt"],
    );

    // Encrypt the data
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        importedShared,
        new TextEncoder().encode(envsJson),
    );

    // Combine all components
    const result = new Uint8Array(
        publicKey.length + iv.length + encrypted.byteLength,
    );

    result.set(publicKey);
    result.set(iv, publicKey.length);
    result.set(new Uint8Array(encrypted), publicKey.length + iv.length);

    return uint8ArrayToHex(result);
}

// Function to handle deployment
async function deploy(options: DeployOptions): Promise<void> {
    console.log("Deploying CVM ...");
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error("Error: API key not found. Please set an API key first.");
        process.exit(1);
    }

    let composeString = "";
    if (options.compose) {
        composeString = fs.readFileSync(options.compose, "utf8");
    }

    // Prepare vm_config for the request
    const vm_config = {
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
        listed: false,
    };

    const pubkey = await getPubkeyFromCvm(vm_config, apiKey);
    if (!pubkey) {
        console.error("Error: Failed to get pubkey from CVM.");
        process.exit(1);
    }
    const app_env_encrypt_pubkey = pubkey.app_env_encrypt_pubkey;
    const app_id_salt = pubkey.app_id_salt;

    const encrypted_env = await encryptSecrets(
        options.envs,
        pubkey.app_env_encrypt_pubkey,
    );

    options.debug && console.log("Pubkey:", app_env_encrypt_pubkey);
    options.debug && console.log("Encrypted Env:", encrypted_env);
    options.debug && console.log("Env:", options.envs);

    // Make the POST request
    const response = await createCvm(
        {
            ...vm_config,
            encrypted_env,
            app_env_encrypt_pubkey,
            app_id_salt,
        },
        apiKey,
    );
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
