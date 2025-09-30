import { THREE } from "./scene.js";

export class AnimationManager {
  mixers = [];
  actions = [];
  add(root, animations, autoPlay = true) {
    if (animations?.length) {
      const mixer = new THREE.AnimationMixer(root);
      const action = mixer.clipAction(animations[0]);
      action.clampWhenFinished = true;
      action.enabled = true;
      if (autoPlay) action.play();
      this.mixers.push(mixer);
      this.actions.push(action);
    } else {
      this.mixers.push(null);
      this.actions.push(null);
    }
  }
  update(delta) {
    for (const m of this.mixers) if (m) m.update(delta);
  }
  play(i) {
    a.play?.();
  }
  pause(i) {
    const a = this.actions[i];
    if (a) a.paused = true;
  }
  resume(i) {
    const a = this.actions[i];
    if (a) a.paused = false;
  }
  stop(i) {
    this.actions[i]?.stop?.();
  }
  seekToStart(i) {
    const a = this.actions[i];
    if (a) {
      a.reset();
      a.paused = true;
    }
  }
  playAll() {
    this.actions.forEach((a) => a?.stop?.());
    this.actions.forEach((a) => a?.play?.());
  }
  pauseAll() {
    this.actions.forEach((a) => {
      if (a) a.paused = true;
    });
  }
  resumeAll() {
    this.actions.forEach((a) => {
      if (a) a.paused = false;
    });
  }
  stopAll() {
    this.actions.forEach((a) => a?.stop?.());
  }
  playNTimesExact(i, totalTimes = 1) {
    const a = this.actions[i];
    const m = this.mixers[i];
    if (!a || !m) return;
    a.stop();
    a.reset();
    a.setLoop(THREE.LoopOnce, 0);
    a.paused = false;
    let count = 0;
    const onFinished = (e) => {
      if (e.action !== a) return;
      count++;
      if (count >= totalTimes) {
        m.removeEventListener("finished", onFinished);
        a.clampWhenFinished = true;
        a.paused = true;
        return;
      }
      a.reset();
      a.play();
    };
    m.addEventListener("finished", onFinished);
    a.play();
  }
  playAllNTimesExact(n = 1) {
    this.actions.forEach((_, i) => this.playNTimesExact(i, n));
  }
}
