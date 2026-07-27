import assert from "node:assert/strict";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const previewResponseModule =
  await import("../../scripts/preview-response.mjs").catch(() => ({}));
const streamFileResponse =
  previewResponseModule.streamFileResponse ?? (() => undefined);

test("preview file read failures return 500 and leave the server available", async (t) => {
  const missingFile = path.join(
    tmpdir(),
    `missing-preview-${process.pid}-${Date.now()}.html`,
  );
  const server = createServer((request, response) => {
    streamFileResponse({
      contentLength: 32,
      contentType: "text/html; charset=utf-8",
      filePath: missingFile,
      method: request.method ?? "GET",
      response,
      statusCode: 200,
    });
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(
    () =>
      new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  );

  const address = server.address();
  assert.ok(address && typeof address === "object");
  const requestUrl = `http://127.0.0.1:${address.port}/missing`;

  async function requestMissingFile() {
    try {
      const response = await fetch(requestUrl, {
        headers: { Connection: "close" },
        signal: AbortSignal.timeout(1_000),
      });
      return { body: await response.text(), status: response.status };
    } catch {
      return { body: "", status: 0 };
    }
  }

  assert.deepEqual(await requestMissingFile(), {
    body: "Unable to read preview file",
    status: 500,
  });
  assert.deepEqual(await requestMissingFile(), {
    body: "Unable to read preview file",
    status: 500,
  });
});
