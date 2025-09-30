import { THREE } from "./scene.js";
import { DEFAULT_MODEL_TARGET_SIZE } from "./constants.js";

export function fitObject(
  object,
  targetSize = DEFAULT_MODEL_TARGET_SIZE,
  centerToOrigin = false
) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = targetSize / maxDim;
  object.scale.setScalar(scale);
  if (centerToOrigin) object.position.sub(center.multiplyScalar(scale));
}

export function randomRingPosition(
  radiusMin = 1.2,
  radiusMax = 2.8,
  forwardOffset = -1.2
) {
  const r = radiusMin + Math.random() * (radiusMax - radiusMin);
  const theta = Math.random() * Math.PI - Math.PI / 2;
  return new THREE.Vector3(
    Math.cos(theta) * r,
    0,
    Math.sin(theta) * r + forwardOffset
  );
}

export function disposeObject(root) {
  if (!root) return;
  root.traverse((c) => {
    if (c.material) {
      if (Array.isArray(c.material)) {
        c.material.forEach((m) => m.dispose?.());
      } else {
        c.material.dispose?.();
      }
    }
    if (c.geometry) c.geometry.dispose?.();
    if (c.texture) c.texture.dispose?.();
  });

  // root.traverse((o) => {
  //   if (!o.isMesh) return;
  //   o.geometry?.dispose();
  //   const m = o.material;
  //   if (Array.isArray(m))
  //     m.forEach((mm) => {
  //       mm.map?.dispose();
  //       mm.dispose?.();
  //     });
  //   else {
  //     m?.map?.dispose();
  //     m?.dispose?.();
  //   }
  // });
}

export function fixMaterialColorSpace(root, renderer) {
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    const mat = obj.material;
    if (mat?.map) {
      mat.map.colorSpace = THREE.SRGBColorSpace;
      mat.map.anisotropy = maxAniso;
    }
    if (mat?.emissiveMap) {
      mat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
      mat.emissiveMap.anisotropy = maxAniso;
    }
  });
}
