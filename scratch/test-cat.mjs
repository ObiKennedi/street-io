import fs from "fs";
import path from "path";

const fileContent = fs.readFileSync(path.resolve("component/dashboard/categories.config.ts"), "utf-8");

const startStr = "export const exploreCategories: DashboardCategory[] = [";
const endStr = "];\n\n// Alias for backward compatibility";
const startIdx = fileContent.indexOf(startStr);
const endIdx = fileContent.indexOf(endStr, startIdx);

const rawCats = fileContent.slice(startIdx + startStr.length, endIdx);
const categories = eval(`[${rawCats}]`);
console.log(`Successfully parsed ${categories.length} categories!`);
console.log("Sample category:", categories[0].label);
