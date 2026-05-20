import { parse as parseYaml } from "yaml";
import { finding } from "../findings/helpers.js";
import type { ApiAnalysis, Finding, ProjectSignals } from "../schemas/types.js";

type JsonObject = Record<string, unknown>;

const httpMethods = new Set(["get", "post", "put", "patch", "delete"]);
const errorStatusCodes = ["400", "401", "403", "404", "409", "429", "500"];
const destructiveWords = ["delete", "cancel", "refund", "revoke", "close", "remove"];
const genericOperationNames = new Set([
  "get",
  "list",
  "create",
  "update",
  "delete",
  "run",
  "query",
  "execute",
  "submit"
]);

interface OperationRecord {
  file: string;
  method: string;
  path: string;
  operation: JsonObject;
}

export interface OpenApiAnalyzerResult {
  analysis: ApiAnalysis;
  findings: Finding[];
}

export function analyzeOpenApi(signals: ProjectSignals): OpenApiAnalyzerResult {
  const specs = signals.openApiFiles
    .map((file) => ({ file, spec: parseSpec(signals.textByPath[file]) }))
    .filter((entry): entry is { file: string; spec: JsonObject } => Boolean(entry.spec));
  const operations = specs.flatMap(({ file, spec }) => collectOperations(file, spec));
  const authSchemes = specs.flatMap(({ spec }) => securitySchemes(spec));
  const operationLabels = operations.map(labelOperation);
  const destructiveOperations = operations.filter(isDestructiveOperation).map(labelOperation);
  const operationsWithExamples = operations.filter(
    (operation) => hasRequestExample(operation.operation) || hasResponseExample(operation.operation)
  ).length;
  const operationsMissingDescriptions = operations.filter(({ operation }) =>
    weakText(stringValue(operation.description), 32)
  ).length;
  const weakOperations = operations.filter(isWeakOperation).map(labelOperation);
  const highRiskOperations = operations
    .filter(
      (operation) => isDestructiveOperation(operation) || !hasErrorResponses(operation.operation)
    )
    .map(labelOperation);

  const findings: Finding[] = [];
  findings.push(...specLevelFindings(specs));
  findings.push(...operationQualityFindings(operations));

  return {
    analysis: {
      specFiles: specs.map((entry) => entry.file),
      operationCount: operations.length,
      operationsWithExamples,
      operationsMissingDescriptions,
      destructiveOperations,
      authSchemes,
      weakOperations: weakOperations.slice(0, 20),
      highRiskOperations: highRiskOperations.slice(0, 20)
    },
    findings:
      operationLabels.length === 0 && specs.length > 0
        ? [...findings, noOperationsFinding(specs[0]?.file)]
        : findings
  };
}

function parseSpec(content: string | undefined): JsonObject | undefined {
  if (!content) return undefined;
  try {
    const parsed: unknown = content.trim().startsWith("{")
      ? (JSON.parse(content) as unknown)
      : (parseYaml(content) as unknown);
    return asObject(parsed);
  } catch {
    return undefined;
  }
}

function collectOperations(file: string, spec: JsonObject): OperationRecord[] {
  const paths = asObject(spec.paths);
  if (!paths) return [];
  const operations: OperationRecord[] = [];
  for (const [apiPath, pathItem] of Object.entries(paths)) {
    const pathObject = asObject(pathItem);
    if (!pathObject) continue;
    for (const [method, operation] of Object.entries(pathObject)) {
      if (!httpMethods.has(method.toLowerCase())) continue;
      const operationObject = asObject(operation);
      if (!operationObject) continue;
      operations.push({
        file,
        method: method.toUpperCase(),
        path: apiPath,
        operation: operationObject
      });
    }
  }
  return operations;
}

function specLevelFindings(specs: Array<{ file: string; spec: JsonObject }>): Finding[] {
  const findings: Finding[] = [];
  for (const { file, spec } of specs) {
    const info = asObject(spec.info);
    const description = stringValue(info?.description);
    const authSchemes = securitySchemes(spec);
    const fullText = JSON.stringify(spec).toLowerCase();
    if (weakText(description, 40)) {
      findings.push(
        finding({
          id: "OPENAPI_WEAK_SPEC_DESCRIPTION",
          title: "OpenAPI spec description is too thin for agents",
          severity: "medium",
          category: "api_schema",
          description:
            "The API-level description does not explain product concepts, auth expectations, or common workflows.",
          evidence: [`${file}: info.description is missing or shorter than 40 characters.`],
          recommendation:
            "Add a concise overview of the API domain, common workflows, auth model, and safe usage constraints.",
          agentFailureMode:
            "A coding agent may jump straight to endpoints without understanding product nouns, authentication, or workflow ordering.",
          fixExample:
            "Describe the main resources, required authentication, common create/list/update flows, and where to find examples.",
          affectedFile: file,
          suggestedFixType: "update_file"
        })
      );
    }
    if (
      authSchemes.length === 0 &&
      !/(api key|bearer|oauth|authorization|authentication)/i.test(fullText)
    ) {
      findings.push(
        finding({
          id: "OPENAPI_AUTH_UNCLEAR",
          title: "OpenAPI authentication is unclear",
          severity: "high",
          category: "api_schema",
          description: "No security scheme or clear authentication guidance was detected.",
          evidence: [
            `${file}: components.securitySchemes is missing and auth hints were not found.`
          ],
          recommendation:
            "Document the auth scheme, required headers, scopes, and placeholder-safe example credentials.",
          agentFailureMode:
            "A coding agent may generate client code without the required Authorization header or may invent unsafe credential handling.",
          fixExample:
            "Add an HTTP bearer or API key security scheme and a request example using EXAMPLE_API_KEY.",
          affectedFile: file,
          suggestedFixType: "update_file"
        })
      );
    }
    if (!Array.isArray(spec.servers) && !stringValue(spec.host)) {
      findings.push(
        finding({
          id: "OPENAPI_SERVER_URL_MISSING",
          title: "OpenAPI server URL is missing",
          severity: "low",
          category: "api_schema",
          description: "Agents need a base URL signal to generate usable client examples.",
          evidence: [`${file}: servers is missing.`],
          recommendation:
            "Add production and sandbox server URLs, or explain how agents should configure the base URL.",
          agentFailureMode: "A coding agent may invent a base URL or hardcode the wrong host.",
          fixExample: "Add servers: [{ url: 'https://api.example.com/v1' }].",
          affectedFile: file,
          suggestedFixType: "update_file"
        })
      );
    }
  }
  return findings;
}

function operationQualityFindings(operations: OperationRecord[]): Finding[] {
  const findings: Finding[] = [];
  const missingOperationIds = operations.filter((operation) =>
    weakOperationId(operation.operation)
  );
  const weakDescriptions = operations.filter(({ operation }) =>
    weakText(stringValue(operation.description), 32)
  );
  const missingRequestExamples = operations.filter(
    (operation) =>
      ["POST", "PUT", "PATCH"].includes(operation.method) && !hasRequestExample(operation.operation)
  );
  const missingResponseExamples = operations.filter(
    (operation) => !hasResponseExample(operation.operation)
  );
  const missingErrorResponses = operations.filter(
    (operation) => !hasErrorResponses(operation.operation)
  );
  const ambiguousNames = operations.filter((operation) =>
    ambiguousOperationName(operation.operation)
  );
  const unmarkedDestructive = operations.filter(
    (operation) =>
      isDestructiveOperation(operation) && !destructiveOperationMarked(operation.operation)
  );
  const paginationUnclear = operations.filter(
    (operation) =>
      likelyListOperation(operation) &&
      !operationMentions(operation.operation, /(page|cursor|limit|offset|next)/i)
  );
  const rateLimitUnclear =
    operations.length > 0 &&
    !operations.some((operation) =>
      operationMentions(operation.operation, /(rate limit|429|too many requests|retry-after)/i)
    );

  pushAggregate(findings, {
    id: "OPENAPI_MISSING_OPERATION_ID",
    title: "OpenAPI operations have weak or missing operationIds",
    severity: "medium",
    records: missingOperationIds,
    recommendation:
      "Give every operation a stable, specific operationId such as createWorkspaceInvite or listCustomerInvoices.",
    agentFailureMode:
      "A coding agent may generate confusing client methods or call the wrong endpoint when operation IDs are missing or generic.",
    fixExample:
      "Use verb+noun names that distinguish similar operations, for example revokeApiKey instead of delete."
  });
  pushAggregate(findings, {
    id: "OPENAPI_WEAK_OPERATION_DESCRIPTION",
    title: "OpenAPI operations have weak descriptions",
    severity: "medium",
    records: weakDescriptions,
    recommendation:
      "Add operation descriptions explaining when to use the endpoint, required context, side effects, and recovery behavior.",
    agentFailureMode:
      "A coding agent may choose the wrong operation because summaries alone do not explain intent or preconditions.",
    fixExample:
      "Add descriptions that mention required IDs, auth scope, side effects, and common failure handling."
  });
  pushAggregate(findings, {
    id: "OPENAPI_MISSING_REQUEST_EXAMPLE",
    title: "Write operations lack request examples",
    severity: "medium",
    records: missingRequestExamples,
    recommendation:
      "Add request examples for create/update operations using realistic placeholder values.",
    agentFailureMode:
      "A coding agent may send malformed payloads or omit required fields because no concrete request shape is shown.",
    fixExample:
      "Add an example body with workspace_id, customer_id, and idempotency_key where relevant."
  });
  pushAggregate(findings, {
    id: "OPENAPI_MISSING_RESPONSE_EXAMPLE",
    title: "Operations lack response examples",
    severity: "low",
    records: missingResponseExamples,
    recommendation: "Add response examples for successful and important error cases.",
    agentFailureMode:
      "A coding agent may write incorrect parsing code because expected response shapes are not exemplified.",
    fixExample:
      "Add 200/201 response examples with IDs, timestamps, pagination cursors, and nested objects."
  });
  pushAggregate(findings, {
    id: "OPENAPI_MISSING_ERROR_RESPONSES",
    title: "Operations lack common error responses",
    severity: "medium",
    records: missingErrorResponses,
    recommendation:
      "Document likely 400/401/403/404/409/429/500 responses and how callers should recover.",
    agentFailureMode:
      "A coding agent may generate happy-path-only integrations with no auth, retry, or validation recovery.",
    fixExample:
      "Add 401, 404, 409, and 429 responses with short descriptions and example error payloads."
  });
  pushAggregate(findings, {
    id: "OPENAPI_AMBIGUOUS_OPERATION_NAME",
    title: "OpenAPI operation names are ambiguous",
    severity: "low",
    records: ambiguousNames,
    recommendation:
      "Rename generic operationIds so similar endpoints are distinguishable to code generators and agents.",
    agentFailureMode:
      "A coding agent may map multiple endpoints to vague client methods such as run, query, or update.",
    fixExample: "Prefer syncCatalog, searchDocuments, or updateWorkspaceMember over generic names."
  });
  pushAggregate(findings, {
    id: "OPENAPI_DESTRUCTIVE_OPERATION_UNMARKED",
    title: "Destructive API operations are not clearly marked",
    severity: "high",
    records: unmarkedDestructive,
    recommendation:
      "Mark destructive operations with permission, confirmation, irreversibility, and recovery guidance.",
    agentFailureMode:
      "A coding agent may call a destructive endpoint during testing without understanding consequences.",
    fixExample:
      "State whether delete/cancel/revoke is irreversible and include sandbox-safe examples."
  });
  pushAggregate(findings, {
    id: "OPENAPI_PAGINATION_UNCLEAR",
    title: "List operations do not explain pagination",
    severity: "low",
    records: paginationUnclear,
    recommendation: "Document pagination parameters, cursors, limits, and response fields.",
    agentFailureMode:
      "A coding agent may fetch only the first page or invent unsupported pagination parameters.",
    fixExample:
      "Describe limit and cursor parameters and include a response example with next_cursor."
  });
  if (rateLimitUnclear) {
    findings.push(
      finding({
        id: "OPENAPI_RATE_LIMIT_UNCLEAR",
        title: "OpenAPI rate-limit behavior is unclear",
        severity: "low",
        category: "api_schema",
        description: "No 429, Retry-After, or rate-limit guidance was detected.",
        evidence: ["No operation mentions 429, Retry-After, or rate limits."],
        recommendation: "Document rate limits and retry behavior for generated clients.",
        agentFailureMode:
          "A coding agent may create brittle retry loops or ignore throttling responses.",
        fixExample: "Add a 429 response with Retry-After guidance and an example error payload.",
        suggestedFixType: "update_file"
      })
    );
  }
  return findings;
}

function pushAggregate(
  findings: Finding[],
  input: {
    id: string;
    title: string;
    severity: Finding["severity"];
    records: OperationRecord[];
    recommendation: string;
    agentFailureMode: string;
    fixExample: string;
  }
): void {
  if (input.records.length === 0) return;
  findings.push(
    finding({
      id: input.id,
      title: input.title,
      severity: input.severity,
      category: "api_schema",
      description: `${input.records.length} operation(s) need stronger agent-facing API documentation.`,
      evidence: input.records.slice(0, 8).map(labelOperation),
      recommendation: input.recommendation,
      agentFailureMode: input.agentFailureMode,
      fixExample: input.fixExample,
      affectedFile: input.records[0]?.file,
      suggestedFixType: "update_file"
    })
  );
}

function noOperationsFinding(file: string | undefined): Finding {
  return finding({
    id: "OPENAPI_NO_OPERATIONS",
    title: "OpenAPI spec has no analyzable operations",
    severity: "high",
    category: "api_schema",
    description: "The spec was detected but no HTTP path operations could be parsed.",
    evidence: [file ?? "OpenAPI file detected."],
    recommendation: "Add OpenAPI path operations or fix the spec structure so tools can parse it.",
    agentFailureMode:
      "A coding agent cannot discover API workflows from a spec without operations.",
    fixExample: "Add paths with get/post/patch/delete operations and operationIds.",
    affectedFile: file,
    suggestedFixType: "update_file"
  });
}

function securitySchemes(spec: JsonObject): string[] {
  const components = asObject(spec.components);
  const schemes = asObject(components?.securitySchemes);
  return schemes ? Object.keys(schemes) : [];
}

function weakOperationId(operation: JsonObject): boolean {
  const operationId = stringValue(operation.operationId);
  return (
    !operationId || operationId.length < 5 || genericOperationNames.has(operationId.toLowerCase())
  );
}

function ambiguousOperationName(operation: JsonObject): boolean {
  const operationId = stringValue(operation.operationId);
  if (!operationId) return false;
  return genericOperationNames.has(operationId.toLowerCase()) || !/[A-Z_-]/.test(operationId);
}

function isWeakOperation(record: OperationRecord): boolean {
  return (
    weakOperationId(record.operation) ||
    weakText(stringValue(record.operation.description), 32) ||
    !hasResponseExample(record.operation) ||
    !hasErrorResponses(record.operation)
  );
}

function isDestructiveOperation(record: OperationRecord): boolean {
  const haystack =
    `${record.method} ${record.path} ${stringValue(record.operation.operationId)} ${stringValue(record.operation.summary)} ${stringValue(record.operation.description)}`.toLowerCase();
  return record.method === "DELETE" || destructiveWords.some((word) => haystack.includes(word));
}

function destructiveOperationMarked(operation: JsonObject): boolean {
  return operationMentions(
    operation,
    /(irreversible|destructive|permission|confirm|cannot be undone|sandbox|danger)/i
  );
}

function likelyListOperation(record: OperationRecord): boolean {
  const haystack =
    `${record.method} ${record.path} ${stringValue(record.operation.operationId)} ${stringValue(record.operation.summary)}`.toLowerCase();
  return record.method === "GET" && /(list|search|\/\{[^}]+\}$)/i.test(haystack);
}

function hasRequestExample(operation: JsonObject): boolean {
  return JSON.stringify(operation.requestBody ?? "")
    .toLowerCase()
    .includes("example");
}

function hasResponseExample(operation: JsonObject): boolean {
  return JSON.stringify(operation.responses ?? "")
    .toLowerCase()
    .includes("example");
}

function hasErrorResponses(operation: JsonObject): boolean {
  const responses = asObject(operation.responses);
  if (!responses) return false;
  return errorStatusCodes.some((code) => Object.prototype.hasOwnProperty.call(responses, code));
}

function operationMentions(operation: JsonObject, pattern: RegExp): boolean {
  return pattern.test(JSON.stringify(operation));
}

function labelOperation(record: OperationRecord): string {
  const operationId = stringValue(record.operation.operationId);
  return `${record.file}: ${record.method} ${record.path}${operationId ? ` (${operationId})` : ""}`;
}

function weakText(value: string | undefined, minLength: number): boolean {
  return !value || value.trim().length < minLength;
}

function asObject(value: unknown): JsonObject | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : undefined;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
