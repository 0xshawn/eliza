#!/usr/bin/env node
import { Command } from "commander";
import { deploy, DeployOptions } from "./index";

// Initialize the commander program
const program = new Command();

// Define the `deploy` command
program
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
        "-s, --secrets <secrets>",
        "Specify the secrets associated with the agent (encrypted)",
    )
    .option(
        "-c, --compose <compose>",
        "Specify the docker compose file to be deployed",
    )
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
        console.log("Deploying with options:", options);
        deploy(options);
    });

// Parse the CLI arguments
program.parse(process.argv);
