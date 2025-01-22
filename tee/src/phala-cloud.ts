import axios from "axios";
import { CLOUD_API_URL, CLI_VERSION } from "./constant";

interface CreateCvmResponse {
    app_id: string;
    app_url: string;
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
                headers: {
                    "User-Agent": `tee-cli/${CLI_VERSION}`,
                    "Content-Type": "application/json",
                    "X-API-Key": apiKey,
                },
            },
        );
        return response.data as CreateCvmResponse;
    } catch (error: any) {
        console.error("Error during deployment:", error);
        console.error(
            "Error during deployment:",
            error.response?.data || error.message,
        );
        return null;
    }
}

export { createCvm };
