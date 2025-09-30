import { THREE, camera, scene } from "./scene.js";
import { PLAYLIST_MUSIC, USER_HEAD_HEIGHT } from "./constants.js";

export class AudioPlayer {
  constructor() {
    this.listener = new THREE.AudioListener();
    camera.add(this.listener);
    this.loader = new THREE.AudioLoader();
    this.sound = new THREE.PositionalAudio(this.listener);
    this.bufferCache = new Map();
    this.index = 0;
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.1),
      new THREE.MeshStandardMaterial()
    );
    sphere.position.set(2, USER_HEAD_HEIGHT, -1);
    sphere.add(this.sound);
    sphere.visible = false;
    scene.add(sphere);
  }
  async #load(url) {
    if (this.bufferCache.has(url)) return this.bufferCache.get(url);
    const buffer = await new Promise((res) => this.loader.load(url, res));
    this.bufferCache.set(url, buffer);
    return buffer;
  }
  async togglePlayPause() {
    if (!this.sound.isPlaying) {
      const buf = await this.#load(PLAYLIST_MUSIC[this.index].url);
      this.sound.setBuffer(buf);
      this.sound.setLoop(true);
      this.sound.play();
    } else {
      this.sound.pause();
    }
  }
  stop() {
    this.sound.stop();
  }
  async next() {
    this.index = (this.index + 1) % PLAYLIST_MUSIC.length;
    const buf = await this.#load(PLAYLIST_MUSIC[this.index].url);
    const wasPlaying = this.sound.isPlaying;
    this.sound.stop();
    this.sound.setBuffer(buf);
    this.sound.setLoop(true);
    if (wasPlaying) this.sound.play();
  }
}
