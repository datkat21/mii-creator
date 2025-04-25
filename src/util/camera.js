import { _THREE } from "./PrepareThree";
const THREE = _THREE();

window.THREE3 = THREE;
/**
 * @enum {number}
 */
export const ViewType = {
  Face: 0, // Typical icon body view.
  MakeIcon: 1, // FFLMakeIcon matrix
  // Custom
  IconFovy45: 2,
  AllBody: 3,
  AllBodySugar: 4,
  CreditIcon: 5, 
};

// TODO: private?
// -------------- getCameraForViewType(viewType, width, height) --------------
/**
 * @param {ViewType} viewType - The {@link ViewType} enum value.
 * @param {number} width - Width of the view.
 * @param {number} height - Height of the view.
 * @param {number} h - Height of  me.
 * @returns {import('three').PerspectiveCamera} The camera representing the view type specified.
 * @throws {Error} not implemented (ViewType.Face)
 */
export function getCameraForViewType(viewType, width = 1, height = 1, miiHeight = 1) {
  const aspect = width / height;
  switch (viewType) {
    case ViewType.Face: {
      // FFL-Testing equivalent:
      const fovy = 15; // Math.atan2(43.2 / aspect, 500) / 0.5;
      const camera = new THREE.PerspectiveCamera(fovy, aspect, 0.1, 1000);
      camera.position.set(0, 34.5, 380);//411.181793);
      camera.lookAt(0, 34.3, 0.0);
      // pCamera->at()  = { 0.0f, 34.3f, 0.0f };

      return camera;
    }
    case ViewType.MakeIcon: {
      const fovy = 9.8762; // rad2deg(Math.atan2(43.2 / aspect, 500) / 0.5);
      const camera = new THREE.PerspectiveCamera(fovy, aspect, 500, 1000);
      camera.position.set(0, 34.5, 600);
      camera.lookAt(0, 34.5, 0.0);
      return camera;
    }
    case ViewType.IconFovy45: {
      const camera = new THREE.PerspectiveCamera(45, aspect, 50, 1000);
      camera.position.set(0, 34, 110);
      camera.lookAt(0, 34, 0);
      return camera;
    }
    case ViewType.AllBody: {
      const fovy = 15;
      const camera = new THREE.PerspectiveCamera(fovy, aspect, 50, 1500);
      camera.position.set(0, 50, 900);
      camera.lookAt(0, 105, 0);
      return camera;
    }
    case ViewType.AllBodySugar: {
      const fovy = 15;
      const camera = new THREE.PerspectiveCamera(fovy, aspect, 50, 15000);

      // These camera parameters look right when the character is tallest
      const posStart = new THREE.Vector3(0.0, 65.0, 550.0);
      const atStart = new THREE.Vector3(0.0, 65.0, 0.0);

      // Likewise these look correct when it's shortest.
      const posEnd = new THREE.Vector3(0.0, 75.0, 850.0);
      const atEnd =  new THREE.Vector3(0.0, 88.0, 0.0);

      // Calculate interpolation factor (normalized to range [0, 1])
      const t = (miiHeight - 0.5) / (1.264 - 0.5);

      // Interpolate between start and end positions
      const pos = new THREE.Vector3(
        posStart.x + t * (posEnd.x - posStart.x),
        posStart.y + t * (posEnd.y - posStart.y),
        posStart.z + t * (posEnd.z - posStart.z)
      );

      // Interpolate between start and end target positions
      const at = new THREE.Vector3(
        atStart.x + t * (atEnd.x - atStart.x),
        atStart.y + t * (atEnd.y - atStart.y),
        atStart.z + t * (atEnd.z - atStart.z)
      );

      // console.log("pos:", pos.toArray());
      // console.log("lookAt:", at.toArray());

      // Set the camera position and look-at target
      camera.position.copy(pos);
      camera.lookAt(at);

      return camera;
    }
    case ViewType.CreditIcon: {
      const fovy = 15;
      const camera = new THREE.PerspectiveCamera(fovy, aspect, 0.1, 1000);
      camera.position.set(-60, 34.5, 380);
      camera.lookAt(0, 34.3, 0.0);
      return camera;
    }
    default:
      throw new Error('getCameraForViewType: not implemented');
  }
}