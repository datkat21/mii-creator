import { _THREE } from "./PrepareThree";
const THREE = _THREE();
//@ts-expect-error shhh
import type * as THREE from "three";

export function streetpassHandScaling(
  body: THREE.Object3D,
  scaleMul: number = 1
) {
  // // Tuning constant: adjust this to get the smooth effect you like.
  // const k = 0.4; // 20% adjustment

  // var scaleVec = new THREE.Vector3();
  // body.getWorldScale(scaleVec);

  // // Compute the base compensation factors
  // const baseHandScaleX = (1 / scaleVec.x) * scaleMul;
  // const baseHandScaleY = (1 / scaleVec.y) * scaleMul;

  // // Create an adjustment factor that is 1 when scaleVec.y is 1.
  // // If scaleVec.y < 1, (scaleVec.y - 1) is negative so the factor is less than 1.
  // // If scaleVec.y > 1, the factor becomes greater than 1.
  // const adjustmentY = 1 + k * (scaleVec.y - 1);
  // // const adjustmentX = 1 + k * (scaleVec.x - 1);

  // // Apply the adjusted compensation factor for the y-axis.
  // // Here we use the original inverse for x and z, but you can also adjust those if needed.
  // // const adjustedHandScaleX = baseHandScaleX * adjustmentX;
  // const adjustedHandScaleY = baseHandScaleY * adjustmentY;

  // console.log(baseHandScaleX, baseHandScaleY);

  // const handL = body.getObjectByName("handLPs")!;
  // const handR = body.getObjectByName("handRPs")!;

  // handL.scale.set(baseHandScaleX, adjustedHandScaleY, baseHandScaleX);
  // handR.scale.set(baseHandScaleX, adjustedHandScaleY, baseHandScaleX);

  // Tuning constant: adjust this to get the smooth effect you like.
  const k = 0.2; // 20% adjustment

  var scaleVec = new THREE.Vector3();
  body.getWorldScale(scaleVec);

  // Compute the base compensation factors
  const baseHandScaleX = 1 / scaleVec.x;
  const baseHandScaleY = 1 / scaleVec.y;

  // Create an adjustment factor that is 1 when scaleVec.y is 1.
  // If scaleVec.y < 1, (scaleVec.y - 1) is negative so the factor is less than 1.
  // If scaleVec.y > 1, the factor becomes greater than 1.
  const adjustmentFactor = 1 + k * (scaleVec.y - 1);

  // Apply the adjusted compensation factor for the y-axis.
  // Here we use the original inverse for x and z, but you can also adjust those if needed.
  const adjustedHandScaleY = baseHandScaleY * adjustmentFactor;

  body
    .getObjectByName("handLPs")!
    .scale.set(baseHandScaleX, adjustedHandScaleY, baseHandScaleX);
  body
    .getObjectByName("handRPs")!
    .scale.set(baseHandScaleX, adjustedHandScaleY, baseHandScaleX);
}
