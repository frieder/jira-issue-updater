# Jira Issue Updater - Github Action

[![Build Status](https://img.shields.io/github/actions/workflow/status/frieder/jira-issue-updater/ci-build.yml?label=Build%20Status)](https://github.com/frieder/jira-issue-updater/actions/workflows/ci-build.yml)
[![Sonar Coverage](https://img.shields.io/sonar/coverage/frieder_jira-issue-updater/main?server=https%3A%2F%2Fsonarcloud.io&label=Code%20Coverage)]()
[![Open Issues](https://img.shields.io/github/issues-raw/frieder/jira-issue-updater?label=Open%20Issues)](https://github.com/frieder/jira-issue-updater/issues?q=is%3Aopen+is%3Aissue)
[![Sonar Issues](https://img.shields.io/sonar/violations/frieder_jira-issue-updater/main?format=long&server=https%3A%2F%2Fsonarcloud.io&label=Sonar%20Violations)](https://sonarcloud.io/project/overview?id=frieder_jira-issue-updater)
[![Snyk Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/frieder/jira-issue-updater?label=Snyk%20Vulnerabilities)](https://app.snyk.io/org/frieder)
[![Contributors](https://img.shields.io/github/contributors/frieder/jira-issue-updater.svg?label=Contributors)](https://github.com/frieder/jira-issue-updater/graphs/contributors)

A GitHub action to update properties of an existing Jira issue.

> -   Only supports Jira Cloud.
> -   Requires [Jira Login Action](https://github.com/marketplace/actions/jira-login).

## Usage

```yaml
name: Jira Issue Updater

on: [..]

jobs:
    update-jira-issue:
        name: Update Jira issue
        runs-on: ubuntu-latest
        steps:
            - name: Login
              uses: atlassian/gajira-login@v3
              env:
                  JIRA_BASE_URL: ${{ vars.JIRA_BASE_URL }}
                  JIRA_USER_EMAIL: ${{ vars.JIRA_USER_EMAIL }}
                  JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}

            - name: Update Fields
              uses: frieder/jira-issue-updater@v1.0
              with:
                  retries: 1
                  retryDelay: 10
                  timeout: 2000
                  issue: XYZ-123
                  summary: Some new fancy title
                  description: Plaintext only
                  assignee: 123456:12345678-abcd-abcd-abcd-1234567890ab
                  priority: Lowest
                  duedate: 2023-02-01
                  components: |
                      = component1
                      = component2
                      + component3
                      - component2
                  fixversions: |
                      = 1.0
                      = 1.1
                      + 2.0
                      - 1.1
                  labels: |
                      = foo
                      = foo2
                      = bar2
                      + bar
                      - foo2
                      - bar2
                  customfields: |
                      10050: some value
                      10051: 2023-01-01
                      10052: https://github.com/marketplace?type=action
```

## Configuration Options

### Option: retries

|          |     |
| :------- | :-- |
| Required | no  |
| Default  | 1   |

This option allows to define a number of retries when the HTTP call to the Jira REST API fails (e.g. due to
connectivity issues). By default, the action will attempt one retry and after that report the action as failed.

### Option: retryDelay

|          |     |
| :------- | :-- |
| Required | no  |
| Default  | 10  |

In case the `retries` option is > 0, this option defines the time (in seconds) the action will wait in
between the requests.

### Option: timeout

|          |      |
| :------- | :--- |
| Required | no   |
| Default  | 2000 |

The time (in milliseconds) the action will wait for a request to finish. If the request does not finish in
time it will be considered failed.

### Option: issue

|          |     |
| :------- | :-- |
| Required | yes |
| Default  |     |

The ID of the Jira ticket (e.g. XYZ-123).

> This is the only option that must be provided explicitly. All the following options are optional with the
> requirement that at least one of them is provided. Otherwise this action will not do anything.

### Option: summary

|          |     |
| :------- | :-- |
| Required | no  |
| Default  |     |

Updates the summary (title) of the ticket. <br>
The option is ignored when blank.

### Option: description

|          |     |
| :------- | :-- |
| Required | no  |
| Default  |     |

Updates the description of the ticket. <br>
The option is ignored when blank.

> This option only allows for a simple plaintext to be set. If some rich description with links,
> paragraphs, bullet points, images is required a custom logic must be used which is not covered
> (nor planned!) by this action.

### Option: assignee

|          |     |
| :------- | :-- |
| Required | no  |
| Default  |     |

Updates the assignee of the ticket. For this the ID of the respective user is required.

> To get the ID of yourself just open the profile page and check the URL for the ID.
> Another possibility is to use the [Jira REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-user-search/#api-rest-api-3-user-assignable-search-get).

The option is ignored when blank. To remove the assignee set the value to `REMOVE`.

### Option: priority

|          |     |
| :------- | :-- |
| Required | no  |
| Default  |     |

Updates the priority of the ticket. Possible values are the actual names of the priorities as defined in
`https://ACCOUNT.atlassian.net/secure/admin/ViewPriorities.jspa`. By default, these names are:

-   `Lowest`
-   `Low`
-   `Medium`
-   `High`
-   `Highest`

The option is ignored when blank.

### Option: duedate

|          |     |
| :------- | :-- |
| Required | no  |
| Default  |     |

Updates the due date of the ticket. The format must be in ISO 8601 format - `yyyy-MM-dd`. <br>
The option is ignored when blank. To remove the assignee set the value to `REMOVE`.

### Option: components

|          |     |
| :------- | :-- |
| Required | no  |
| Default  |     |

> Make sure your project template supports components or this option will not work. Also make sure
> the components exist in Jira (check your project's settings) before using them in this action.

Allows to `set|add|remove` components to a Jira ticket. A set of components must be provided with
one entry per line. Depending on the prefix different actions are performed.

-   `=` When a line is prefixed with this character it will be treated like a `SET` action.
-   `+` When a line is prefixed with this character it will be treated like an `ADD` action.
-   `-` When a line is prefixed with this character it will be treated like a `REMOVE` action.
-   `no prefix` - When a line does not have any prefix as described above it will be ignored.

In order for this to work all entries will first be grouped and assigned to one of the three groups.
Afterwards it will create a body payload that includes the `SET` group first followed by the `ADD`
group and then the `REMOVE` group. Check the [Jira REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-put)
for more information.

> When a `SET` group is available it will basically replace whatever was available before. The `ADD`
> group will then add additional entries on top of the new values from the `SET` group. The `REMOVE`
> group will be applied last and will remove entries that were added by the two other groups. The
> usual use-case however is to either use `SET` or a combination of `ADD`and `REMOVE` groups. In most
> cases it does not make sense to mix all three groups in one step.

The option is ignored when blank.

### Option: fixversions

|          |     |
| :------- | :-- |
| Required | no  |
| Default  |     |

> Make sure your project template supports versions or this option will not work. Also make sure
> the versions exist in Jira (check your project's releases) before using them in this action.

Allows to `set|add|remove` fix versions for a Jira ticket. A set of versions must be provided with
one entry per line. Depending on the prefix different actions are performed.

-   `=` When a line is prefixed with this character it will be treated like a `SET` action.
-   `+` When a line is prefixed with this character it will be treated like an `ADD` action.
-   `-` When a line is prefixed with this character it will be treated like a `REMOVE` action.
-   `no prefix` - When a line does not have any prefix as described above it will be ignored.

In order for this to work all entries will first be grouped and assigned to one of the three groups.
Afterwards it will create a body payload that includes the `SET` group first followed by the `ADD`
group and then the `REMOVE` group. Check the [Jira REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-put)
for more information.

> When a `SET` group is available it will basically replace whatever was available before. The `ADD`
> group will then add additional entries on top of the new values. The `REMOVE` group will then
> remove entries that were added by the two other groups. The usual use-case however is to either
> use `SET` or a combination of `ADD`and `REMOVE` groups. It does not make sense to mix all three groups
> in one step.

The option is ignored when blank.

### Option: labels

|          |     |
| :------- | :-- |
| Required | no  |
| Default  |     |

Allows to `set|add|remove` labels to a Jira ticket. A set of labels must be provided with
one entry per line. Depending on the prefix different actions are performed.

-   `=` When a line is prefixed with this character it will be treated like a `SET` action.
-   `+` When a line is prefixed with this character it will be treated like an `ADD` action.
-   `-` When a line is prefixed with this character it will be treated like a `REMOVE` action.
-   `no prefix` - When a line does not have any prefix as described above it will be ignored.

In order for this to work all entries will first be grouped and assigned to one of the three groups.
Afterwards it will create a body payload that includes the `SET` group first followed by the `ADD`
group and then the `REMOVE` group. Check the [Jira REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-put)
for more information.

> When a `SET` group is available it will basically replace whatever was available before. The `ADD`
> group will then add additional entries on top of the new values. The `REMOVE` group will then
> remove entries that were added by the two other groups. The usual use-case however is to either
> use `SET` or a combination of `ADD`and `REMOVE` groups. It does not make sense to mix all three groups
> in one step.

> When a value for a non-existing component is used the Jira REST API will create such a component.

The option is ignored when blank.

### Option: customfields

|          |     |
| :------- | :-- |
| Required | no  |
| Default  |     |

Updates the value of custom fields in the Jira ticket. It expects a set of IDs for the custom fields along
with their associated value, separated by a colon (`:`). One entry per line.

> The value of a custom field can contain colons (`:`) as only the first occurance of a colon per line is
> interpreted as a delimiter.

The option is ignored when blank.
