import type { Analyzer, Finding, ProjectSignals, ScanProfile } from "../schemas/types.js";
import { detectProject } from "../detection/project.js";
import { finding, hasUsefulMarkdownLinks, textIncludesAny } from "../findings/helpers.js";

export class ReadinessAnalyzer implements Analyzer {
  readonly id = "readiness-analyzer";

  constructor(private readonly profile: ScanProfile = "default") {}

  analyze(signals: ProjectSignals): Finding[] {
    return [
      ...agentInstructionFindings(signals),
      ...artifactQualityFindings(signals, this.profile),
      ...llmsFindings(signals),
      ...documentationFindings(signals),
      ...setupFindings(signals),
      ...apiFindings(signals, this.profile),
      ...mcpFindings(signals),
      ...benchmarkFindings(signals),
      ...securityFindings(signals),
      ...freshnessFindings(signals)
    ];
  }
}

function agentInstructionFindings(signals: ProjectSignals): Finding[] {
  const findings: Finding[] = [];
  const agents = signals.textByPath["AGENTS.md"];
  const claude = signals.textByPath["CLAUDE.md"];

  if (!signals.artifacts["AGENTS.md"]?.exists) {
    findings.push(
      finding({
        id: "agent-instructions.missing-agents-md",
        title: "Missing AGENTS.md",
        severity: "high",
        category: "agent_instructions",
        description: "The repo has no AGENTS.md, so coding agents lack a stable project guide.",
        evidence: ["AGENTS.md was not found at the repository root."],
        recommendation:
          "Create AGENTS.md with setup, tests, architecture, conventions, and safety rules.",
        affectedFile: "AGENTS.md",
        suggestedFixType: "create_file"
      })
    );
  } else {
    if ((agents?.trim().length ?? 0) < 800) {
      findings.push(
        finding({
          id: "agent-instructions.agents-too-short",
          title: "AGENTS.md is too short",
          severity: "medium",
          category: "agent_instructions",
          description: "AGENTS.md exists but appears too brief to guide realistic agent work.",
          evidence: [`AGENTS.md length is ${agents?.trim().length ?? 0} characters.`],
          recommendation:
            "Expand AGENTS.md with commands, architecture boundaries, coding conventions, and safety guidance.",
          affectedFile: "AGENTS.md",
          suggestedFixType: "update_file"
        })
      );
    }
    for (const check of [
      {
        id: "agent-instructions.missing-setup",
        title: "AGENTS.md does not mention setup commands",
        terms: ["install", "setup", "pnpm", "npm", "yarn"],
        recommendation: "Add the exact dependency installation and local setup commands."
      },
      {
        id: "agent-instructions.missing-tests",
        title: "AGENTS.md does not mention test commands",
        terms: ["test", "vitest", "jest", "pytest"],
        recommendation: "Add the exact commands agents should run before handing work back."
      },
      {
        id: "agent-instructions.missing-conventions",
        title: "AGENTS.md does not mention coding conventions",
        terms: ["convention", "style", "lint", "format", "typescript", "architecture"],
        recommendation: "Document project style, naming, and architecture expectations."
      },
      {
        id: "agent-instructions.missing-safety",
        title: "AGENTS.md does not mention safety or privacy constraints",
        terms: ["secret", "privacy", "credential", "security", "sensitive"],
        recommendation:
          "Tell agents how to handle secrets, credentials, private code, and external services."
      }
    ]) {
      if (!textIncludesAny(agents, check.terms)) {
        findings.push(
          finding({
            id: check.id,
            title: check.title,
            severity: "medium",
            category: "agent_instructions",
            description: "The main agent instruction file is missing a key operational section.",
            evidence: [`AGENTS.md does not contain any of: ${check.terms.join(", ")}.`],
            recommendation: check.recommendation,
            affectedFile: "AGENTS.md",
            suggestedFixType: "add_section"
          })
        );
      }
    }
  }

  if (!signals.artifacts["CLAUDE.md"]?.exists) {
    findings.push(
      finding({
        id: "agent-instructions.missing-claude-md",
        title: "Missing CLAUDE.md",
        severity: "medium",
        category: "agent_instructions",
        description: "Claude Code users do not have a concise project memory file.",
        evidence: ["CLAUDE.md was not found at the repository root."],
        recommendation:
          "Add CLAUDE.md with concise workflow, boundaries, and testing expectations.",
        affectedFile: "CLAUDE.md",
        suggestedFixType: "create_file"
      })
    );
  } else if (
    (claude?.trim().length ?? 0) < 300 ||
    textIncludesAny(claude, ["todo", "coming soon"])
  ) {
    findings.push(
      finding({
        id: "agent-instructions.claude-vague",
        title: "CLAUDE.md appears stale or too vague",
        severity: "low",
        category: "agent_instructions",
        description: "CLAUDE.md exists but may not contain enough stable project memory.",
        evidence: [`CLAUDE.md length is ${claude?.trim().length ?? 0} characters.`],
        recommendation:
          "Refresh CLAUDE.md with current setup commands, product boundaries, and test expectations.",
        affectedFile: "CLAUDE.md",
        suggestedFixType: "update_file"
      })
    );
  }

  return findings;
}

function llmsFindings(signals: ProjectSignals): Finding[] {
  const llms = signals.textByPath["llms.txt"];
  if (!signals.artifacts["llms.txt"]?.exists) {
    return [
      finding({
        id: "llms.missing",
        title: "Missing llms.txt",
        severity: "medium",
        category: "agent_instructions",
        description:
          "The project does not expose a compact, machine-readable map for LLMs and agents.",
        evidence: ["llms.txt was not found at the repository root."],
        recommendation:
          "Create llms.txt with links to README, docs, architecture, examples, and API references.",
        affectedFile: "llms.txt",
        suggestedFixType: "create_file"
      })
    ];
  }

  const findings: Finding[] = [];
  if (!hasUsefulMarkdownLinks(llms)) {
    findings.push(
      finding({
        id: "llms.no-useful-links",
        title: "llms.txt has no useful links",
        severity: "medium",
        category: "agent_instructions",
        description:
          "llms.txt exists but does not appear to point agents at important project context.",
        evidence: ["No Markdown links, URLs, or root-relative links were detected."],
        recommendation:
          "Add links to README, docs, architecture, scoring model, examples, and API references.",
        affectedFile: "llms.txt",
        suggestedFixType: "update_file"
      })
    );
  }

  const missingReferences = findLocalReferences(llms).filter(
    (reference) => !signals.scannedFiles.includes(reference.replace(/^\//, ""))
  );
  if (missingReferences.length > 0) {
    findings.push(
      finding({
        id: "llms.references-missing-files",
        title: "llms.txt references missing files",
        severity: "low",
        category: "freshness_and_consistency",
        description: "Some local links in llms.txt do not resolve to scanned files.",
        evidence: missingReferences.slice(0, 5),
        recommendation: "Update or remove stale llms.txt links.",
        affectedFile: "llms.txt",
        suggestedFixType: "update_file"
      })
    );
  }
  return findings;
}

function documentationFindings(signals: ProjectSignals): Finding[] {
  const findings: Finding[] = [];
  const readme = signals.textByPath["README.md"];
  if (!signals.artifacts["README.md"]?.exists) {
    findings.push(
      finding({
        id: "docs.missing-readme",
        title: "Missing README.md",
        severity: "high",
        category: "documentation",
        description: "Agents and humans lack the most common project entry point.",
        evidence: ["README.md was not found at the repository root."],
        recommendation:
          "Create a README with purpose, installation, quickstart, examples, and development commands.",
        affectedFile: "README.md",
        suggestedFixType: "create_file"
      })
    );
  } else {
    for (const check of [
      {
        id: "docs.readme-no-quickstart",
        title: "README.md has no quickstart section",
        terms: ["quickstart", "quick start", "getting started"],
        recommendation: "Add a quickstart that gets a new user to a working command quickly."
      },
      {
        id: "docs.readme-no-install",
        title: "README.md has no installation instructions",
        terms: ["install", "pnpm", "npm", "yarn", "pip"],
        recommendation: "Add installation commands and prerequisites."
      },
      {
        id: "docs.readme-no-examples",
        title: "README.md has no examples",
        terms: ["example", "usage", "demo"],
        recommendation: "Add concrete examples showing expected usage and output."
      }
    ]) {
      if (!textIncludesAny(readme, check.terms)) {
        findings.push(
          finding({
            id: check.id,
            title: check.title,
            severity: "medium",
            category: "documentation",
            description:
              "The README is missing a section agents commonly need to orient themselves.",
            evidence: [`README.md does not contain any of: ${check.terms.join(", ")}.`],
            recommendation: check.recommendation,
            affectedFile: "README.md",
            suggestedFixType: "add_section"
          })
        );
      }
    }
  }

  if (!signals.scannedFiles.some((file) => file.startsWith("docs/"))) {
    findings.push(
      finding({
        id: "docs.directory-missing",
        title: "Docs directory missing",
        severity: "low",
        category: "documentation",
        description: "No docs directory was detected for deeper project context.",
        evidence: ["No scanned files were under docs/."],
        recommendation: "Add docs/ for architecture, development, API, and operational context.",
        affectedFile: "docs/",
        suggestedFixType: "create_file"
      })
    );
  } else if (signals.docsMarkdownFiles.length === 0) {
    findings.push(
      finding({
        id: "docs.no-markdown",
        title: "Docs exist but no Markdown files are discoverable",
        severity: "medium",
        category: "documentation",
        description: "Agents work best when documentation source is available in text formats.",
        evidence: ["docs/ exists but no .md or .mdx files were scanned."],
        recommendation: "Add Markdown documentation or ensure docs source is not ignored.",
        affectedFile: "docs/",
        suggestedFixType: "add_section"
      })
    );
  }
  return findings;
}

function setupFindings(signals: ProjectSignals): Finding[] {
  const detected = detectProject(signals);
  const packageJson = signals.packageJson;
  if (!packageJson) {
    if (detected.type === "node_javascript" || detected.type === "node_typescript") {
      return [
        finding({
          id: "setup.package-json-missing",
          title: "package.json missing for detected Node project",
          severity: "high",
          category: "setup_and_tests",
          description:
            "Node projects need package.json scripts so agents can discover local workflows.",
          evidence: detected.evidence,
          recommendation:
            "Add package.json with scripts for install, test, lint, typecheck, build, and local development.",
          affectedFile: "package.json",
          suggestedFixType: "review_manually"
        })
      ];
    }
    if (
      detected.type === "docs_only" ||
      detected.type === "python" ||
      detected.type === "rust" ||
      detected.type === "go"
    ) {
      return [];
    }
    return [];
  }

  const findings: Finding[] = [];
  const scripts = packageJson.scripts;
  if (Object.keys(scripts).length === 0) {
    findings.push(
      finding({
        id: "setup.package-json-no-scripts",
        title: "package.json has no scripts",
        severity: "high",
        category: "setup_and_tests",
        description: "Agents cannot discover standard local workflows from package.json.",
        evidence: ["package.json scripts object is empty."],
        recommendation: "Add scripts for test, lint, typecheck, build, and local development.",
        affectedFile: "package.json",
        suggestedFixType: "add_script"
      })
    );
  }
  for (const scriptName of ["test", "lint", "typecheck"]) {
    if (!scripts[scriptName]) {
      findings.push(
        finding({
          id: `setup.missing-${scriptName}-script`,
          title: `No ${scriptName} script in package.json`,
          severity: scriptName === "test" ? "high" : "medium",
          category: "setup_and_tests",
          description: `Agents cannot reliably run ${scriptName} without a package script.`,
          evidence: [`package.json scripts does not include "${scriptName}".`],
          recommendation: `Add a package.json "${scriptName}" script or document the equivalent command clearly.`,
          affectedFile: "package.json",
          suggestedFixType: "add_script"
        })
      );
    }
  }

  const readme = signals.textByPath["README.md"];
  if (readme) {
    const mentionedScripts = [
      ...readme.matchAll(/^\s*(?:[$>]\s*)?(?:pnpm|npm run|yarn)\s+([a-zA-Z0-9:_-]+)/gm)
    ].map((match) => match[1]);
    const missingScripts = [...new Set(mentionedScripts)].filter(
      (script) =>
        script &&
        !script.startsWith("-") &&
        !["install", "add", "create"].includes(script) &&
        !scripts[script]
    );
    if (missingScripts.length > 0) {
      findings.push(
        finding({
          id: "setup.readme-mentions-missing-scripts",
          title: "README mentions commands not present in package.json",
          severity: "low",
          category: "freshness_and_consistency",
          description: "Documentation and executable scripts appear inconsistent.",
          evidence: missingScripts.map(
            (script) => `README mentions ${script}, but package.json has no matching script.`
          ),
          recommendation: "Update README commands or add the missing package scripts.",
          affectedFile: "README.md",
          suggestedFixType: "update_file"
        })
      );
    }
  }
  return findings;
}

function apiFindings(signals: ProjectSignals, profile: ScanProfile): Finding[] {
  const detected = detectProject(signals);
  const relevantOpenApiFiles = signals.openApiFiles.filter((file) => !file.startsWith("examples/"));
  if (relevantOpenApiFiles.length === 0) {
    const severity = detected.type === "openapi_project" || profile === "api" ? "high" : "info";
    return [
      finding({
        id: "api.openapi-not-detected",
        title: "OpenAPI file not detected",
        severity,
        category: "api_schema",
        description:
          "No OpenAPI schema was found. This may be fine for projects without an HTTP API.",
        evidence: ["No openapi.* or swagger.* file was scanned."],
        recommendation:
          "For API products, publish an OpenAPI spec with operation descriptions and examples.",
        suggestedFixType: "review_manually"
      })
    ];
  }

  const findings: Finding[] = [
    finding({
      id: "api.openapi-detected",
      title: "OpenAPI file detected",
      severity: "info",
      category: "api_schema",
      description: "The scanner found an API schema that agents can use.",
      evidence: relevantOpenApiFiles,
      recommendation: "Keep API descriptions, examples, and auth details current.",
      affectedFile: relevantOpenApiFiles[0],
      suggestedFixType: "none"
    })
  ];

  const openApiText = relevantOpenApiFiles.map((file) => signals.textByPath[file] ?? "").join("\n");
  const hasNearbyExample =
    signals.scannedFiles.some((file) => /examples?\//i.test(file)) ||
    /\bexamples?:/i.test(openApiText);
  if (!hasNearbyExample) {
    findings.push(
      finding({
        id: "api.openapi-no-nearby-examples",
        title: "OpenAPI exists but no examples are nearby",
        severity: "medium",
        category: "api_schema",
        description: "Agents need request and response examples in addition to schemas.",
        evidence: [`OpenAPI files: ${relevantOpenApiFiles.join(", ")}`],
        recommendation:
          "Add examples near the API spec or link examples from the API documentation.",
        affectedFile: relevantOpenApiFiles[0],
        suggestedFixType: "add_example"
      })
    );
  }

  if (
    !/description:\s*.{20,}/i.test(openApiText) &&
    !/"description"\s*:\s*".{20,}"/i.test(openApiText)
  ) {
    findings.push(
      finding({
        id: "api.openapi-thin-descriptions",
        title: "OpenAPI operation descriptions appear thin",
        severity: "medium",
        category: "api_schema",
        description: "The OpenAPI schema may not provide enough semantic guidance for agents.",
        evidence: ["No operation description longer than 20 characters was detected."],
        recommendation:
          "Add meaningful operation descriptions, auth notes, and representative examples.",
        affectedFile: relevantOpenApiFiles[0],
        suggestedFixType: "update_file"
      })
    );
  }
  return findings;
}

function mcpFindings(signals: ProjectSignals): Finding[] {
  const detected = detectProject(signals);
  if (signals.mcpFiles.length === 0) {
    return [
      finding({
        id: "mcp.not-evaluated",
        title: "MCP readiness could not be evaluated yet",
        severity: detected.type === "mcp_project" ? "high" : "info",
        category: "mcp_tools",
        description: "No MCP server/config/package signal was detected.",
        evidence: ["No file or package name matching MCP was scanned."],
        recommendation:
          "If this project exposes MCP tools, include server files and clear tool descriptions.",
        suggestedFixType: "review_manually"
      })
    ];
  }

  const mcpText = signals.mcpFiles.map((file) => signals.textByPath[file] ?? file).join("\n");
  const findings: Finding[] = [
    finding({
      id: "mcp.detected",
      title: "MCP-related files or packages detected",
      severity: "info",
      category: "mcp_tools",
      description: "MCP signals were found and can be evaluated by future deeper analyzers.",
      evidence: signals.mcpFiles.slice(0, 5),
      recommendation:
        "Ensure each MCP tool has a clear name, description, input schema, and safety guidance.",
      affectedFile: signals.mcpFiles[0],
      suggestedFixType: "review_manually"
    })
  ];
  if (!/description.{10,}/i.test(mcpText)) {
    findings.push(
      finding({
        id: "mcp.tool-descriptions-thin",
        title: "MCP tool descriptions appear missing or too short",
        severity: "medium",
        category: "mcp_tools",
        description: "Detected MCP-related files do not expose clear tool descriptions.",
        evidence: [
          "No description-like text longer than 10 characters was detected in MCP signals."
        ],
        recommendation: "Add concise, action-oriented descriptions to MCP tools and schemas.",
        affectedFile: signals.mcpFiles[0],
        suggestedFixType: "update_file"
      })
    );
  }
  return findings;
}

function artifactQualityFindings(signals: ProjectSignals, profile: ScanProfile): Finding[] {
  const findings: Finding[] = [];
  const checks = [
    {
      file: "AGENTS.md",
      label: "AGENTS.md",
      optional: false,
      required: [
        ["architecture map", ["architecture", "packages/", "apps/", "src/"]],
        ["common mistakes or avoid-list", ["avoid", "do not", "don't", "common mistake"]],
        ["generated-file warnings", ["generated", "dist", "build output", "do not edit"]]
      ]
    },
    {
      file: "CLAUDE.md",
      label: "CLAUDE.md",
      optional: false,
      required: [
        ["testing expectations", ["test", "testing", "vitest", "pytest"]],
        ["product boundaries", ["non-goal", "boundary", "not a", "do not build"]],
        ["development workflow", ["workflow", "pnpm", "npm", "setup"]]
      ]
    },
    {
      file: "README.md",
      label: "README.md",
      optional: false,
      required: [
        [
          "clear test command",
          ["test", "pnpm test", "npm test", "pytest", "cargo test", "go test"]
        ],
        [
          "architecture or repo map",
          ["architecture", "repo structure", "packages/", "apps/", "src/"]
        ]
      ]
    },
    {
      file: ".github/copilot-instructions.md",
      label: "GitHub Copilot instructions",
      optional: true,
      required: [
        ["setup commands", ["install", "setup", "pnpm", "npm", "pip"]],
        ["test commands", ["test", "pytest", "vitest", "jest"]],
        ["security/privacy guidance", ["secret", "privacy", "credential", "sensitive"]]
      ]
    },
    {
      file: ".cursor/rules",
      label: "Cursor rules",
      optional: true,
      required: [
        ["coding conventions", ["convention", "style", "format", "naming"]],
        ["architecture map", ["architecture", "packages/", "apps/", "src/"]],
        ["generated-file warnings", ["generated", "dist", "build output", "do not edit"]]
      ]
    }
  ] as const;

  for (const artifact of checks) {
    const exists = signals.artifacts[artifact.file]?.exists;
    if (!exists) {
      continue;
    }
    const content =
      signals.textByPath[artifact.file] ??
      Object.entries(signals.textByPath)
        .filter(([file]) => file.startsWith(`${artifact.file}/`))
        .map(([, value]) => value)
        .join("\n");
    for (const [label, terms] of artifact.required) {
      if (!textIncludesAny(content, terms)) {
        findings.push(
          finding({
            id: `artifact-quality.${artifact.file.replaceAll("/", "-").replaceAll(".", "")}.missing-${slug(label)}`,
            title: `${artifact.label} exists, but does not include ${label}`,
            severity: artifact.optional ? "low" : "medium",
            category: "agent_instructions",
            description:
              "A detected agent-facing artifact is missing specific guidance agents need for reliable work.",
            evidence: [`${artifact.label} does not contain any of: ${terms.join(", ")}.`],
            recommendation: `Add ${label} to ${artifact.label}.`,
            affectedFile: artifact.file,
            suggestedFixType: "add_section"
          })
        );
      }
    }
  }

  findings.push(...strongSignalFindings(signals, profile));

  return findings;
}

function strongSignalFindings(signals: ProjectSignals, profile: ScanProfile): Finding[] {
  const findings: Finding[] = [];
  const agents = signals.textByPath["AGENTS.md"];
  const readme = signals.textByPath["README.md"];
  const llms = signals.textByPath["llms.txt"];
  const benchmarkContent = signals.benchmarkFiles
    .map((file) => signals.textByPath[file] ?? "")
    .join("\n");

  if (agents && fencedCommandCount(agents) < 3) {
    findings.push(
      finding({
        id: "artifact-quality.agents-missing-command-blocks",
        title: "AGENTS.md has too few fenced command examples",
        severity: "low",
        category: "agent_instructions",
        description:
          "Agent instructions are easier to execute when setup, test, and build commands are shown as fenced command blocks.",
        evidence: [`Detected ${fencedCommandCount(agents)} fenced shell command block(s).`],
        recommendation:
          "Add fenced command examples for install, test, lint/typecheck, and build workflows.",
        affectedFile: "AGENTS.md",
        suggestedFixType: "update_file"
      })
    );
  }

  if (readme && !hasVerificationStep(readme)) {
    findings.push(
      finding({
        id: "artifact-quality.readme-missing-verification-step",
        title: "README has installation guidance but no verification step",
        severity: "low",
        category: "documentation",
        description: "Agents need a quick command to verify the project works after installation.",
        evidence: [
          "README does not show an obvious test, build, healthcheck, or smoke-test step after installation."
        ],
        recommendation:
          "Add a short verification step such as running tests, typecheck, build, or a health command.",
        affectedFile: "README.md",
        suggestedFixType: "add_section"
      })
    );
  }

  if (readme && signals.packageJson && !commandsMatchScripts(readme, signals.packageJson.scripts)) {
    findings.push(
      finding({
        id: "artifact-quality.readme-commands-not-grounded-in-scripts",
        title: "README commands are not clearly grounded in package.json scripts",
        severity: "low",
        category: "freshness_and_consistency",
        description:
          "Commands are more trustworthy when README examples match executable project scripts.",
        evidence: [
          "No fenced README command references a package.json script such as test, lint, typecheck, dev, or build."
        ],
        recommendation: "Show package-manager commands that map directly to package.json scripts.",
        affectedFile: "README.md",
        suggestedFixType: "update_file"
      })
    );
  }

  if (llms && findLocalReferences(llms).length < 4) {
    findings.push(
      finding({
        id: "artifact-quality.llms-too-few-project-links",
        title: "llms.txt links to too few concrete project files",
        severity: "low",
        category: "agent_instructions",
        description:
          "A useful llms.txt should route agents to README, architecture, development, examples, and task workflows.",
        evidence: [`Detected ${findLocalReferences(llms).length} local link(s).`],
        recommendation:
          "Add links to concrete docs, source entry points, examples, and benchmark tasks.",
        affectedFile: "llms.txt",
        suggestedFixType: "update_file"
      })
    );
  }

  if (benchmarkContent && !/success_criteria:\s*\n\s*-/i.test(benchmarkContent)) {
    findings.push(
      finding({
        id: "artifact-quality.benchmarks-not-verifiable",
        title: "Benchmark tasks are not verifiable",
        severity: "medium",
        category: "task_benchmarks",
        description:
          "Benchmark tasks need explicit success criteria so agent completion can be evaluated.",
        evidence: ["No success_criteria list was detected."],
        recommendation: "Add success criteria to each benchmark task.",
        affectedFile: signals.benchmarkFiles[0],
        suggestedFixType: "update_file"
      })
    );
  }

  if (
    (profile === "devtool" || profile === "api") &&
    readme &&
    !/troubleshoot|debug|common issue|faq/i.test(readme)
  ) {
    findings.push(
      finding({
        id: "artifact-quality.readme-missing-troubleshooting",
        title: "README lacks troubleshooting guidance",
        severity: "low",
        category: "documentation",
        description:
          "Developer-tool and API projects benefit from troubleshooting notes because agents often need to recover from local setup failures.",
        evidence: ["No troubleshooting, debug, FAQ, or common-issue section was detected."],
        recommendation:
          "Add a short troubleshooting section with common setup and test failure fixes.",
        affectedFile: "README.md",
        suggestedFixType: "add_section"
      })
    );
  }

  if (agents && !/owner|maintain|review|approval|responsible/i.test(agents)) {
    findings.push(
      finding({
        id: "artifact-quality.agents-missing-ownership-notes",
        title: "AGENTS.md lacks ownership or maintenance notes",
        severity: "low",
        category: "agent_instructions",
        description:
          "Agents need to know when to preserve ownership boundaries, ask for review, or avoid changing maintained areas.",
        evidence: [
          "No ownership, maintainer, review, approval, or responsibility language was detected."
        ],
        recommendation:
          "Add maintenance and ownership notes for sensitive modules or review expectations.",
        affectedFile: "AGENTS.md",
        suggestedFixType: "add_section"
      })
    );
  }

  return findings;
}

function benchmarkFindings(signals: ProjectSignals): Finding[] {
  if (signals.benchmarkFiles.length === 0) {
    return [
      finding({
        id: "benchmarks.missing-agent-task-file",
        title: "Missing agent task benchmark file",
        severity: "medium",
        category: "task_benchmarks",
        description: "The project has no task benchmark describing realistic agent workflows.",
        evidence: ["No benchmarks/agent-tasks.yaml or .agentlighthouse/tasks.yaml file was found."],
        recommendation:
          "Add a benchmark file with tasks such as install, run tests, add a small feature, and find core modules.",
        affectedFile: "benchmarks/agent-tasks.yaml",
        suggestedFixType: "create_file"
      })
    ];
  }

  const content = signals.benchmarkFiles.map((file) => signals.textByPath[file] ?? "").join("\n");
  if (!/\btasks\s*:/i.test(content) || !/\bprompt\s*:/i.test(content)) {
    return [
      finding({
        id: "benchmarks.no-tasks",
        title: "Benchmark file exists but has no tasks",
        severity: "medium",
        category: "task_benchmarks",
        description: "The benchmark file does not appear to contain executable task definitions.",
        evidence: signals.benchmarkFiles,
        recommendation: "Add task entries with prompts and success criteria.",
        affectedFile: signals.benchmarkFiles[0],
        suggestedFixType: "update_file"
      })
    ];
  }
  if (/prompt:\s*.{0,30}$/im.test(content)) {
    return [
      finding({
        id: "benchmarks.tasks-too-vague",
        title: "Benchmark tasks are too vague",
        severity: "low",
        category: "task_benchmarks",
        description:
          "At least one benchmark prompt appears too short to represent a realistic workflow.",
        evidence: ["A prompt shorter than 30 characters was detected."],
        recommendation:
          "Expand benchmark prompts with context, expected files, and success criteria.",
        affectedFile: signals.benchmarkFiles[0],
        suggestedFixType: "update_file"
      })
    ];
  }
  return [];
}

function securityFindings(signals: ProjectSignals): Finding[] {
  const findings: Finding[] = [];
  const agents = signals.textByPath["AGENTS.md"];
  if (!signals.artifacts[".agentlighthouseignore"]?.exists) {
    findings.push(
      finding({
        id: "security.missing-agentlighthouseignore",
        title: "Missing .agentlighthouseignore",
        severity: "medium",
        category: "security_and_privacy",
        description:
          "Scans should explicitly exclude generated, private, and secret-bearing paths.",
        evidence: [".agentlighthouseignore was not found at the repository root."],
        recommendation:
          "Add .agentlighthouseignore with node_modules, build outputs, env files, secrets, and vendor paths.",
        affectedFile: ".agentlighthouseignore",
        suggestedFixType: "create_file"
      })
    );
  }
  if (
    !textIncludesAny(agents, [
      "secret",
      "privacy",
      "credential",
      "security",
      "sensitive",
      "external llm"
    ])
  ) {
    findings.push(
      finding({
        id: "security.agent-secret-guidance-missing",
        title: "Instructions do not tell agents how to handle secrets",
        severity: "medium",
        category: "security_and_privacy",
        description:
          "Agent-facing instructions should state how to avoid exposing secrets or private data.",
        evidence: ["No secret/privacy guidance was detected in AGENTS.md."],
        recommendation:
          "Add a security section explaining secret handling and external LLM constraints.",
        affectedFile: "AGENTS.md",
        suggestedFixType: "add_section"
      })
    );
  }

  const secretMatches = Object.entries(signals.textByPath)
    .filter(([file]) => /^(docs|examples|README|AGENTS|CLAUDE|llms)/.test(file))
    .flatMap(([file, content]) => {
      const matches = content.match(
        /(?:api[_-]?key|secret|token)\s*[:=]\s*["']?[A-Za-z0-9_-]{16,}/gi
      );
      return matches?.map((match) => `${file}: ${maskSecret(match)}`) ?? [];
    });
  if (secretMatches.length > 0) {
    findings.push(
      finding({
        id: "security.secret-looking-strings",
        title: "Potential secret-looking strings in docs or examples",
        severity: "critical",
        category: "security_and_privacy",
        description: "Documentation or examples contain strings that look like credentials.",
        evidence: secretMatches.slice(0, 5),
        recommendation: "Replace real-looking credentials with clearly fake placeholders.",
        suggestedFixType: "review_manually"
      })
    );
  }
  return findings;
}

function freshnessFindings(signals: ProjectSignals): Finding[] {
  const staleMatches = Object.entries(signals.textByPath)
    .filter(([file]) => file.endsWith(".md") || file.endsWith(".txt"))
    .flatMap(([file, content]) => {
      const lines = content.split(/\r?\n/);
      return lines.flatMap((line, index) => {
        const proseLine = stripInlineCode(line);
        return /\b(TODO|coming soon|legacy|deprecated|old)\b/i.test(proseLine) &&
          !/migration|replace|instead|new/i.test(proseLine)
          ? [`${file}:${index + 1}: ${line.trim().slice(0, 120)}`]
          : [];
      });
    });
  if (staleMatches.length === 0) {
    return [];
  }
  return [
    finding({
      id: "freshness.deprecated-or-todo-terms",
      title: "Docs contain TODO/deprecated-looking terms without migration guidance",
      severity: "low",
      category: "freshness_and_consistency",
      description: "Stale markers can confuse agents unless they include replacement guidance.",
      evidence: staleMatches.slice(0, 8),
      recommendation: "Resolve TODOs or add explicit migration/replacement guidance.",
      suggestedFixType: "update_file"
    })
  ];
}

function stripInlineCode(value: string): string {
  return value.replace(/`[^`]*`/g, "");
}

function findLocalReferences(text: string | undefined): string[] {
  if (!text) {
    return [];
  }
  return [...text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)]
    .map((match) => match[1])
    .filter((reference): reference is string => Boolean(reference))
    .filter((reference) => !reference.startsWith("http") && !reference.startsWith("#"))
    .map((reference) => reference.replace(/^\.?\//, "").split("#")[0] ?? "");
}

function maskSecret(value: string): string {
  return value.length <= 12 ? "[masked]" : `${value.slice(0, 8)}...[masked]`;
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function fencedCommandCount(text: string): number {
  return [...text.matchAll(/```(?:bash|sh|shell|zsh)?\n([\s\S]*?)```/gi)].filter((match) =>
    /\b(pnpm|npm|yarn|bun|pip|poetry|cargo|go)\s+[a-z0-9:_-]+/i.test(match[1] ?? "")
  ).length;
}

function hasVerificationStep(text: string): boolean {
  return (
    /\b(pnpm|npm|yarn|bun)\s+(test|build|typecheck|lint)\b/i.test(text) ||
    /\b(pytest|cargo test|go test)\b/i.test(text) ||
    /\bverify|verification|smoke test|healthcheck\b/i.test(text)
  );
}

function commandsMatchScripts(text: string, scripts: Record<string, string>): boolean {
  const scriptNames = Object.keys(scripts);
  if (scriptNames.length === 0) return false;
  return scriptNames.some((script) =>
    new RegExp(`\\b(pnpm|npm run|yarn|bun)\\s+${escapeRegex(script)}\\b`, "i").test(text)
  );
}

function escapeRegex(value: string): string {
  return value.replace(/[|\\{}()[\]^$+?.*]/g, "\\$&");
}
