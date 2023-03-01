import * as core from "@actions/core";
import { ActionInputs } from "./types";
import { getInputs, getLoginData } from "./config";
import { createPayload } from "./payload";
import { sendRequest } from "./request";
import { AxiosError } from "axios";

let inputs: ActionInputs;

function run() {
    try {
        const login = getLoginData();
        inputs = getInputs();
        const payload = createPayload(inputs);
        sendRequest(login, inputs, payload)
            .then(() => console.log(`Jira issue [${inputs.issue}] update successful.`))
            .catch((error: AxiosError) => {
                core.setFailed(`Jira issue [${inputs?.issue}] update failed.`);
                console.log("HTTP response:");
                console.log(error.response);
            });
    } catch (error) {
        core.setFailed(`Jira issue [${inputs?.issue}] update failed.`);
        console.debug(error);
    }
}

run();
