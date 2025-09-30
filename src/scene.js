// Renderer / Scene / Camera / Controls / Lights

import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js";
import {
  CAMERA_FAR,
  CAMERA_FOV,
  CAMERA_NEAR,
  CANVAS_BG_COLOR,
  CONTROLS_TARGET,
  USER_HEAD_HEIGHT,
} from "./constants.js";

export const scene = new THREE.Scene();
scene.background = new THREE.Color(CANVAS_BG_COLOR);

export const renderer = new THREE.WebGLRenderer({
  // antialias: true, 
  // alpha: false,
  antialias: false,
  powerPreference: "high-performance",
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio)); // 稍提清晰度、避免過高
renderer.setSize(innerWidth, innerHeight);
renderer.xr.enabled = true; // 已在 mountVR 再保險設一次也可
document.body.appendChild(renderer.domElement);

// renderer.outputColorSpace = THREE.SRGBColorSpace;
// renderer.toneMapping = THREE.NoToneMapping;
// renderer.toneMappingExposure = 1.6;
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// renderer.setSize(innerWidth, innerHeight);
// renderer.xr.enabled = true;
// renderer.shadowMap.enabled = true;
// document.body.appendChild(renderer.domElement);

export const camera = new THREE.PerspectiveCamera(
  CAMERA_FOV,
  innerWidth / innerHeight,
  CAMERA_NEAR,
  CAMERA_FAR
);
camera.position.set(0, USER_HEAD_HEIGHT, 3);

export const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(CONTROLS_TARGET.x, CONTROLS_TARGET.y, CONTROLS_TARGET.z);
controls.enableDamping = true;

// Lights
scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 2.0));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);
scene.add(new THREE.AmbientLight(0xffffff, 0.2));

export { THREE };
