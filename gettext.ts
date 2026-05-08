import { GettextExtractor, JsExtractors } from "gettext-extractor";

let extractor = new GettextExtractor();

extractor
  .createJsParser([
    JsExtractors.callExpression("__", {
      arguments: {
        text: 0,
        context: 1
      },
      comments: { otherLineLeading: true }
    }),
    JsExtractors.callExpression("ngettext", {
      arguments: {
        text: 1,
        textPlural: 2,
        context: 3
      }
    })
  ])
  .parseFilesGlob("./src/**/*.@(ts|js|tsx|jsx)");

extractor.savePotFile("./src/i18n/template.pot");

extractor.printStats();
