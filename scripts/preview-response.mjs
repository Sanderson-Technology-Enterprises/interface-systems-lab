import { createReadStream } from "node:fs";

export function streamFileResponse({
  contentLength,
  contentType,
  filePath,
  method,
  response,
  statusCode,
}) {
  const fileStream = createReadStream(filePath);

  // Register the read-error path before opening the file so a stat/open race cannot crash the preview process.
  fileStream.once("error", () => {
    if (response.headersSent) {
      response.destroy();
      return;
    }

    response.writeHead(500, {
      Connection: "close",
      "Content-Type": "text/plain; charset=utf-8",
    });
    response.end("Unable to read preview file");
  });

  fileStream.once("open", () => {
    response.writeHead(statusCode, {
      "Cache-Control": "no-store",
      "Content-Length": contentLength,
      "Content-Type": contentType,
    });

    if (method === "HEAD") {
      fileStream.destroy();
      response.end();
      return;
    }

    fileStream.pipe(response);
  });
}
