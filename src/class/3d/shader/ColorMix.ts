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
                          
        // Mix alpha channels using each constant’s alpha (a)
        float mixedAlpha = texColor.r * u_const1.a +
                           texColor.g * u_const2.a +
                           texColor.b * u_const3.a;
      
        gl_FragColor = vec4(mixedColor, mixedAlpha);
      }
    `
  });
}

export function colorMixTexture(
  tex: THREE.Texture,
  constR: THREE.Vector4Like = new THREE.Vector4(0, 1, 1, 1),
  constG: THREE.Vector4Like = new THREE.Vector4(1, 1, 0, 1),
  constB: THREE.Vector4Like = new THREE.Vector4(1, 1, 0, 1)
) {
  return new Promise<Blob>((resolve) => {
    // --- Scene, Camera, and Renderer Setup ---
    const scene = new THREE.Scene();
    const width = tex.image.width;
    const height = tex.image.height;

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

    // Create the WebGL renderer and add its canvas to the document.
    const renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
    // renderer.setClearColor(0x314c4b);
    renderer.setClearAlpha(0);
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    console.time("draw texture");

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
      renderer.render(scene, camera);

      renderer.domElement.toBlob((blob) => {
        if (blob === null) return console.error("blob is null???");
        resolve(blob);
        renderer.dispose();
        geometry.dispose();
      });
    }
    render();
  });
}
