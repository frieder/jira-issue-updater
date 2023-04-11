import { error, info, setFailed, setOutput } from "@actions/core";
import { getInputs, getLoginData } from "./config";
import { createPayload } from "./payload";
import { sendRequest } from "./request";
import { AxiosError } from "axios";

let hasErrors = false;
const success: string[] = [];
const failed: string[] = [];

async function run() {
    const login = getLoginData();
    const inputs = getInputs();
    const payload = createPayload(inputs);

    const promises: Promise<void>[] = [];

    for (const issue of inputs.issue) {
        promises.push(
            sendRequest(login, issue, inputs, payload)
                .then(() => {
                    success.push(issue);
                    info(`Update of Jira issue [${issue}] successful.`);
                })
                .catch((err: AxiosError) => {
                    if (inputs.failOnError) {
                        setFailed(`Update of Jira issue ${issue} failed`);
                    } else {
                        hasErrors = true;
                        failed.push(issue);
                        info(`Update of Jira issue ${issue} failed`);
                    }
                    error(JSON.stringify(err));
                })
        );
    }

    await Promise.all(promises).then(() => {
        setOutput("hasErrors", hasErrors);
        setOutput("successful", success.join(inputs._issueDelimiter));
        setOutput("failed", failed.join(inputs._issueDelimiter));
    });
}

run().catch((err: any) => {
    setFailed("An unexpected exception has occurred. Check debug output for more info");
    error(err);
});
