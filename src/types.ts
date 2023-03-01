export type JiraLogin = {
    baseUrl: string;
    email: string;
    token: string;
};

export type ActionInputs = {
    retries: number;
    retryDelay: number;
    timeout: number;
    issue: string;
    summary: string;
    description: string;
    assignee: string;
    priority: string;
    duedate: string;
    components: string[];
    fixversions: string[];
    labels: string[];
    customfields: string[];
};

export type Entry = {
    key: string;
    value: string;
};

export type GroupedEntries = {
    set: Entry[];
    add: Entry[];
    remove: Entry[];
};
