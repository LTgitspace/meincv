import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const sourcePath = resolve("meincv.html");
const outDir = resolve("dist");
const outPath = resolve(outDir, "index.html");

const rawHtml = readFileSync(sourcePath, "utf8");
const startIdx = rawHtml.indexOf("<h1");
const endIdx = rawHtml.lastIndexOf("</body>");

if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
  throw new Error("Could not locate CV body (<h1 ... </body>) in meincv.html");
}

let body = rawHtml.slice(startIdx, endIdx).trim();

// Mask email addresses and international phone numbers for public web hosting.
body = body.replace(
  /\b([a-zA-Z0-9._%+-])[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
  (_, first, domain) => `${first}****@${domain}`
);
body = body.replace(/\+(\d{1,3})[\s\d-]{6,}/g, (_, cc) => `+${cc} ** *** **** `);

// Fail fast if unmasked contact details remain.
if (/tuannleeeee@gmail\.com|7430/.test(body)) {
  throw new Error("PII leak detected after masking");
}

const titleMatch = body.match(/<h1[^>]*>(.*?)<\/h1>/i);
const pageTitle = titleMatch ? `${titleMatch[1].replace(/<[^>]+>/g, "")} - CV` : "CV";

const outputHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      line-height: 1.4;
      color: #111;
      max-width: 820px;
      margin: 28px auto;
      padding: 0 24px;
    }
    h1 { font-size: 24px; font-weight: 500; margin-bottom: 4px; padding-bottom: 6px; border-bottom: 2px solid #222; }
    h2 { font-size: 15px; font-weight: 500; margin-top: 14px; margin-bottom: 6px; padding-bottom: 3px; border-bottom: 1px solid #ccc; }
    p { margin-top: 2px; margin-bottom: 6px; }
    ul { margin-top: 2px; margin-bottom: 6px; padding-left: 20px; }
    li { margin-bottom: 3px; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
    @media print { body { margin: 0; font-size: 11.5px; line-height: 1.25; } }
  </style>
</head>
<body>
${body}
</body>
</html>
`;

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, outputHtml, "utf8");
console.log(`Built ${outPath} (${outputHtml.length} bytes)`);
