import { renderer, camera, scene, THREE } from "./scene.js";
import { VRButton } from "https://unpkg.com/three@0.161.0/examples/jsm/webxr/VRButton.js";

export function mountVR() {
  // renderer.xr.enabled = true;

  // // 避免重複插入按鈕
  // const old = document.getElementById('VRButton');
  // if (old) old.remove();

  // const btn = VRButton.createButton(renderer, {
  //   // 更保守、最廣支援
  //   requiredFeatures: ['local-floor'],
  //   optionalFeatures: [] // 需要再加（如 hand-tracking）再說
  // });

  // // 確保在你的 UI 之上（避免被 #ui 蓋住）
  // btn.style.zIndex = '10000';
  // btn.style.left = '16px';
  // btn.style.bottom = '16px';
  // document.body.appendChild(btn);

  const sessionInit = {
    optionalFeatures: ["local-floor"],
    // optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers', 'dom-overlay'],
    // domOverlay: { root: document.body }, // 或者 document.getElementById('app-root')
  };

  document.body.appendChild(VRButton.createButton(renderer)); //, sessionInit
  renderer.xr.enabled = true;
}

// 讓 VR 相機正確分派左右眼圖層（stereoTB）
renderer.xr.addEventListener("sessionstart", () => {
  const xrCam = renderer.xr.getCamera();
  if (xrCam.isArrayCamera && xrCam.cameras?.length >= 2) {
    const leftCam = xrCam.cameras[0];
    const rightCam = xrCam.cameras[1];
    leftCam.layers.enable(1); // 看到 skyLeft
    rightCam.layers.enable(2); // 看到 skyRight
    // 確保主相機不渲染分眼層，避免桌面模式殘留
    camera.layers.disable(1);
    camera.layers.disable(2);
  }
});

const controller0 = renderer.xr.getController(0);
const controller1 = renderer.xr.getController(1);
scene.add(controller0);
scene.add(controller1);

// renderer.xr.addEventListener("sessionstart", () => {
//   console.log('VR 開始：捏握 (squeeze) 可開/關面板；或對著麥克風說「開啟面板」。');
//   const xrCam = renderer.xr.getCamera();
//   if (xrCam.isArrayCamera && xrCam.cameras?.length >= 2) {
//     const left = xrCam.cameras[0];
//     const right = xrCam.cameras[1];
//     left.layers.enable(1);
//     right.layers.enable(2);
//     camera.layers.disable(1);
//     camera.layers.disable(2);
//   }
// });

function buildRay() {
  const geo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1),
  ]);
  const mat = new THREE.LineBasicMaterial({});
  const line = new THREE.Line(geo, mat);
  line.name = "ray";
  line.scale.z = 2;
  return line;
}

export function createControllers(onSelectEnd) {
  const c0 = renderer.xr.getController(0);
  const c1 = renderer.xr.getController(1);
  c0.add(buildRay());
  c1.add(buildRay());
  scene.add(c0, c1);
  c0.addEventListener("selectend", onSelectEnd);
  c1.addEventListener("selectend", onSelectEnd);
}

// 在初始化 XR（或 createControllers）後執行
function bindPanelHotkeyInXR(devPanel) {
  const left = renderer.xr.getController(0);
  const right = renderer.xr.getController(1);
  [left, right].forEach((ctrl) => {
    if (!ctrl) return;
    ctrl.addEventListener("squeezestart", () => devPanel.toggle());
  });
}

// 進入/退出 Session 時顯示提示
renderer.xr.addEventListener("sessionend", () => {
  console.log("VR 結束");
});
