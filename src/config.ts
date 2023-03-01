import { ActionInputs, JiraLogin } from "./types";
import * as core from "@actions/core";
import * as fs from "fs";
import * as YAML from "yaml";

export function getLoginData(): JiraLogin {
    const configPath = `${process.env.HOME}/jira/config.yml`;
    const login: JiraLogin = YAML.parse(fs.readFileSync(configPath, "utf8"));

    _verifyLogin(login);

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

    _verifyInputs(inputs);

    return inputs;
}

function _verifyLogin(login: JiraLogin) {
    if (!login.baseUrl || !login.email || !login.token) {
        throw new Error(
            "All login properties must be set. Do you use the jira-login action properly?"
        );
    }
}

function _getNumber(name: string, defaultValue: number): number {
    const value = core.getInput(name, { required: false });
    if (!value || value.length === 0) {
        return defaultValue;
    }
    return value.match(/^\d+$/) ? Number(value) : defaultValue;
}

function _verifyInputs(inputs: ActionInputs) {
    if (!inputs.issue) {
        throw new Error("The issue property must be set.");
    }
    if (
        !(
            inputs.summary &&
            inputs.description &&
            inputs.assignee &&
            inputs.priority &&
            inputs.duedate &&
            inputs.components &&
            inputs.fixversions &&
            inputs.labels &&
            inputs.customfields
        )
    ) {
        throw new Error(
            "At least one of the input properties [summary, description, assignee, priority, " +
                "duedate, components, fixversions, labels, customfields] must be set"
        );
    }
}
