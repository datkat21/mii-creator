import { stripDebug } from "@namchee/bun-plugin-strip-debug";

/**
 * Builds a TypeScript file to a directory.
 * @param filePath The file path.
 * @param outputDir Directory to output the compiled file.
 * @param minify Whether or not to minify the compiled output. Useful for debugging.
 * @returns void
 */
export async function compile(
  filePaths: string[],
  outputDir: string
): Promise<any> {
  let output = (await Bun.build({
    entrypoints: filePaths,
    outdir: outputDir,
    splitting: false,
    emitDCEAnnotations: true,
    sourcemap: "none",
    // Only apply when building for prod !!
    // minify: {
    //   identifiers: true,
    //   syntax: true,
    //   whitespace: true
    // },
    // plugins: [stripDebug({ exclude: ["warn"] })]
  }).catch((e) => {
    console.error("Failed to build:", e);
  })) as BuildOutput;
  if (output.logs) {
    for (const log of output.logs) {
      console.error(log);
    }
  }
}

import { join } from "path";
import { watch } from "fs";

import * as sass from "sass";
import type { BuildOutput } from "bun";

async function build() {
  try {
    await compile(
      ["./src/main.ts", "./src/helper.ts", "./src/popup.ts", "./src/worker.ts"],
      "./public/dist/"
    );
  } catch (e) {
    console.log(e);
  }

  try {
    const mainScss = sass.compile("./src/scss/main.scss");
    await Bun.write("./public/dist/main.css", mainScss.css);
    // const landingScss = sass.compile("./src/scss/landing.scss");
    // await Bun.write("./public/landing.css", landingScss.css);
  } catch (_) {
    console.error(_);
  }
}

const watcher = watch(
  join(import.meta.dir, "./src"),
  { recursive: true },
  async (event, filename) => {
    console.log(`Detected ${event} in ${filename}`);
    build();
  }
);

console.log("Watching!");
build();
