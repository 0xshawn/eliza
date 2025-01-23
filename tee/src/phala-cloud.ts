import axios from "axios";
import { CLOUD_API_URL, CLI_VERSION } from "./constant";

interface CreateCvmResponse {
    app_id: string;
    app_url: string;
}

interface GetPubkeyFromCvmResponse {
    app_env_encrypt_pubkey: string;
}

const headers = {
    "User-Agent": `tee-cli/${CLI_VERSION}`,
    "Content-Type": "application/json",
};

async function queryTeepods(apiKey: string): Promise<any> {
    try {
        const response = await axios.get(`${CLOUD_API_URL}/api/v1/teepods`, {
            headers: { ...headers, "X-API-Key": apiKey },
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

async function queryImages(apiKey: string, teepodId: string): Promise<any> {
    try {
        const response = await axios.get(
            `${CLOUD_API_URL}/api/v1/teepods/${teepodId}/images`,
            {
                headers: { ...headers, "X-API-Key": apiKey },
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

async function createCvm(
    payload: any,
    apiKey: string,
): Promise<CreateCvmResponse | null> {
    try {
        const response = await axios.post(
            `${CLOUD_API_URL}/api/v1/cvms/from_cvm_configuration`,
            payload,
            {
                headers: { ...headers, "X-API-Key": apiKey },
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
    payload: any,
    apiKey: string,
): Promise<GetPubkeyFromCvmResponse | null> {
    try {
        const response = await axios.post(
            `${CLOUD_API_URL}/api/v1/cvms/pubkey/from_cvm_configuration`,
            payload,
            {
                headers: { ...headers, "X-API-Key": apiKey },
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
