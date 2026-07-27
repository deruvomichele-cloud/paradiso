import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const profilesSource = await readFile(resolve(root, "drink-profiles.js"), "utf8");
const appSource = await readFile(resolve(root, "app.js"), "utf8");
const catalogEnd = appSource.indexOf("const API_BASE");

if (catalogEnd < 0) {
  throw new Error("Impossibile trovare il catalogo in app.js.");
}

const context = vm.createContext({ window: {} });
const serializedMenus = vm.runInContext(
  `${profilesSource}\n${appSource.slice(0, catalogEnd)}\nJSON.stringify(menus);`,
  context,
);
const menus = JSON.parse(serializedMenus);

const itemId = (theme, category, name) =>
  `${theme}:${category}:${name}`.toLowerCase().replace(/[^a-z0-9à-ž]+/gi, "-");

for (const [themeKey, menu] of Object.entries(menus)) {
  menu.categoryOrder = Object.keys(menu.categories);
  for (const [categoryKey, category] of Object.entries(menu.categories)) {
    category.items.forEach((product) => {
      product.id ||= itemId(themeKey, categoryKey, product.name);
    });
  }
}

await writeFile(
  resolve(root, "site-defaults.json"),
  `${JSON.stringify({ version: 1, menus }, null, 2)}\n`,
  "utf8",
);
