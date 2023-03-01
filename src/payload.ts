import { ActionInputs, Entry, GroupedEntries } from "./types";

export function createPayload(inputs: ActionInputs): any {
    const payload = {
        fields: {},
        update: {},
    };

    _addSummary(inputs.summary, payload);
    _addDueDate(inputs.duedate, payload);

    _addDescription(inputs.description, payload);
    _addAssignee(inputs.assignee, payload);
    _addPriority(inputs.priority, payload);

    _addComponents(inputs.components, payload);
    _addFixVersions(inputs.fixversions, payload);
    _addLabels(inputs.labels, payload);

    _addCustomFields(inputs.customfields, payload);

    return payload;
}

function _addSummary(value: string, payload: any) {
    if (!value) {
        return;
    }

    payload.fields["summary"] = value;
}

function _addDueDate(value: string, payload: any) {
    if (!value) {
        return;
    }

    payload.fields["duedate"] = value !== "REMOVE" ? value : null;
}

function _addDescription(description: string, payload: any) {
    if (!description) {
        return;
    }

    payload.fields["description"] = {
        type: "doc",
        version: 1,
        content: [
            {
                type: "paragraph",
                content: [
                    {
                        text: description,
                        type: "text",
                    },
                ],
            },
        ],
    };
}

function _addAssignee(assignee: string, payload: any) {
    if (!assignee) {
        return;
    }

    payload.fields["assignee"] = {
        accountId: assignee !== "REMOVE" ? assignee : null,
    };
}

function _addPriority(priority: string, payload: any) {
    if (!priority) {
        return;
    }

    payload.fields["priority"] = {
        name: priority,
    };
}

function _addComponents(components: string[], payload: any) {
    if (!components || components.length === 0) {
        return;
    }

    const entries = _groupEntries(components);
    _addComponentsToPayload(entries, payload);
}

function _addFixVersions(fixVersions: string[], payload: any) {
    if (!fixVersions || fixVersions.length === 0) {
        return;
    }

    const entries = _groupEntries(fixVersions);
    _addFixVersionsToPayload(entries, payload);
}

function _addLabels(labels: string[], payload: any) {
    if (!labels || labels.length === 0) {
        return;
    }

    const entries = _groupEntries(labels);
    _addLabelsToPayload(entries, payload);
}

function _addCustomFields(customFields: string[], payload: any) {
    if (!customFields) {
        return;
    }

    const entries = _extractCustomFields(customFields);
    _addCustomFieldsToPayload(entries, payload);
}

function _groupEntries(rawEntries: string[]): GroupedEntries {
    const entries: GroupedEntries = { set: [], add: [], remove: [] };
    const regex = /^([=+-])\s+(\S.*)$/gi;

    rawEntries.forEach((line) => {
        const match = regex.exec(line);

        if (match && match.length === 3) {
            const entry: Entry = { key: match[1], value: match[2].trim() };

            switch (match[1]) {
                case "=":
                    entries.set.push(entry);
                    break;
                case "+":
                    entries.add.push(entry);
                    break;
                case "-":
                    entries.remove.push(entry);
            }
        }

        regex.lastIndex = 0;
    });

    return entries;
}

function _extractCustomFields(rawEntries: string[]): Entry[] {
    const entries: Entry[] = [];
    const regex = /^(\d+)\s*:\s*(\S.*)$/gi;

    rawEntries.forEach((line) => {
        const match = regex.exec(line);

        if (match && match.length === 3) {
            entries.push({ key: match[1], value: match[2].trim() });
        }

        regex.lastIndex = 0;
    });

    return entries;
}

function _addComponentsToPayload(entries: GroupedEntries, payload: any) {
    payload.update["components"] = [];

    if (entries.set.length > 0) {
        const obj: any = { set: [] };
        entries.set.forEach((entry) => {
            obj.set.push({ name: entry.value });
        });
        payload.update.components.push(obj);
    }

    entries.add.forEach((entry) => {
        payload.update.components.push({
            add: {
                name: entry.value,
            },
        });
    });

    entries.remove.forEach((entry) => {
        payload.update.components.push({
            remove: {
                name: entry.value,
            },
        });
    });
}

function _addFixVersionsToPayload(entries: GroupedEntries, payload: any) {
    payload.update["fixVersions"] = [];

    if (entries.set.length > 0) {
        const obj: any = { set: [] };
        entries.set.forEach((entry) => {
            obj.set.push({ name: entry.value });
        });
        payload.update.fixVersions.push(obj);
    }

    entries.add.forEach((entry) => {
        payload.update.fixVersions.push({
            add: {
                name: entry.value,
            },
        });
    });

    entries.remove.forEach((entry) => {
        payload.update.fixVersions.push({
            remove: {
                name: entry.value,
            },
        });
    });
}

function _addLabelsToPayload(entries: GroupedEntries, payload: any) {
    payload.update["labels"] = [];

    if (entries.set.length > 0) {
        const obj: any = { set: [] };
        entries.set.forEach((entry) => {
            obj.set.push(entry.value);
        });
        payload.update.labels.push(obj);
    }

    entries.add.forEach((entry) => {
        payload.update.labels.push({ add: entry.value });
    });

    entries.remove.forEach((entry) => {
        payload.update.labels.push({ remove: entry.value });
    });
}

function _addCustomFieldsToPayload(entries: Entry[], payload: any) {
    entries.forEach((entry) => {
        payload.fields[`customfield_${entry.key}`] = entry.value;
    });
}
