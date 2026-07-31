import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const publicRoot = path.join(repositoryRoot, "public");
const socialCardBackground = path.join(
  repositoryRoot,
  "assets",
  "brand",
  "interface-systems-lab-social-card-background.png",
);
const socialCardOutput = path.join(
  publicRoot,
  "interface-systems-lab-social-card.png",
);

const transparentOutputs = new Map([
  ["favicon-16x16.png", 16],
  ["favicon-32x32.png", 32],
  ["favicon-48x48.png", 48],
  ["apple-touch-icon.png", 180],
  ["android-chrome-192x192.png", 192],
  ["android-chrome-512x512.png", 512],
  ["mstile-150x150.png", 150],
]);

function readOption(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function buildPngIco(entries) {
  // PNG-backed ICO entries preserve full alpha at every browser-supported size.
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  const directory = Buffer.alloc(entries.length * 16);
  let dataOffset = header.length + directory.length;
  for (const [index, entry] of entries.entries()) {
    const offset = index * 16;
    directory[offset] = entry.size === 256 ? 0 : entry.size;
    directory[offset + 1] = entry.size === 256 ? 0 : entry.size;
    directory[offset + 2] = 0;
    directory[offset + 3] = 0;
    directory.writeUInt16LE(1, offset + 4);
    directory.writeUInt16LE(32, offset + 6);
    directory.writeUInt32LE(entry.png.length, offset + 8);
    directory.writeUInt32LE(dataOffset, offset + 12);
    dataOffset += entry.png.length;
  }

  return Buffer.concat([header, directory, ...entries.map(({ png }) => png)]);
}

async function renderTransparent(masterBuffer, size) {
  return sharp(masterBuffer)
    .resize(size, size, {
      fit: "contain",
      kernel: sharp.kernel.lanczos3,
    })
    .ensureAlpha()
    .png()
    .toBuffer();
}

export async function buildLogoFamily({
  sourceMaster,
  outputRoot = publicRoot,
}) {
  const input = await readFile(sourceMaster);
  const metadata = await sharp(input).metadata();
  if (
    metadata.width !== metadata.height ||
    !metadata.width ||
    metadata.width < 1024
  ) {
    throw new Error("Brand master must be a square image at least 1024px.");
  }

  // A production master must expose a real matte rather than a baked
  // transparency grid or a completely opaque background.
  const stats = await sharp(input).ensureAlpha().stats();
  const alpha = stats.channels[3];
  if (!alpha || alpha.min !== 0 || alpha.max !== 255) {
    throw new Error(
      "Brand master must contain both transparent and opaque pixels.",
    );
  }

  const masterBuffer = await sharp(input)
    .resize(1254, 1254, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.lanczos3,
    })
    .ensureAlpha()
    .png()
    .toBuffer();
  await writeFile(path.join(outputRoot, "logo-master.png"), masterBuffer);

  const rendered = new Map();
  for (const [fileName, size] of transparentOutputs) {
    const buffer = await renderTransparent(masterBuffer, size);
    rendered.set(size, buffer);
    await writeFile(path.join(outputRoot, fileName), buffer);
  }

  // Retain a flat RGB chroma source for tooling that cannot consume alpha.
  const chroma = await sharp({
    create: {
      width: 1254,
      height: 1254,
      channels: 3,
      background: "#ff00ff",
    },
  })
    .composite([{ input: masterBuffer }])
    .removeAlpha()
    .png()
    .toBuffer();
  await writeFile(path.join(outputRoot, "logo-chroma-source.png"), chroma);

  const maskableMark = await renderTransparent(masterBuffer, 380);
  const maskable = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: "#081b33",
    },
  })
    .composite([{ input: maskableMark, left: 66, top: 66 }])
    .png()
    .toBuffer();
  await writeFile(path.join(outputRoot, "maskable-icon-512x512.png"), maskable);

  const previewMark = await renderTransparent(masterBuffer, 260);
  const previewTileMark = await renderTransparent(masterBuffer, 140);
  const pixelPreview = await sharp(rendered.get(48))
    .resize(176, 176, { kernel: sharp.kernel.nearest })
    .png()
    .toBuffer();
  const darkTile = await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: "#081b33",
    },
  })
    .composite([{ input: previewTileMark, left: 20, top: 20 }])
    .png()
    .toBuffer();
  const preview = await sharp({
    create: {
      width: 900,
      height: 360,
      channels: 4,
      background: "#f4f7fb",
    },
  })
    .composite([
      { input: previewMark, left: 35, top: 50 },
      { input: darkTile, left: 355, top: 90 },
      { input: pixelPreview, left: 650, top: 92 },
    ])
    .png()
    .toBuffer();
  await writeFile(path.join(outputRoot, "favicon-preview.png"), preview);

  const icoEntries = [16, 32, 48].map((size) => ({
    size,
    png: rendered.get(size),
  }));
  await writeFile(
    path.join(outputRoot, "favicon.ico"),
    buildPngIco(icoEntries),
  );

  return { masterBuffer };
}

function socialTypographySvg() {
  // All social-card copy stays in a deterministic overlay so generated
  // background artwork can never introduce misspelled or stale brand claims.
  return Buffer.from(`
    <svg width="1200" height="630" viewBox="0 0 1200 630"
         xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3"
                        flood-color="#071525" flood-opacity=".45"/>
        </filter>
      </defs>
      <g font-family="Arial, Helvetica, sans-serif" filter="url(#shadow)">
        <text x="555" y="208" fill="#f7f7f4" font-size="84"
              font-weight="800" letter-spacing="3">INTERFACE</text>
        <text x="555" y="296" fill="#f7f7f4" font-size="84"
              font-weight="800" letter-spacing="3">SYSTEMS</text>
        <text x="989" y="296" fill="#08bff2" font-size="84"
              font-weight="800" letter-spacing="3">LAB</text>
      </g>
      <g fill="#ffc63d" font-family="Arial, Helvetica, sans-serif"
         font-size="39" font-weight="600">
        <text x="556" y="357">4 libraries.</text>
        <text x="556" y="402">1 interface.</text>
        <text x="556" y="447">5,280 possibilities.</text>
      </g>
      <line x1="556" y1="478" x2="1110" y2="478"
            stroke="#62d7ff" stroke-opacity=".42"/>
      <g font-family="Arial, Helvetica, sans-serif"
         font-size="23" font-weight="600">
        <text x="556" y="524" fill="#ffc63d">Layout</text>
        <text x="635" y="524" fill="#62d7ff">·</text>
        <text x="659" y="524" fill="#f7f7f4">Identity</text>
        <text x="753" y="524" fill="#62d7ff">·</text>
        <text x="777" y="524" fill="#ffc63d">Iconography</text>
        <text x="928" y="524" fill="#62d7ff">·</text>
        <text x="952" y="524" fill="#f7f7f4">Interaction</text>
      </g>
    </svg>
  `);
}

export async function buildSocialCard({
  backgroundPath = socialCardBackground,
  logoPath = path.join(publicRoot, "logo-master.png"),
  outputPath = socialCardOutput,
} = {}) {
  const background = await sharp(backgroundPath)
    .resize(1200, 630, { fit: "fill" })
    .png()
    .toBuffer();
  const logo = await sharp(logoPath)
    .resize(405, 405, {
      fit: "contain",
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();

  const output = await sharp(background)
    .composite([
      { input: logo, left: 78, top: 92 },
      { input: socialTypographySvg(), left: 0, top: 0 },
    ])
    .png({ palette: true, colours: 256, dither: 0.85 })
    .toBuffer();
  await writeFile(outputPath, output);
}

const requestedMaster = readOption("--master");
await buildLogoFamily({
  sourceMaster: requestedMaster
    ? path.resolve(requestedMaster)
    : path.join(publicRoot, "logo-master.png"),
});
await buildSocialCard();
