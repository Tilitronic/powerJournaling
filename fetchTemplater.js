// fetchTemplater.js
import fs from "fs";
import https from "https";

const url =
  "https://raw.githubusercontent.com/TheRealWolfick/templater-scripts-types/main/.dev/types/templater.d.ts";
const outPath = "./types/templater/templater.d.ts";

https
  .get(url, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      // Check if fetched content contains expected module declaration
      if (!/declare module ['"]templater-obsidian['"]/.test(data)) {
        console.warn(
          "Fetched content does not look like a valid templater.d.ts. File not overwritten."
        );
        return;
      }

      // Prepend MIT license comment
      const licenseComment = `/*!
 * templater.d.ts
 * Fetched from https://github.com/TheRealWolfick/templater-scripts-types
 * Copyright (c) 2025 TheRealWolfick
 * Licensed under MIT: https://opensource.org/licenses/MIT
 */
`;

      // Change module declaration name
      data = data.replace(
        /declare module ['"]templater-obsidian['"]/,
        'declare module "templater"'
      );

      fs.mkdirSync("./types/templater", { recursive: true });
      fs.writeFileSync(outPath, licenseComment + "\n" + data, "utf8");
      console.log(
        'Fetched latest templater.d.ts, added license comment, and renamed module to "templater"'
      );
    });
  })
  .on("error", (err) => {
    console.error("Error fetching templater.d.ts:", err);
  });
