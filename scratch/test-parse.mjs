import fs from "fs";
import path from "path";

const fileContent = fs.readFileSync(path.resolve("lib/articles.ts"), "utf-8");

// Extract everything between "export const ARTICLES_DATABASE: Article[] = [" and "];\n\nexport function"
const startStr = "export const ARTICLES_DATABASE: Article[] = [";
const endStr = "];\n\nexport function";
const startIdx = fileContent.indexOf(startStr);
const endIdx = fileContent.indexOf(endStr, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.error("Could not find start or end marker");
  process.exit(1);
}

const rawArticles = fileContent.slice(startIdx + startStr.length, endIdx);
// Evaluate as valid JS array
const articles = eval(`[${rawArticles}]`);
console.log(`Successfully parsed ${articles.length} articles!`);
console.log("Sample article:", articles[0].title);
