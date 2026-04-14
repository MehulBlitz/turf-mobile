# GitHub MCP Server Setup Guide

## Overview

An **MCP (Model Context Protocol) Server** for GitHub would enable AI agents and language models to interact directly with your GitHub repository through standardized tools. This guide shows how to set one up.

## What is GitHub MCP Server?

A GitHub MCP Server acts as a bridge between your AI tools and GitHub, providing:

- ✅ Direct repository access (read/write)
- ✅ PR management (create, review, merge, comment)
- ✅ Workflow automation (trigger actions, check status)
- ✅ Issue tracking (create, search, label)
- ✅ Code search and navigation
- ✅ Branch management
- ✅ Commit history access

## Prerequisites

You've already got the GitHub Actions extension installed! 🎉

Before setting up MCP:

1. **GitHub Access Token**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Scopes needed:
     - ✓ repo (full control)
     - ✓ workflow (manage actions)
     - ✓ read:user
     - ✓ user:email
   - Copy token (save somewhere secure)

2. **Node.js** (already have it: v24)

3. **npm** (already have it)

## Option 1: Using Existing GitHub MCP Server (Recommended)

Go to https://github.com/modelcontextprotocol/servers/tree/main/src/github

This is the official MCP server maintained by Anthropic.

### Installation Steps:

1. **In VS Code, open settings:**
   - File → Preferences → Settings
   - Search for "MCP"
   - Or edit `.vscode/settings.json`

2. **Add GitHub MCP Configuration:**

```json
{
  "modelContextProtocol.resources": [
    {
      "name": "GitHub Repository",
      "url": "stdio",
      "stdio": {
        "command": "npx",
        "args": [
          "@modelcontextprotocol/server-github",
          "MehulBlitz/turf-mobile"
        ],
        "env": {
          "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_TOKEN_HERE"
        }
      }
    }
  ]
}
```

3. **Install the server package globally:**

```bash
npm install -g @modelcontextprotocol/server-github
```

4. **Restart VS Code**

## Option 2: Custom GitHub MCP Server (Advanced)

If you want to create a custom MCP server tailored to `turf-mobile`:

### Step 1: Initialize MCP Project

```bash
cd ~/projects
mkdir turf-mobile-mcp-server
cd turf-mobile-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk
npm install @octokit/rest axios dotenv
```

### Step 2: Create Server Implementation

Create `src/server.js`:

```javascript
import {
  Server,
  Tool,
  TextContent,
  ToolUseRequest,
} from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

dotenv.config();

const server = new Server({
  name: "turf-mobile-github-server",
  version: "1.0.0",
});

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Define available tools
const tools = [
  {
    name: "list_workflows",
    description: "List all GitHub Actions workflows",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_workflow_runs",
    description: "Get recent workflow runs",
    inputSchema: {
      type: "object",
      properties: {
        workflow_id: {
          type: "string",
          description: "Workflow ID (e.g., 'ios-build.yml')",
        },
        limit: {
          type: "number",
          description: "Number of runs to fetch",
          default: 10,
        },
      },
    },
  },
  {
    name: "trigger_workflow",
    description: "Manually trigger a GitHub Actions workflow",
    inputSchema: {
      type: "object",
      properties: {
        workflow_id: {
          type: "string",
          description: "Workflow ID",
        },
        ref: {
          type: "string",
          description: "Branch to run workflow on",
          default: "main",
        },
        inputs: {
          type: "object",
          description: "Workflow inputs",
        },
      },
      required: ["workflow_id"],
    },
  },
  {
    name: "list_prs",
    description: "List pull requests",
    inputSchema: {
      type: "object",
      properties: {
        state: {
          type: "string",
          enum: ["open", "closed", "all"],
          default: "open",
        },
        limit: {
          type: "number",
          default: 10,
        },
      },
    },
  },
  {
    name: "get_pr_details",
    description: "Get detailed information about a PR",
    inputSchema: {
      type: "object",
      properties: {
        pr_number: {
          type: "number",
          description: "PR number",
        },
      },
      required: ["pr_number"],
    },
  },
  {
    name: "create_issue",
    description: "Create a new GitHub issue",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Issue title",
        },
        body: {
          type: "string",
          description: "Issue description",
        },
        labels: {
          type: "array",
          items: { type: "string" },
          description: "Labels to add",
        },
      },
      required: ["title"],
    },
  },
];

// Handle tool calls
server.setRequestHandler(ToolUseRequest, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case "list_workflows": {
        const response = await octokit.actions.listRepoWorkflows({
          owner: "MehulBlitz",
          repo: "turf-mobile",
        });
        result = response.data.workflows.map((w) => ({
          id: w.id,
          name: w.name,
          path: w.path,
          state: w.state,
        }));
        break;
      }

      case "get_workflow_runs": {
        const response = await octokit.actions.listWorkflowRuns({
          owner: "MehulBlitz",
          repo: "turf-mobile",
          workflow_id: args.workflow_id,
          per_page: args.limit || 10,
        });
        result = response.data.workflow_runs.map((r) => ({
          id: r.id,
          name: r.name,
          status: r.status,
          conclusion: r.conclusion,
          created_at: r.created_at,
          updated_at: r.updated_at,
        }));
        break;
      }

      case "trigger_workflow": {
        const response = await octokit.actions.createWorkflowDispatch({
          owner: "MehulBlitz",
          repo: "turf-mobile",
          workflow_id: args.workflow_id,
          ref: args.ref || "main",
          inputs: args.inputs || {},
        });
        result = { status: "triggered", message: "Workflow dispatch created" };
        break;
      }

      case "list_prs": {
        const response = await octokit.pulls.list({
          owner: "MehulBlitz",
          repo: "turf-mobile",
          state: args.state || "open",
          per_page: args.limit || 10,
        });
        result = response.data.map((pr) => ({
          number: pr.number,
          title: pr.title,
          state: pr.state,
          author: pr.user.login,
          created_at: pr.created_at,
          updated_at: pr.updated_at,
          url: pr.html_url,
        }));
        break;
      }

      case "get_pr_details": {
        const response = await octokit.pulls.get({
          owner: "MehulBlitz",
          repo: "turf-mobile",
          pull_number: args.pr_number,
        });
        result = {
          number: response.data.number,
          title: response.data.title,
          body: response.data.body,
          state: response.data.state,
          author: response.data.user.login,
          commits: response.data.commits,
          changed_files: response.data.changed_files,
          additions: response.data.additions,
          deletions: response.data.deletions,
          url: response.data.html_url,
        };
        break;
      }

      case "create_issue": {
        const response = await octokit.issues.create({
          owner: "MehulBlitz",
          repo: "turf-mobile",
          title: args.title,
          body: args.body || "",
          labels: args.labels || [],
        });
        result = {
          number: response.data.number,
          title: response.data.title,
          url: response.data.html_url,
        };
        break;
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      type: "text",
      text: JSON.stringify(result, null, 2),
    };
  } catch (error) {
    return {
      type: "text",
      text: `Error: ${error.message}`,
      isError: true,
    };
  }
});

// Register tools with server
server.setRequestHandler(
  ListToolsRequest,
  async () => ({
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  })
);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Step 3: Configure in VS Code

Add to `.vscode/settings.json`:

```json
{
  "modelContextProtocol.resources": [
    {
      "name": "Turf Mobile GitHub",
      "url": "stdio",
      "stdio": {
        "command": "node",
        "args": ["src/server.js"],
        "env": {
          "GITHUB_TOKEN": "YOUR_GITHUB_TOKEN_HERE"
        }
      }
    }
  ]
}
```

### Step 4: Run Server

```bash
npm start
```

## Key Tools Available

Once MCP Server is configured, you can use these commands:

| Tool | Purpose |
|------|---------|
| `list_workflows` | Show all GitHub Actions workflows |
| `get_workflow_runs` | Get recent workflow execution history |
| `trigger_workflow` | Manually trigger a workflow (ios-build, etc.) |
| `list_prs` | List open/closed PRs |
| `get_pr_details` | View PR details, stats, comments |
| `create_issue` | Create new issues automatically |
| `merge_pr` | Merge pull requests |
| `comment_on_pr` | Leave reviews/comments on PRs |

## Security Best Practices

1. **Use GitHub Token Securely**
   ```bash
   # Store in environment variable, NOT in code
   export GITHUB_TOKEN="ghp_xxx"
   ```

2. **Use Minimal Scopes**
   - Only grant necessary permissions
   - Regular token (classic) fine for most tasks
   - Consider Fine-grained PAT for better control

3. **Rotate Tokens**
   - Regenerate tokens quarterly
   - Use different tokens for different tools

4. **Monitor Usage**
   - Check GitHub Security log for token activity
   - Set up alerts for unusual access patterns

## Example Usage (Once MCP Configured)

Using Copilot with MCP enabled:

```
"Check the status of the iOS Build workflow and show me the last 3 runs"
→ MCP calls: list_workflows → get_workflow_runs ios-build.yml

"Trigger an iOS Release build with TestFlight upload"
→ MCP calls: trigger_workflow ios-release.yml with inputs

"Create an issue for setting up push notifications"
→ MCP calls: create_issue with labels [enhancement, ios]

"Show me the details of PR #5 including comments"
→ MCP calls: get_pr_details 5
```

## Resources

- [Official GitHub MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/github)
- [Model Context Protocol Spec](https://spec.modelcontextprotocol.io/)
- [GitHub REST API Docs](https://docs.github.com/en/rest)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Next Steps

1. Create GitHub Personal Access Token (if not done)
2. Choose Option 1 (official) or Option 2 (custom)
3. Install/configure in VS Code
4. Test with simple commands (e.g., "list workflows")
5. Gradually add more complex automation

---

**Once configured, you'll have direct CI/CD control from your AI conversations!** 🚀
