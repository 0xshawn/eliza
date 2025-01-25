#!/usr/bin/env node
import { Command } from "commander";
import { deploy, DeployOptions, images, teepods } from "./index";
import { writeApiKey } from "./credential";
import fs from "fs";
import { CLI_VERSION } from "./constant";
import { upgrade, UpgradeOptions, Env } from "./index";

const parseEnv = (envs: string[], envFile: string): Env[] => {
    // Process environment variables
    const envVars: Record<string, string> = {};
    if (envs) {
        for (const env of envs) {
            if (env.includes("=")) {
                const [key, value] = env.split("=");
                if (key && value) {
                    envVars[key] = value;
                }
            }
        }
    }

    if (envFile) {
        const envFileContent = fs.readFileSync(envFile, "utf8");
        for (const line of envFileContent.split("\n")) {
            if (line.includes("=")) {
                const [key, value] = line.split("=");
                if (key && value) {
                    envVars[key] = value;
                }
            }
        }
    }

    // Add environment variables to the payload
    return Object.entries(envVars).map(([key, value]) => ({
        key,
        value,
    }));
};

const program = new Command().version(CLI_VERSION);

const setApiKeyCommand = new Command()
    .command("set-apikey")
    .description("Set the X-API-Key for the TEE CLI")
    .argument("<apiKey>", "The API key to set")
    .action((apiKey: string) => {
        writeApiKey(apiKey);
    });

// Define the `deploy` command
const deployCommand = new Command()
    .command("deploy")
    .description("Deploy to TEE cloud or locally against a simulator")
    .option("-t, --type <type>", "Specify the TEE vendor type")
    .option(
        "-m, --mode <mode>",
        "Specify the deployment mode (e.g., agent docker file or other local testing deployments)",
    )
    .option(
        "-n, --name <name>",
        "Specify the name of the docker image or agent being deployed",
    )
    .option(
        "-c, --compose <compose>",
        "Specify the docker compose file to be deployed",
    )
    .option(
        "-e, --env <env...>",
        "Specify environment variables in the form of KEY=VALUE",
    )
    .option(
        "--env-file <envFile>",
        "Specify a file containing environment variables",
    )
    .option("--debug", "Enable debug mode to print more information", false)
    .action((options: DeployOptions) => {
        if (!options.type || options.type !== "phala") {
            console.error(
                "Error: The --type option is required. Currently only phala is supported.",
            );
            process.exit(1);
        }
        if (!options.mode || options.mode !== "docker-compose") {
            console.error(
                "Error: The --mode option is required. Currently only docker-compose is supported.",
            );
            process.exit(1);
        }
        if (!options.name) {
            console.error("Error: The --name option is required.");
            process.exit(1);
        }
        if (!options.compose) {
            console.error("Error: The --compose option is required.");
            process.exit(1);
        }

        // Process environment variables
        options.envs = parseEnv(options.env || [], options.envFile || "");

        deploy(options);
    });

const teepodsCommand = new Command()
    .command("teepods")
    .description("Query the teepods")
    .action(() => {
        teepods();
    });

const imagesCommand = new Command()
    .command("images")
    .description("Query the images")
    .option("--teepod-id <teepodId>", "Specify the id of the teepod")
    .action((options: { teepodId: string }) => {
        if (!options.teepodId) {
            console.error("Error: The --teepod-id option is required.");
            process.exit(1);
        }
        images(options.teepodId);
    });

const upgradeCommand = new Command()
    .command("upgrade")
    .description("Upgrade the TEE CLI")
    .option("-t, --type <type>", "Specify the TEE vendor type")
    .option(
        "-m, --mode <mode>",
        "Specify the deployment mode (e.g., agent docker file or other local testing deployments)",
    )
    .option("--app-id <appId>", "Specify the app id")
    .option(
        "-e, --env <env...>",
        "Specify environment variables in the form of KEY=VALUE",
    )
    .option(
        "--env-file <envFile>",
        "Specify a file containing environment variables",
    )
    .option(
        "-c, --compose <compose>",
        "Specify the docker compose file to be deployed",
    )
    .action((options: UpgradeOptions) => {
        if (!options.compose) {
            console.error("Error: The --compose option is required.");
            process.exit(1);
        }

        // Process environment variables
        options.envs = parseEnv(options.env || [], options.envFile || "");

        upgrade(options);
    });

program.addCommand(setApiKeyCommand);
program.addCommand(deployCommand);
program.addCommand(teepodsCommand);
program.addCommand(imagesCommand);
program.addCommand(upgradeCommand);

// Parse the CLI arguments
program.parse(process.argv);
