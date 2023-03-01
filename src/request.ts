import { ActionInputs, JiraLogin } from "./types";
import axios, { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";

export async function sendRequest(jira: JiraLogin, inputs: ActionInputs, payload: any) {
    const httpClient = _createHTTPClient(jira, inputs);
    _setRetrySettings(httpClient, inputs);
    await httpClient.put(`/rest/api/3/issue/${inputs.issue}`, payload);
}

function _createHTTPClient(jira: JiraLogin, inputs: ActionInputs): AxiosInstance {
    return axios.create({
        baseURL: jira.baseUrl,
        auth: {
            username: jira.email,
            password: jira.token,
        },
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        timeout: inputs.timeout,
    });
}

function _setRetrySettings(httpClient: AxiosInstance, inputs: ActionInputs) {
    axiosRetry(httpClient, {
        retries: inputs.retries,
        retryCondition: () => true,
        retryDelay: () => inputs.retryDelay * 1000,
        shouldResetTimeout: true,
        onRetry: (retryCount, error) => {
            console.log(
                `[${retryCount}/${inputs.retries}] Request failed with rc = ${error.response?.status}, wait for ${inputs.retryDelay} seconds and try again`
            );
        },
    });
}
