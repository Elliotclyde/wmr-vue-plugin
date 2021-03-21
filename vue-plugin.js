import compiler from "@vue/compiler-sfc";
import fs from "fs";
import hashsum from "hash-sum";

export function buildVue() {
  // We are going to append to this sting to build a CSS file from all vue SFCs
  let cssOutput = "";
  // generate a hashed filename based on the current time
  let cssFilename = "index" + hashsum(new Date().valueOf()) + ".css";
  return {
    name: "Vue",
    async load(filePath) {
      if (filePath.slice(-4) !== ".vue") {
        return null;
      }
      const id = hashsum(filePath);
      const contents = fs.readFileSync(filePath, "utf-8");
      const { descriptor, errors } = compiler.parse(contents, {
        filename: filePath,
      });
      // We are going to append to this sting to build the JS for each sfc
      let jsOutput = "";

      if (descriptor.script) {
        const scriptLang = descriptor.script.lang;
        let scriptContent = descriptor.script.content;
        if (["js", "ts"].includes(scriptLang) || !scriptLang) {
          scriptContent = scriptContent.replace(
            `export default`,
            "const defaultExport ="
          );
        }
        jsOutput += scriptContent;
      } else {
        jsOutput += `const defaultExport = {};`;
      }

      await Promise.all(
        descriptor.styles.map((stylePart) => {
          const css = compiler.compileStyle({
            filename: filePath,
            source: stylePart.content,
            id: `data-v-${id}`,
            scoped: stylePart.scoped != null,
            modules: stylePart.module != null,
            preprocessLang: stylePart.lang,
          });
          if (css.errors && css.errors.length > 0) {
            console.error(JSON.stringify(css.errors));
          }
          cssOutput += css.code;
        })
      );

      if (descriptor.template) {
        const templateJS = compiler.compileTemplate({
          id,
          filename: filePath,
          source: descriptor.template.content,
          preprocessLang: descriptor.template.lang,
          compilerOptions: {
            scopeId: descriptor.styles.some((s) => s.scoped)
              ? `data-v-${id}`
              : null,
          },
        });

        jsOutput += `\n${templateJS.code}\n`;
        jsOutput += `\ndefaultExport.render = render`;
        jsOutput += `\nexport default defaultExport`;

        return jsOutput;
      }
    },
    generateBundle(outputOptions, bundle) {
      Object.values(bundle).forEach((file) => {
        if (file.type !== "asset" || file.fileName.slice(-5) !== ".html")
          return;

        const newhtml = file.source
          .toString()
          .replace(
            /<( )*?\/( )*head( )*>/i,
            `\t<link rel="stylesheet" href="/${cssFilename}">\n</head>`
          );
        file.source = newhtml;
      });
    },
    buildEnd(error) {
      this.emitFile({
        type: "asset",
        name: "vueCss",
        fileName: cssFilename,
        source: cssOutput,
      });
    },
  };
}

export function devVue(req, res, next) {
  if (req.originalUrl.includes("@npm") || req.originalUrl.includes("_wmr")) {
    next();
    return;
  } else {
    if (req.originalUrl.slice(-4) !== ".vue") {
      next();
      return;
    }

    // Vue transform
    res.writeHead(200, {
      "Content-Type": "application/javascript;charset=utf-8",
    });
    const filePath = process.cwd() + "/public" + req.originalUrl;
    const contents = fs.readFileSync(filePath, "utf-8");
    const { descriptor, errors } = compiler.parse(contents, {
      filename: filePath,
    });

    const id = hashsum(req.originalUrl);

    let jsOutput = "";
    let cssOutput = "";

    if (descriptor.script) {
      const scriptLang = descriptor.script.lang;
      let scriptContent = descriptor.script.content;
      if (["js", "ts"].includes(scriptLang) || !scriptLang) {
        scriptContent = scriptContent.replace(
          `export default`,
          "const defaultExport ="
        );
      }
      jsOutput += scriptContent;
    } else {
      jsOutput += `const defaultExport = {};`;
    }

    descriptor.styles.map((stylePart) => {
      const css = compiler.compileStyle({
        filename: filePath,
        source: stylePart.content,
        id: `data-v-${id}`,
        scoped: stylePart.scoped != null,
        modules: stylePart.module != null,
        preprocessLang: stylePart.lang,
      });
      if (css.errors && css.errors.length > 0) {
        console.error(JSON.stringify(css.errors));
      }
      cssOutput += css.code;
    });

    const templateJS = compiler.compileTemplate({
      id,
      filename: filePath,
      source: descriptor.template.content,
      preprocessLang: descriptor.template.lang,
      compilerOptions: {
        scopeId: descriptor.styles.some((s) => s.scoped)
          ? `data-v-${id}`
          : null,
      },
    });

    jsOutput += `\n${templateJS.code}\n`;
    jsOutput += `\ndefaultExport.render = render`;
    jsOutput += `\nexport default defaultExport`;

    jsOutput += `\n document.head.insertAdjacentHTML("beforeend",\`<style>${cssOutput}</style>\`)`;

    res.write(jsOutput.replace('from "vue"', 'from "/@npm/vue"'));
    res.end();
    return;
  }
}
