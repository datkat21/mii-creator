let THREE: any; // typeof import("three");

// choose your path
if (globalThis.THREE) {
  THREE = globalThis.THREE;
  console.log("found three.js in global!");
} else {
  console.log("oops, i didn't find three.js!", globalThis.THREE);
  const three = (
    await import(new URL(import.meta.url).origin + "/dist/three.js")
  ).default;

  THREE = three;
}

export { THREE };
export const _THREE = () => THREE;
