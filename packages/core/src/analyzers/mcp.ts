import { finding } from "../findings/helpers.js";
import type { Finding, McpAnalysis, McpToolAnalysis, ProjectSignals } from "../schemas/types.js";

const ambiguousNames = new Set([
  "run",
  "query",
  "create",
  "update",
  "delete",
  "tool",
  "call",
  "exec"
]);
const destructiveWords = [
  "delete",
  "remove",
  "write",
  "update",
  "create",
  "drop",
  "truncate",
  "revoke"
];
const privacyWords = [
  "secret",
  "token",
  "auth",
  "private",
  "user",
  "email",
  "database",
  "filesystem",
  "network"
];

interface McpAnalyzerResult {
  analysis: McpAnalysis;
  findings: Finding[];
}

export function analyzeMcp(signals: ProjectSignals): McpAnalyzerResult {
  const files = detectMcpFiles(signals);
  const tools = files.flatMap((file) => extractTools(file, signals.textByPath[file] ?? ""));
  const ambiguousTools = tools.filter((tool) => ambiguousNames.has(tool.name.toLowerCase()));
  const destructiveTools = tools.filter((tool) => tool.destructive);
  const privacySensitiveTools = tools.filter((tool) => tool.privacySensitive);
  const weakTools = tools.filter((tool) => tool.weak);
  const findings: Finding[] = [];

  if (files.length > 0 && tools.length === 0) {
    findings.push(
      finding({
        id: "MCP_TOOL_DEFINITIONS_NOT_PARSED",
        title: "MCP project detected but tool definitions were not parsed",
        severity: "medium",
        category: "mcp_tools",
        description:
          "MCP files or dependencies were detected, but static analysis could not find clear tool registrations.",
        evidence: files.slice(0, 8),
        recommendation:
          "Use explicit registerTool/server.tool definitions with names, descriptions, schemas, and examples.",
        agentFailureMode:
          "A coding agent may know the project exposes MCP but be unable to infer which tools exist or when to use them.",
        fixExample:
          "Register tools with specific names and descriptions, for example registerTool('list_workspace_documents', { description, inputSchema }).",
        suggestedFixType: "update_file"
      })
    );
  }

  pushToolFinding(findings, {
    id: "MCP_TOOL_NAME_AMBIGUOUS",
    title: "MCP tool names are ambiguous",
    severity: "medium",
    tools: ambiguousTools,
    recommendation: "Rename generic tools so the action and resource are obvious.",
    agentFailureMode:
      "A coding agent may choose a generic tool like run or query for the wrong workflow.",
    fixExample: "Use names such as search_docs, create_workspace_ticket, or revoke_api_key."
  });
  pushToolFinding(findings, {
    id: "MCP_TOOL_DESCRIPTION_MISSING",
    title: "MCP tools are missing descriptions",
    severity: "high",
    tools: tools.filter((tool) => !tool.description),
    recommendation: "Add a description explaining when to use the tool and when not to use it.",
    agentFailureMode:
      "A coding agent may call a tool from its name alone and miss preconditions or side effects.",
    fixExample:
      "Description: 'Search public docs by keyword. Do not use for private customer data.'"
  });
  pushToolFinding(findings, {
    id: "MCP_TOOL_DESCRIPTION_SHALLOW",
    title: "MCP tool descriptions are too shallow",
    severity: "medium",
    tools: tools.filter((tool) => tool.description && tool.description.length < 40),
    recommendation: "Expand tool descriptions with intent, constraints, and safe usage guidance.",
    agentFailureMode: "A coding agent may not distinguish similar tools without usage context.",
    fixExample: "Mention input expectations, side effects, auth requirements, and error behavior."
  });
  pushToolFinding(findings, {
    id: "MCP_TOOL_INPUT_SCHEMA_MISSING",
    title: "MCP tools are missing input schemas",
    severity: "high",
    tools: tools.filter((tool) => !tool.hasInputSchema),
    recommendation: "Add structured input schemas with required fields and descriptions.",
    agentFailureMode: "A coding agent may pass malformed arguments or omit required identifiers.",
    fixExample: "Use a zod/object schema with workspace_id and query fields plus descriptions."
  });
  pushToolFinding(findings, {
    id: "MCP_TOOL_EXAMPLE_MISSING",
    title: "MCP tools lack examples or usage notes",
    severity: "low",
    tools: tools.filter((tool) => !tool.hasExamples),
    recommendation: "Add examples or usage notes for common calls.",
    agentFailureMode:
      "A coding agent may not know the expected argument shape or output semantics.",
    fixExample: "Include an example invocation showing realistic placeholder arguments."
  });
  pushToolFinding(findings, {
    id: "MCP_TOOL_DESTRUCTIVE_ACTION_UNMARKED",
    title: "Destructive MCP tools are not clearly marked",
    severity: "high",
    tools: destructiveTools.filter(
      (tool) => !/danger|destructive|irreversible|confirm|permission/i.test(tool.description ?? "")
    ),
    recommendation:
      "Mark destructive tools and document confirmation, permissions, and safe testing behavior.",
    agentFailureMode:
      "A coding agent may call a write/delete tool without realizing it changes external state.",
    fixExample:
      "State that the tool mutates data and requires explicit user approval outside test fixtures."
  });
  pushToolFinding(findings, {
    id: "MCP_TOOL_AUTH_PRIVACY_UNCLEAR",
    title: "Privacy-sensitive MCP tools lack auth/privacy guidance",
    severity: "medium",
    tools: privacySensitiveTools.filter(
      (tool) => !/auth|permission|private|secret|token|privacy/i.test(tool.description ?? "")
    ),
    recommendation:
      "Document credentials, permissions, and private-data handling for sensitive tools.",
    agentFailureMode:
      "A coding agent may expose private data or call a tool without required auth context.",
    fixExample:
      "Mention required token scopes and whether arguments or outputs may contain private data."
  });
  pushToolFinding(findings, {
    id: "MCP_TOOL_ERROR_BEHAVIOR_UNCLEAR",
    title: "MCP tool error behavior is unclear",
    severity: "low",
    tools: tools.filter(
      (tool) => !/error|fail|not found|unauthorized|retry/i.test(tool.description ?? "")
    ),
    recommendation: "Explain common errors and whether retry or user follow-up is appropriate.",
    agentFailureMode:
      "A coding agent may retry unsafe operations or fail silently when a tool returns an error.",
    fixExample: "Document not-found, unauthorized, rate-limit, and validation failures."
  });

  return {
    analysis: {
      detected: files.length > 0,
      files,
      toolCount: tools.length,
      toolsWithSchemas: tools.filter((tool) => tool.hasInputSchema).length,
      toolsWithExamples: tools.filter((tool) => tool.hasExamples).length,
      ambiguousTools: ambiguousTools.map((tool) => `${tool.file}: ${tool.name}`),
      destructiveTools: destructiveTools.map((tool) => `${tool.file}: ${tool.name}`),
      privacySensitiveTools: privacySensitiveTools.map((tool) => `${tool.file}: ${tool.name}`),
      weakTools: weakTools.map((tool) => `${tool.file}: ${tool.name}`)
    },
    findings
  };
}

function detectMcpFiles(signals: ProjectSignals): string[] {
  const dependencies = new Set([
    ...(signals.packageJson?.dependencies ?? []),
    ...(signals.packageJson?.devDependencies ?? [])
  ]);
  const hasMcpPackage = [...dependencies].some((dependency) =>
    /modelcontextprotocol|mcp/i.test(dependency)
  );
  const patternFiles = Object.entries(signals.textByPath)
    .filter(
      ([file, content]) =>
        hasMcpPackage &&
        !file.startsWith("docs/") &&
        /registerTool|server\.tool|new McpServer|@modelcontextprotocol/i.test(content)
    )
    .map(([file]) => file);
  return [
    ...new Set([...signals.mcpFiles.filter((file) => signals.textByPath[file]), ...patternFiles])
  ].sort();
}

function extractTools(file: string, content: string): McpToolAnalysis[] {
  const tools: McpToolAnalysis[] = [];
  const registrationPattern =
    /(?:registerTool|server\.tool|\.tool)\(\s*["'`]([^"'`]+)["'`]\s*,\s*\{([\s\S]*?)\n\}\s*\);/g;
  for (const match of content.matchAll(registrationPattern)) {
    const name = match[1] ?? "unknown_tool";
    const block = match[2] ?? "";
    const description = extractDescription(block);
    const haystack = `${name} ${description ?? ""} ${block}`.toLowerCase();
    const destructive = destructiveWords.some((word) => haystack.includes(word));
    const privacySensitive = privacyWords.some((word) => haystack.includes(word));
    const hasInputSchema = /inputSchema|schema|z\.object|properties\s*:|required\s*:/i.test(block);
    const hasExamples = /example|usage|sample/i.test(block);
    const riskReasons = [
      ambiguousNames.has(name.toLowerCase()) ? "ambiguous name" : undefined,
      !description ? "missing description" : undefined,
      description && description.length < 40 ? "shallow description" : undefined,
      !hasInputSchema ? "missing input schema" : undefined,
      destructive ? "destructive or mutating behavior" : undefined,
      privacySensitive ? "privacy/auth sensitive behavior" : undefined
    ].filter((reason): reason is string => Boolean(reason));
    tools.push({
      name,
      file,
      description,
      hasInputSchema,
      hasExamples,
      destructive,
      privacySensitive,
      weak: riskReasons.length > 0,
      riskReasons
    });
  }
  return tools;
}

function extractDescription(block: string): string | undefined {
  const propertyMatch = block.match(/description\s*:\s*["'`]([^"'`]+)["'`]/i);
  if (propertyMatch?.[1]) return propertyMatch[1];
  const stringArgument = block.match(/^\s*["'`]([^"'`]+)["'`]/);
  return stringArgument?.[1];
}

function pushToolFinding(
  findings: Finding[],
  input: {
    id: string;
    title: string;
    severity: Finding["severity"];
    tools: McpToolAnalysis[];
    recommendation: string;
    agentFailureMode: string;
    fixExample: string;
  }
): void {
  if (input.tools.length === 0) return;
  findings.push(
    finding({
      id: input.id,
      title: input.title,
      severity: input.severity,
      category: "mcp_tools",
      description: `${input.tools.length} MCP tool(s) need stronger agent-facing metadata.`,
      evidence: input.tools.slice(0, 8).map((tool) => `${tool.file}: ${tool.name}`),
      recommendation: input.recommendation,
      agentFailureMode: input.agentFailureMode,
      fixExample: input.fixExample,
      affectedFile: input.tools[0]?.file,
      suggestedFixType: "update_file"
    })
  );
}
