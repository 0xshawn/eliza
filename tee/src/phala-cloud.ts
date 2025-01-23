import axios from "axios";
import { CLOUD_API_URL, CLI_VERSION } from "./constant";
import { getApiKey } from "./credential";

interface CreateCvmResponse {
    app_id: string;
    app_url: string;
}

interface GetPubkeyFromCvmResponse {
    app_env_encrypt_pubkey: string;
    app_id_salt: string;
}

const headers = {
    "User-Agent": `tee-cli/${CLI_VERSION}`,
    "Content-Type": "application/json",
};

let apiKey: string | null = null;

const retrieveApiKey = () => {
    if (apiKey) {
        return apiKey;
    }

    apiKey = getApiKey();
    if (!apiKey) {
        console.error("Error: API key not found. Please set an API key first.");
        process.exit(1);
    }
    return apiKey;
};

async function queryTeepods(): Promise<any> {
    try {
        const response = await axios.get(`${CLOUD_API_URL}/api/v1/teepods`, {
            headers: { ...headers, "X-API-Key": retrieveApiKey() },
        });
        return response.data;
    } catch (error: any) {
        console.error(
            "Error during teepod query:",
            error.response?.data || error.message,
        );
        return null;
    }
}

async function queryImages(teepodId: string): Promise<any> {
    try {
        const response = await axios.get(
            `${CLOUD_API_URL}/api/v1/teepods/${teepodId}/images`,
            {
                headers: { ...headers, "X-API-Key": retrieveApiKey() },
            },
        );
        return response.data;
    } catch (error: any) {
        console.error(
            "Error during image query:",
            error.response?.data || error.message,
        );
        return null;
    }
}

async function createCvm(vm_config: any): Promise<CreateCvmResponse | null> {
    try {
        const response = await axios.post(
            `${CLOUD_API_URL}/api/v1/cvms/from_cvm_configuration`,
            vm_config,
            {
                headers: { ...headers, "X-API-Key": retrieveApiKey() },
            },
        );
        return response.data as CreateCvmResponse;
    } catch (error: any) {
        console.error(
            "Error during deployment:",
            error.response?.data || error.message,
        );
        return null;
    }
}

async function getPubkeyFromCvm(
    vm_config: any,
): Promise<GetPubkeyFromCvmResponse | null> {
    try {
        const response = await axios.post(
            `${CLOUD_API_URL}/api/v1/cvms/pubkey/from_cvm_configuration`,
            vm_config,
            {
                headers: { ...headers, "X-API-Key": retrieveApiKey() },
            },
        );
        return response.data as GetPubkeyFromCvmResponse;
    } catch (error: any) {
        console.error(
            "Error during deployment:",
            error.response?.data || error.message,
        );
        return null;
    }
}

export { createCvm, queryTeepods, queryImages, getPubkeyFromCvm };
