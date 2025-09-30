import { scene, renderer, THREE } from "./scene.js";
import { gltf } from "./loaders.js";
import {
  fitObject,
  fixMaterialColorSpace,
  randomRingPosition,
  disposeObject,
} from "./utils.js";
import { DEFAULT_MODEL_TARGET_SIZE } from "./constants.js";

// 1) 單一容器：所有模型都加到這裡
const modelsRoot = new THREE.Group();
modelsRoot.name = "ModelsRoot";
scene.add(modelsRoot);

// 2) 旗標：標記哪些 Object3D 是「模型根節點」
const MODEL_TAG = "__isManagedModel";

// 3) 可選：保留一份清單（避免 this 問題，不用 Map 也行）
const tracked = new Set();

export class ModelManager {
  
  constructor(anim) {
    this.anim = anim;
    this.current = null;
    this.index = -1;
  }

  addGround(url) {
    // console.log("Ground:"+url)
    gltf.load(
      url,
      (g) => {
        const root = g.scene || g.scenes[0];
        root.position.set(0, 0, 0);
        fixMaterialColorSpace(root, renderer);
        scene.add(root);
      },
      undefined,
      (err) => console.warn("載入地面失敗", err)
    );
  }

  add(url, { randomPlace = true, autoPlay = true } = {}) {
    gltf.load(
      url,
      (g) => {
        const root = g.scene || g.scenes[0];
        fitObject(root, DEFAULT_MODEL_TARGET_SIZE + Math.random() * 0.6);
        root.position.copy(
          randomPlace ? randomRingPosition() : new THREE.Vector3(0, 0, -1.2)
        );
        fixMaterialColorSpace(root, renderer);

        this.current = root;
        
        root.userData.sourceUrl = url;
        root.userData[MODEL_TAG] = true;       // 打上旗標
        modelsRoot.add(root);                   // 統一掛到容器
        tracked.add(root);                      // 追蹤（為了保險）
        

        scene.add(root);
        this.anim.add(root, g.animations, autoPlay);
      },
      undefined,
      (err) => console.warn("載入模型失敗", err)
    );
  }

  next(list) {
    this.index = (this.index + 1) % list.length;
    this.add(list[this.index]);
  }
  
  /** 清空所有模型（容器優先，容器為空則遍歷整個場景，以旗標清除） */
  clear() {
    let removed = 0;

    // console.debug(`[models.clear] children=${modelsRoot.children.length}`);
    // 3a) 首選：清容器（複製 children，避免邊移除邊遍歷）
    if (modelsRoot.children.length > 0) {
      const children = [...modelsRoot.children];
      for (const child of children) {
        modelsRoot.remove(child);
        disposeObject(child);
        tracked.delete(child);
        removed++;
      }
    }

    // 3b) 後備：若容器是空的，可能先前模型沒掛進容器 → 遍歷整個 scene 找旗標
    if (removed === 0) {
      const toRemove = [];
      scene.traverse((o) => {
        if (o.userData && o.userData[MODEL_TAG] === true) {
          // 只移除被管理的根節點（確保有 parent）
          if (o.parent) toRemove.push(o);
        }
      });
      // console.debug(`[models.clear] toRemove=${toRemove}`);
      for (const node of toRemove) {
        node.parent.remove(node);
        disposeObject(node);
        tracked.delete(node);
        removed++;
      }
    }

    // console.debug(`[models.clear] removed=${removed}`);
  }

  /** （可選）移除最後一個 */
  removeLast() {
    let target = null;

    // 1) 先用堆疊（最可靠）
    while (tracked.length && !target) {
      const cand = tracked.pop();
      if (cand && cand.parent) target = cand;
    }

    // 2) 堆疊拿不到 → 看 modelsRoot.children
    if (!target && modelsRoot.children.length) {
      target = modelsRoot.children.at(-1);
    }

    // 3) 仍拿不到 → 遍歷整個 scene（歷史上沒經過 add 的遺漏）
    if (!target) {
      let last = null, lastTs = -Infinity;
      scene.traverse((o) => {
        if (o.userData?.[MODEL_TAG] === true && o.parent) {
          const ts = o.userData.addedAt ?? 0;
          if (ts >= lastTs) { last = o; lastTs = ts; }
        }
      });
      target = last;
    }

    if (!target) {
      console.debug("[models.removeLast] 沒有可移除的模型");
      return;
    }

    // 實際移除
    target.parent.remove(target);
    disposeObject(target);
    // 從堆疊中清（保險）
    // const idx = tracked.indexOf(target);
    // if (idx >= 0) tracked.splice(idx, 1);

    // console.debug("[models.removeLast] removed:", target.name || target.uuid);
  
  }

  /** （可選）列出目前所有已追蹤的根節點 */
  all() {
    return Array.from(tracked);
  }



  addAllRow(list) {
    list.forEach((url, i) => {
      // console.log("model:"+url)
      gltf.load(
        url,
        (g) => {
          const root = g.scene || g.scenes[0];
          root.position.set(i * 1 - list.length / 2, 0, -2);
          fixMaterialColorSpace(root, renderer);
          scene.add(root);
          this.anim.add(root, g.animations, true);
        },
        undefined,
        (err) => console.warn("載入模型失敗", err)
      );
    });
  }
}
