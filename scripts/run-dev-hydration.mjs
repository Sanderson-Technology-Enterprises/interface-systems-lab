import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const protectedFiles = ["next-env.d.ts", "tsconfig.json"].map((fileName) =>
  path.join(repositoryRoot, fileName),
);
const require = createRequire(import.meta.url);
const playwrightCli = require.resolve("@playwright/test/cli");

async function withRestoredFiles(filePaths, task) {
  const snapshots = await Promise.all(
    filePaths.map(async (filePath) => ({
      contents: await readFile(filePath),
      filePath,
    })),
  );

  try {
    return await task();
  } finally {
    // Next rewrites these files during dev; preserve the checkout byte-for-byte.
    await Promise.all(
      snapshots.map(({ contents, filePath }) => writeFile(filePath, contents)),
    );
  }
}

async function assertPortAvailable(port) {
  await new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.once("error", () => {
      reject(
        new Error(`Development hydration port ${port} is already in use.`),
      );
    });
    server.listen({ host: "127.0.0.1", port }, () => {
      server.close(resolve);
    });
  });
}

function runPlaywright() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [playwrightCli, "test", "--config", "playwright.dev.config.ts"],
      {
        cwd: repositoryRoot,
        env: process.env,
        stdio: "inherit",
      },
    );
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal) {
        reject(
          new Error(`Development hydration test stopped by signal ${signal}.`),
        );
        return;
      }
      resolve(code ?? 1);
    });
  });
}

async function main() {
  const portText = process.env.PLAYWRIGHT_DEV_PORT?.trim() || "4176";
  const port = Number(portText);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid PLAYWRIGHT_DEV_PORT: ${portText}`);
  }

  await assertPortAvailable(port);
  const exitCode = await withRestoredFiles(protectedFiles, runPlaywright);
  process.exitCode = exitCode;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
