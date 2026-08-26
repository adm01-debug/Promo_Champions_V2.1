import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

type Finding = {
  file: string;
  kind: string;
  line: number;
};

const currentFile = fileURLToPath(import.meta.url);
const scriptsRoot = resolve(dirname(currentFile), "..");
const repositoryRoot = resolve(scriptsRoot, "..");
const execFileAsync = promisify(execFile);
const legacyJwtPattern = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
const secretKeyLiteralPattern = /(['"`])sb_secret_[A-Za-z0-9_-]{16,}\1/g;

async function listTrackedFiles(): Promise<string[]> {
  const { stdout } = await execFileAsync("git", ["ls-files", "-z"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });

  return stdout
    .split("\0")
    .filter(Boolean)
    .map((file) => resolve(repositoryRoot, file));
}

function lineAt(content: string, index: number): number {
  return content.slice(0, index).split("\n").length;
}

function isLegacyServiceRoleJwt(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1]!, "base64url").toString("utf8")) as {
      role?: unknown;
    };

    return payload.role === "service_role";
  } catch {
    return false;
  }
}

async function findCommittedServiceRoleKeys(): Promise<Finding[]> {
  const trackedFiles = await listTrackedFiles();
  const findings: Finding[] = [];

  for (const file of trackedFiles) {
    if (file === currentFile) continue;

    let content: string;
    try {
      content = await readFile(file, "utf8");
    } catch {
      continue;
    }
    const relativeFile = relative(repositoryRoot, file);

    for (const match of content.matchAll(legacyJwtPattern)) {
      if (isLegacyServiceRoleJwt(match[0])) {
        findings.push({
          file: relativeFile,
          kind: "JWT de service_role literal",
          line: lineAt(content, match.index ?? 0),
        });
      }
    }

    for (const match of content.matchAll(secretKeyLiteralPattern)) {
      findings.push({
        file: relativeFile,
        kind: "chave secreta Supabase literal",
        line: lineAt(content, match.index ?? 0),
      });
    }
  }

  return findings;
}

const findings = await findCommittedServiceRoleKeys();

if (findings.length > 0) {
  console.error("Foram encontradas credenciais de serviço versionadas no repositório:");
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} (${finding.kind})`);
  }
  console.error("Os valores não são exibidos por segurança.");
  process.exitCode = 1;
} else {
  console.log("Nenhuma credencial de serviço literal foi encontrada nos arquivos versionados.");
}
