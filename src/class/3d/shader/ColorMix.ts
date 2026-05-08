import { _THREE } from "../../../util/PrepareThree";
const THREE = _THREE();
//@ts-expect-error shhh
import type * as THREE from "three";
import {
  renderTargetToDataTexture,
  renderTargetToDataURL
} from "../../../util/rendertarget";

function ColorMixShaderMaterial(
  texture: THREE.Texture,
  r: THREE.Vector4Like,
  g: THREE.Vector4Like,
  b: THREE.Vector4Like
) {
  return new THREE.ShaderMaterial({
    uniforms: {
      u_texture: { value: texture },
      u_const1: { value: r },
      u_const2: { value: g },
      u_const3: { value: b }
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
uniform sampler2D u_texture;
uniform vec4 u_const1;
uniform vec4 u_const2;
uniform vec4 u_const3;
uniform vec4 u_const4;
varying vec2 vUv;

void main() {
  vec4 texColor = texture2D(u_texture, vUv);

  // Optionally discard low-alpha texture pixels.
  if (texColor.a <= 0.2) {
    discard;
  }
  
// Mix RGB channels using each constant’s color (rgb)
vec3 mixedColor = texColor.r * u_const1.rgb +
            texColor.g * u_const2.rgb +
            texColor.b * u_const3.rgb;

// Use the texture's own alpha
float mixedAlpha = texColor.a;

// Premultiply the mixed color by its alpha
gl_FragColor = vec4(mixedColor * mixedAlpha, mixedAlpha);
}
`
  });
}

export function colorMixTexture(
  tex: THREE.Texture,
  constR: THREE.Vector4Like = new THREE.Vector4(0, 1, 1, 1),
  constG: THREE.Vector4Like = new THREE.Vector4(1, 1, 0, 1),
  constB: THREE.Vector4Like = new THREE.Vector4(1, 1, 0, 1),
  constA: THREE.Color,
  rendererMain: THREE.WebGLRenderer,
  textureResolution?: number
): Promise<THREE.Texture> {
  return new Promise<THREE.Texture>((resolve) => {
    // --- Scene, Camera, and Renderer Setup ---
    const scene = new THREE.Scene() as THREE.Scene;
    scene.background = constA;

    let width: number, height: number;

    if (tex instanceof ImageBitmap) {
      width = tex.width;
      height = tex.height;
    } else {
      width = tex.image.width;
      height = tex.image.height;
    }

    // assume square......?
    if (textureResolution) {
      let aspect = width / height;
      width = textureResolution;
      height = textureResolution / aspect;
    }

    // HACK: uhh flip the god damn texture in here instead because it isnt working
    // tex.flipY = false;
    // tex.needsUpdate = true;

    console.log(
      "HI ITS ME CLOTHING TEX RENDERER, IDK WTF I DID",
      width,
      height
    );

    // Use an off-screen render target for rendering
    const renderTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
    }) as THREE.WebGLRenderTarget;

    // Create an orthographic camera.
    // The view is set up so that the world units match the window size.
    const camera = new THREE.OrthographicCamera(
      width / -2, // left
      width / 2, // right
      height / 2, // top
      height / -2, // bottom
      0.1, // near
      1000 // far
    );
    camera.position.z = 1;
    // console.log("[CMT DEBUG] camera Created!");

    // Create the WebGL renderer and add its canvas
    const renderer = rendererMain; // || new THREE.WebGLRenderer();

    if (typeof window !== "undefined")
      //@ts-expect-error
      window.camera = camera;

    // --- Create a Plane Geometry ---
    const geometry = new THREE.PlaneGeometry(width, height);
    const plane = new THREE.Mesh(
      geometry,
      ColorMixShaderMaterial(tex, constR, constG, constB)
    );

    scene.add(plane);

    function render() {
      async function finalize(result: THREE.Texture) {
        // var canvas = document.createElement("canvas");
        // var ctx = canvas.getContext("2d")!;
        // canvas.width = width;
        // canvas.height = height;

        // // var img = new Image(canvas.width, canvas.height);
        const a = await renderTargetToDataTexture(
          renderTarget,
          renderer,
          false,
          true
        );

        if (result === null) return console.error("blob is null???");
        // renderer.setClearAlpha(0);
        resolve(a);
        // renderer.getClearColor(oldColor);
        // renderer.setClearAlpha(0);
        geometry.dispose();
        plane.material.dispose();
        // renderer.setClearAlpha(0);
        // renderer.getClearColor(oldColor);
        renderTarget.dispose();
      }

      // Prepare for rendering!
      const oldRT = renderer.getRenderTarget();
      const oldColor = new THREE.Color();
      // renderer.getClearColor(oldColor);
      renderer.setRenderTarget(renderTarget);
      // renderer.setClearColor(constA);
      // renderer.setClearAlpha(1);
      renderer.render(scene, camera);
      // renderer.setClearAlpha(0);
      renderer.setRenderTarget(oldRT);
      // renderer.setClearColor(oldColor);

      return finalize(renderTarget.texture);

      // if (typeof document === "undefined") {
      //   (renderer.domElement as any as OffscreenCanvas)
      //     .convertToBlob({ type: "image/png" })
      //     .then(finalize);
      // } else {
      //   renderer.domElement.toBlob(finalize as any);
      // }
    }
    render();
  });
}
