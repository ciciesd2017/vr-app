import { scene, camera, renderer, THREE } from "./scene.js";
import { textureLoader } from "./loaders.js";
import { SKY_RADIUS } from "./constants.js";

export class SkyboxManager {
  skyMono = null;
  skyLeft = null;
  skyRight = null;
  index = -1;

  disposeOne(mesh) {
    if (!mesh) return;
    scene.remove(mesh);
    mesh.geometry?.dispose();
    mesh.material?.map?.dispose();
    mesh.material?.dispose?.();
  }
  disposeAll() {
    this.disposeOne(this.skyMono);
    this.skyMono = null;
    this.disposeOne(this.skyLeft);
    this.skyLeft = null;
    this.disposeOne(this.skyRight);
    this.skyRight = null;
  }

  setMono(url) {
    textureLoader.load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.mapping = THREE.EquirectangularReflectionMapping;
      this.disposeAll();
      const geo = new THREE.SphereGeometry(SKY_RADIUS, 32, 32);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.BackSide,
        depthWrite: false,
      });
      this.skyMono = new THREE.Mesh(geo, mat);
      this.skyMono.name = "SkyDomeMono";
      scene.add(this.skyMono);
    });
  }

  setStereoTB(url) {
    textureLoader.load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.mapping = THREE.EquirectangularReflectionMapping;
      this.disposeAll();
      const geo = new THREE.SphereGeometry(SKY_RADIUS, 64, 64);
      if (!renderer.xr.isPresenting) {
        const mono = tex.clone();
        mono.needsUpdate = true;
        mono.repeat.set(1, 0.5);
        mono.offset.set(0, 0.5);
        const mat = new THREE.MeshBasicMaterial({
          map: mono,
          side: THREE.BackSide,
          depthWrite: false,
        });
        this.skyMono = new THREE.Mesh(geo, mat);
        scene.add(this.skyMono);
        return;
      }
      const texL = tex.clone();
      texL.needsUpdate = true;
      texL.repeat.set(1, 0.5);
      texL.offset.set(0, 0.5);
      const matL = new THREE.MeshBasicMaterial({
        map: texL,
        side: THREE.BackSide,
        depthWrite: false,
      });
      this.skyLeft = new THREE.Mesh(geo.clone(), matL);
      this.skyLeft.layers.set(1);
      scene.add(this.skyLeft);
      const texR = tex.clone();
      texR.needsUpdate = true;
      texR.repeat.set(1, 0.5);
      texR.offset.set(0, 0);
      const matR = new THREE.MeshBasicMaterial({
        map: texR,
        side: THREE.BackSide,
        depthWrite: false,
      });
      this.skyRight = new THREE.Mesh(geo.clone(), matR);
      this.skyRight.layers.set(2);
      scene.add(this.skyRight);
    });
  }

  set(entry) {
    if (!entry) return;
    entry.mode === "stereoTB"
      ? this.setStereoTB(entry.url)
      : this.setMono(entry.url);
  }
  next(list) {
    this.index = (this.index + 1) % list.length;
    this.set(list[this.index]);
  }
  tickFollowCamera() {
    const p = camera.position;
    this.skyMono?.position.copy(p);
    this.skyLeft?.position.copy(p);
    this.skyRight?.position.copy(p);
  }
}
