// 三方套件 CDN 版本集中管理（必要時可改為本地/打包）
export const THREE_VER = "0.161.0";
export const THREE_BASE = `https://unpkg.com/three@${THREE_VER}`;

// 視覺與相機
export const CANVAS_BG_COLOR = 0x000000;
export const CAMERA_FOV = 70;
export const CAMERA_NEAR = 0.01;
export const CAMERA_FAR = 1000;
export const SKY_RADIUS = 60;
export const DEFAULT_MODEL_TARGET_SIZE = 1.2;
export const CONTROLS_TARGET = { x: 0, y: 1.4, z: 0 };
export const USER_HEAD_HEIGHT = 1.6;

// 紋理預設
export const TEX_MIN_FILTER = "LinearMipmapLinearFilter";
export const TEX_MAG_FILTER = "LinearFilter";



// 資產清單（可抽到 JSON 或後台）
export const BASE_ASSETS = (window.__vite__ ? import.meta.env.BASE_URL : './');

export const SKYBOXES = [
  // { url: `${BASE_ASSETS}assets/textures/MarsMap.jpg`, mode: "stereoTB" },
  { url: `${BASE_ASSETS}assets/textures/paris.jpg`, mode: "stereoTB" },
  { url: `${BASE_ASSETS}assets/textures/alps_field.jpg`, mode: "stereoTB" },
  { url: `${BASE_ASSETS}assets/textures/chess-pano-4k.jpg`, mode: "stereoTB" },
  { url: `${BASE_ASSETS}assets/textures/rogland_clear_night.jpg`, mode: "stereoTB" },
  { url: `${BASE_ASSETS}assets/textures/stierberg_sunrise.jpg`, mode: "stereoTB" },
];

export const ALL_MODELS = [
    `${BASE_ASSETS}assets/models/BG-60x100.glb`, // ground
    `${BASE_ASSETS}assets/models/cat.glb`, // ground
    `${BASE_ASSETS}assets/models/t_rex.glb`,
    `${BASE_ASSETS}assets/models/horse.glb`,
    `${BASE_ASSETS}assets/models/cat.glb`,
    `${BASE_ASSETS}assets/models/plant.glb`,
    `${BASE_ASSETS}assets/models/duck.glb`,
    `${BASE_ASSETS}assets/models/shiba.glb`,
];
export const GROUND_MODEL_URL = ALL_MODELS[0];
export const MODEL_URLS = ALL_MODELS.slice(1);

export const PLAYLIST_MUSIC = [
  { title: "Bell", url: `${BASE_ASSETS}assets/media/forest_lullaby.mp3` },
  { title: "Ambient", url: `${BASE_ASSETS}assets/media/to_the_shining_sky.mp3` },
  { title: "Drums", url: `${BASE_ASSETS}assets/media/at_the_side_of_an_rpg_village.mp3` },
];

export const PLAYLIST_VIDEO = [{ title: "Sea", url: `${BASE_ASSETS}assets/media/sea.mp4` }];
