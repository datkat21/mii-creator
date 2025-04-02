import * as THREE from "three";

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
  constA: THREE.ColorRepresentation,
  rendererMain: THREE.WebGLRenderer,
  textureResolution?: number
): Promise<Blob> {
  return new Promise<Blob>((resolve) => {
    // --- Scene, Camera, and Renderer Setup ---
    const scene = new THREE.Scene();
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

    console.log(
      "HI ITS ME CLOTHING TEX RENDERER, IDK WTF I DID",
      width,
      height
    );

    // be nice and save the current renderer's stuff
    const renderSize = new THREE.Vector2(0, 0);
    rendererMain.getSize(renderSize);

    console.log("[CMT DEBUG] width, height", width, height);

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
    console.log("[CMT DEBUG] camera Created!");

    // Create the WebGL renderer and add its canvas
    const renderer = rendererMain; // || new THREE.WebGLRenderer();
    console.log("[CMT DEBUG] renderer Created!");

    let oldClearColor = new THREE.Color();
    renderer.getClearColor(oldClearColor);
    let oldClearAlpha = renderer.getClearAlpha();
    // if (constA) {
    //   renderer.setClearColor(constA);
    //   console.log("[CMT DEBUG] using constA for alpha.");
    // } else {
    //   renderer.setClearColor(0xff0000);
    //   console.log("[CMT DEBUG] using red for alpha.");
    // }
    // renderer.setClearColor(constA);
    renderer.setClearColor(constA, 1);
    console.log("[CMT DEBUG] using red for alpha.");
    renderer.setSize(width, height, false);
    console.log("[CMT DEBUG] set renderer size OK.");

    if (typeof window !== "undefined")
      //@ts-expect-error
      window.camera = camera;

    // --- Create a Plane Geometry ---
    const geometry = new THREE.PlaneGeometry(width, height);
    console.log("[CMT DEBUG] create geometry OK");
    const plane = new THREE.Mesh(
      geometry,
      ColorMixShaderMaterial(tex, constR, constG, constB)
    );
    console.log("[CMT DEBUG] create mesh OK");

    scene.add(plane);
    console.log("[CMT DEBUG] add mesh to scene");

    function render() {
      // renderer.setSize(renderSize.x, renderSize.y, false);
      console.log("[CMT DEBUG] render scene OK");

      function finalize(blob: Blob) {
        if (blob === null) return console.error("blob is null???");
        resolve(blob);

        renderer.setClearColor(0x000000);
        renderer.setClearAlpha(0);

        geometry.dispose();
        plane.material.dispose();
        console.log("[CMT DEBUG] disposed of scene OK");
      }

      renderer.setSize(width, height, false);
      renderer.render(scene, camera);

      // renderer.setClearAlpha(0);
      // renderer.setClearColor(0xff0000);
      renderer.setClearAlpha(0);

      if (typeof document === "undefined") {
        (renderer.domElement as any as OffscreenCanvas)
          .convertToBlob({ type: "image/png" })
          .then(finalize);
      } else {
        renderer.domElement.toBlob(finalize as any);
      }
    }
    console.log("[CMT DEBUG] preparing render");
    render();
  });
}
