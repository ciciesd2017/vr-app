// DRACO/KTX2/GLTF/Texture
import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://unpkg.com/three@0.161.0/examples/jsm/loaders/DRACOLoader.js";
import { KTX2Loader } from "https://unpkg.com/three@0.161.0/examples/jsm/loaders/KTX2Loader.js";
import { renderer } from "./scene.js";

export const textureLoader = new THREE.TextureLoader();

const draco = new DRACOLoader().setDecoderPath(
  "https://unpkg.com/three@0.161.0/examples/jsm/libs/draco/"
);
const ktx2 = new KTX2Loader()
  .setTranscoderPath("https://unpkg.com/three@0.161.0/examples/jsm/libs/basis/")
  .detectSupport(renderer);

export const gltf = new GLTFLoader();
gltf.setDRACOLoader(draco);
gltf.setKTX2Loader(ktx2);

export { THREE };
