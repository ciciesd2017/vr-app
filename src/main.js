import { scene, camera, renderer, controls, THREE } from "./scene.js";
import { SKYBOXES, MODEL_URLS, GROUND_MODEL_URL } from "./constants.js";
import { SkyboxManager } from "./skybox.js";
import { AnimationManager } from "./animation.js";
import { ModelManager } from "./models.js";
import { AudioPlayer } from "./audio.js";
import { VideoScreen } from "./video.js";
import { mountVR, createControllers } from "./xr.js";
import { bindUI } from "./ui.js";
import { VoiceController } from "./voice.js";
import { DevPanel } from "./devpanel.js";

// 實例化核心模組
const sky = new SkyboxManager();
const anim = new AnimationManager();
const models = new ModelManager(anim);
const audioPlayer = new AudioPlayer();
const videoPanel = new VideoScreen();
const voice = new VoiceController({ sky, models, anim, audioPlayer, videoPanel, lists: { SKYBOXES, MODEL_URLS } });

// 初始化
mountVR();
models.addGround(GROUND_MODEL_URL);
sky.next(SKYBOXES);
models.addAllRow(MODEL_URLS);

// XR Controller 事件
createControllers((event) => {
  const hand = (event.data && event.data.handedness) || "unknown";
  if (hand === "left") models.next(MODEL_URLS);
  else sky.next(SKYBOXES);
});

// UI 綁定
bindUI({
  sky,
  models,
  anim,
  audioPlayer,
  videoPanel,
  lists: { SKYBOXES, MODEL_URLS },
});

function onWindowResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
}

renderer.xr.addEventListener('sessionstart', () => {
  controls && (controls.enabled = false);
  onWindowResize();
});

renderer.xr.addEventListener('sessionend', () => {
  // 視需要：回到一般迴圈或停掉
  controls && (controls.enabled = true);
  // renderer.setAnimationLoop(null);
  onWindowResize();
});

window.addEventListener('resize', onWindowResize);


// 建立 DevPanel（預設隱藏，按 M 顯示/隱藏）
const devPanel = new DevPanel({
  renderer,
  sky,
  models,
  audioPlayer,
  videoPanel,
  anim,
  lists: { SKYBOXES, MODEL_URLS },
});


// 主迴圈
const clock = new THREE.Clock();
renderer.setAnimationLoop((time, frame) => {

  const delta = clock.getDelta();
  anim.update(delta);

  // 更新面板統計
  devPanel.update();

  controls.update();
  sky.tickFollowCamera();
  renderer.render(scene, camera);
});
