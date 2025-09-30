import { THREE, scene } from "./scene.js";
import { PLAYLIST_VIDEO, USER_HEAD_HEIGHT } from "./constants.js";

export class VideoScreen {
  video = null;
  screen = null;
  async open(src = PLAYLIST_VIDEO[0].url) {
    if (this.screen) return;
    this.video = document.createElement("video");
    this.video.src = src;
    this.video.loop = true;
    this.video.muted = false;
    this.video.playsInline = true;
    await this.video.play();
    const tex = new THREE.VideoTexture(this.video);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    const width = 2,
      height = (2 * 9) / 16;
    const geo = new THREE.PlaneGeometry(width, height);
    const mat = new THREE.MeshBasicMaterial({ map: tex });
    this.screen = new THREE.Mesh(geo, mat);
    this.screen.position.set(0, USER_HEAD_HEIGHT, -3);
    scene.add(this.screen);
  }
  async close() {
    if (!this.video || !this.screen) return;
    this.video.pause();
    this.video.src = "";
    this.video.load();
    scene.remove(this.screen);
    this.screen.material.map.dispose();
    this.screen.material.dispose();
    this.screen.geometry.dispose();
    this.video = null;
    this.screen = null;
  }
}
