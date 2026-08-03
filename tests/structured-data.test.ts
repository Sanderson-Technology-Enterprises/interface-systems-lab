import assert from "node:assert/strict";
import test from "node:test";

type StructuredDataModule = {
  buildHomeStructuredData?: () => {
    "@graph": Array<Record<string, unknown>>;
  };
  buildLabStructuredData?: () => {
    "@graph": Array<Record<string, unknown>>;
  };
  serializeStructuredData?: (value: unknown) => string;
};

async function loadStructuredDataModule(): Promise<StructuredDataModule> {
  return import("../app/lib/structured-data").catch(() => ({}));
}

test("homepage structured data describes the overview and package list", async () => {
  const structuredData = await loadStructuredDataModule();

  assert.equal(typeof structuredData.buildHomeStructuredData, "function");
  if (structuredData.buildHomeStructuredData === undefined) return;

  const graph = structuredData.buildHomeStructuredData()["@graph"];
  const webPage = graph.find((node) => node["@type"] === "WebPage");
  const packages = graph.find((node) => node["@type"] === "ItemList");

  assert.equal(
    webPage?.url,
    "https://sanderson-technology-enterprises.github.io/interface-systems-lab/",
  );
  assert.equal(
    packages?.url,
    "https://sanderson-technology-enterprises.github.io/interface-systems-lab/#libraries",
  );
  assert.equal(packages?.numberOfItems, 4);
});

test("lab structured data assigns the application to the lab route", async () => {
  const structuredData = await loadStructuredDataModule();

  assert.equal(typeof structuredData.buildLabStructuredData, "function");
  if (structuredData.buildLabStructuredData === undefined) return;

  const graph = structuredData.buildLabStructuredData()["@graph"];
  const webPage = graph.find((node) => node["@type"] === "WebPage");
  const application = graph.find(
    (node) => node["@type"] === "SoftwareApplication",
  );

  assert.equal(
    webPage?.url,
    "https://sanderson-technology-enterprises.github.io/interface-systems-lab/lab/",
  );
  assert.equal(
    application?.url,
    "https://sanderson-technology-enterprises.github.io/interface-systems-lab/lab/",
  );
  assert.equal(
    application?.codeRepository,
    "https://github.com/Sanderson-Technology-Enterprises/interface-systems-lab",
  );
});

test("structured data serialization cannot close the script element", async () => {
  const structuredData = await loadStructuredDataModule();

  assert.equal(typeof structuredData.serializeStructuredData, "function");
  if (structuredData.serializeStructuredData === undefined) return;

  assert.equal(
    structuredData.serializeStructuredData({ value: "</script>" }),
    '{"value":"\\u003c/script>"}',
  );
});
