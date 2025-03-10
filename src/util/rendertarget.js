import * as THREE from "three";
import { getIdentCamera } from "../external/ffl.js/ffl";

// Web Worker shenanigans
let isWorker = false;
if (typeof window === 'undefined') {
	isWorker = true
}

export function renderTargetToDataURL(renderTarget, renderer, flipY = false, blob = true) {
	return new Promise((resolve) => {
	// Create a new scene using a full-screen quad.
	const scene = new THREE.Scene();
	scene.background = null;
	// Assign a transparent, textured, and double-sided material.
	const material = new THREE.MeshBasicMaterial({
		side: THREE.DoubleSide,
		map: renderTarget.texture,
		transparent: true
	});
	const plane = new THREE.PlaneGeometry(2, 2); // Full-screen quad
	const mesh = new THREE.Mesh(plane, material);
	scene.add(mesh);

	// Use an orthographic camera that fits the full screen.
	const camera = getIdentCamera(flipY);
	// Get previous render target, color space, and size.
	const prevTarget = renderer.getRenderTarget();
	const prevColorSpace = renderer.outputColorSpace;
	const size = new THREE.Vector2();
	renderer.getSize(size);

	// Render to the main canvas to extract pixels.
	renderer.setRenderTarget(null); // Switch render target.
	// Use working color space.
	renderer.outputColorSpace = THREE.ColorManagement ? THREE.ColorManagement.workingColorSpace : null;
	renderer.setSize(renderTarget.width, renderTarget.height, false);
	renderer.render(scene, camera);

	function cleanup() {
		// Cleanup.
		material.dispose();
		plane.dispose();
		scene.remove(mesh);

		// Restore previous size, color space, and target.
		renderer.outputColorSpace = prevColorSpace;
		renderer.setSize(size.x, size.y, false);
		renderer.setRenderTarget(prevTarget);
	}

	// Convert the renderer's canvas to an image.
	if (blob) {
		// assume this is a Web Worker, so it's offscreen canvas. an alt method is used
		// using file reader was kind of dumb so i just create a blob URL in the main worker.ts file
		const ok = blob => {
			resolve({type:"blob", result:blob});
			cleanup();
		}
		if (isWorker) {
			renderer.domElement.convertToBlob({ type: "image/png" }).then(ok);
		} else {
			renderer.domElement.toBlob(ok);
		}
	} else {
		const result = renderer.domElement.toDataURL('image/png');
		// resolve(result);
		resolve({type:"dataURL", result});
		cleanup();
	}
});
}

// ----------- renderTargetToDataTexture(renderTarget, renderer, flipY) -----------
/**
 * Gets a data URL for a render target's texture using the same renderer.
 *
 * @param {THREE.RenderTarget} renderTarget - The render target.
 * @param {THREE.WebGLRenderer} renderer - The renderer (MUST be the same renderer used for the target).
 * @param {Boolean} [flipY=false] - Flip the Y axis. Default is oriented for OpenGL.
 * @returns {Promise<THREE.DataTexture>} The data URL representing the RenderTarget's texture contents.
 */
export async function renderTargetToDataTexture(renderTarget, renderer, flipY = false, filtering = true) {
  const width = renderTarget.width, height = renderTarget.height;
  let buf = new Uint8Array(width * height * 4);
  await renderer.readRenderTargetPixelsAsync(renderTarget, 0, 0, width, height, buf);
  const dataTexture = new THREE.DataTexture(buf, width, height, THREE.RGBAFormat, THREE.UnsignedByteType);
  dataTexture.needsUpdate = true;

  if (flipY) {
    dataTexture.flipY = true;
  }

  if (filtering) {
    dataTexture.minFilter = THREE.LinearFilter;
    dataTexture.magFilter = THREE.LinearFilter;
  }

  // Caller has to update data texture wrap/filter params.
  return dataTexture;
}