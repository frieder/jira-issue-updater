import { ActionInputs, JiraLogin } from "./types";
import { getBooleanInput, getInput, getMultilineInput, InputOptions } from "@actions/core";
import * as fs from "fs";
import * as YAML from "yaml";

const inputOpts: InputOptions = { required: false, trimWhitespace: true };

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
    let issue: string[] = [];
    let delim = "";

    const rawInput: string[] = getMultilineInput("issue", { ...inputOpts, required: true });
    if (rawInput.length == 1) {
        issue = rawInput[0].split(",").map((str) => str.trim());
        delim = rawInput[0].includes(",") ? "," : "";
    } else {
        issue = rawInput.map((str) => str.trim());
        delim = "\n";
    }

    const inputs: ActionInputs = {
        retries: _getNumber("retries", 1),
        retryDelay: _getNumber("retryDelay", 10),
        timeout: _getNumber("timeout", 2000),
        failOnError: getBooleanInput("failOnError", inputOpts),
        issue: issue,
        summary: getInput("summary", inputOpts),
        description: getInput("description", inputOpts),
        assignee: getInput("assignee", inputOpts),
        priority: getInput("priority", inputOpts),
        duedate: getInput("duedate", inputOpts),
        resolution: getInput("resolution", inputOpts),
        components: getMultilineInput("components", inputOpts),
        fixversions: getMultilineInput("fixversions", inputOpts),
        labels: getMultilineInput("labels", inputOpts),
        customfields: getMultilineInput("customfields", inputOpts),
        customfieldsJson: getMultilineInput("customfieldsJson", inputOpts),
        _issueDelimiter: delim,
    };

    if (!inputs.issue || inputs.issue.length === 0) {
        throw new Error("The issue property must be set.");
    }

    return inputs;
}

function _getNumber(name: string, defaultValue: number): number {
    const value = getInput(name, inputOpts);
    if (!value || value.length === 0) {
        return defaultValue;
    }
    return value.match(/^\d+$/) ? Number(value) : defaultValue;
}
