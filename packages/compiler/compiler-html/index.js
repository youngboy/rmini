const path = require("path");
const fs = require("fs");
const { compilerStyle } = require("./compiler-style");
const { compilerJavascript } = require("./compiler-javascript");
const { compilerHtml } = require("./compiler-html");
const cwd = process.cwd();

const template = {
  head: `
  <!DOCTYPE html>
  <html lang="en" style="font-size: __FONT_SIZE__px">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,user-scalable=no,initial-scale=__SCALE__,maximum-scale=__SCALE__,minimum-scale=__SCALE__">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
  `,
  body: `
  </head>
  <body>
    <div id="app">
  `,
  foot: `
    </div>
  </body>
  <script type="text/javascript">
  `,
  tail: `
    </script>
  </html>
  `
};

exports.compilerHtml = function(entryDir, appConfig, projectConfig) {
  if (!appConfig.pages || !appConfig.pages.length) {
    throw new Error("no page fount");
  }

  appConfig.pages.forEach(async pageEntry => {
    const wxmlPath = path.join(cwd, pageEntry + ".wxml");
    fs.accessSync(wxmlPath);

    const originalWxmlContent = await fs.promises.readFile(wxmlPath, {
      encoding: "utf-8"
    });
    const styleContent = await compilerStyle(pageEntry);
    const scriptContent = compilerJavascript(originalWxmlContent);
    const wxmlContent = await compilerHtml(originalWxmlContent);

    let content = "";
    content += template.head;
    content += `<style>body { font-size: 0.24rem }\n${styleContent}</style>\n`;
    content += `<script src="http://127.0.0.1:8081/runtime/runtime.js"></script>\n`;
    content += template.body;
    content += wxmlContent;
    content += template.foot;
    content += scriptContent;
    content += template.tail;

    const entry = path.join(entryDir, pageEntry);
    try {
      await fs.promises.mkdir(entry, { recursive: true });
    } catch (error) {
      //
    }

    fs.promises
      .writeFile(path.join(entryDir, pageEntry, "index.html"), content, "utf-8")
      .catch(console.error);
  });
};
