import { ActionInputs, JiraLogin } from "./types";
import * as core from "@actions/core";
import * as fs from "fs";
import * as YAML from "yaml";

export function getLoginData(): JiraLogin {
    const configPath = `${process.env.HOME}/jira/config.yml`;
    const login: JiraLogin = YAML.parse(fs.readFileSync(configPath, "utf8"));

    if (
        !login.baseUrl ||
        login.baseUrl.length === 0 ||
        !login.email ||
        login.email.length === 0 ||
        !login.token ||
        login.token.length === 0
    ) {
        throw new Error(
            "All login properties must be set. Did you configure the jira-login action properly?"
        );
    }

    return login;
}

export function getInputs(): ActionInputs {
    const inputs: ActionInputs = {
        retries: _getNumber("retries", 1),
        retryDelay: _getNumber("retryDelay", 10),
        timeout: _getNumber("timeout", 2000),
        issue: core.getInput("issue", { required: false }),
        summary: core.getInput("summary", { required: false }),
        description: core.getInput("description", { required: false }),
        assignee: core.getInput("assignee", { required: false }),
        priority: core.getInput("priority", { required: false }),
        duedate: core.getInput("duedate", { required: false }),
        components: core.getMultilineInput("components", { required: false }),
        fixversions: core.getMultilineInput("fixversions", { required: false }),
        labels: core.getMultilineInput("labels", { required: false }),
        customfields: core.getMultilineInput("customfields", {
            required: false,
        }),
    };

    if (!inputs.issue || inputs.issue.length === 0) {
        throw new Error("The issue property must be set.");
    }

    return inputs;
}

function _getNumber(name: string, defaultValue: number): number {
    const value = core.getInput(name, { required: false });
    if (!value || value.length === 0) {
        return defaultValue;
    }
    return value.match(/^\d+$/) ? Number(value) : defaultValue;
}
