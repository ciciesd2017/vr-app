import { renderer, camera, scene, THREE } from './scene.js';
import { VRButton } from 'https://unpkg.com/three@0.161.0/examples/jsm/webxr/VRButton.js';

export function mountVR({ domOverlayRoot } = {}) {
    // const sessionInit = {
    //     optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers', 'dom-overlay'],
    // };
    // document.body.appendChild(VRButton.createButton(renderer, sessionInit)); //sessionInit
    // renderer.xr.enabled = true;
    const sessionInit = {
        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers', 'dom-overlay'],
        ...(domOverlayRoot ? { domOverlay: { root: domOverlayRoot } } : {}),
    };
    document.body.appendChild(VRButton.createButton(renderer, sessionInit));
    renderer.xr.enabled = true;
}

// 讓 VR 相機正確分派左右眼圖層（stereoTB）
renderer.xr.addEventListener('sessionstart', () => {
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

function buildRay() {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);
    const mat = new THREE.LineBasicMaterial({});
    const line = new THREE.Line(geo, mat);
    line.name = 'ray';
    line.scale.z = 2;
    return line;
}

export function createControllers(onSelectEnd) {
    const c0 = renderer.xr.getController(0);
    const c1 = renderer.xr.getController(1);
    c0.add(buildRay());
    c1.add(buildRay());
    scene.add(c0, c1);
    c0.addEventListener('selectend', onSelectEnd);
    c1.addEventListener('selectend', onSelectEnd);


    const handler = () => {
        try {
            onSelectEnd && onTrigger();
        } catch (e) {
            console.warn(e);
        }
    };
    c0.addEventListener('selectstart', handler);
    c1.addEventListener('selectstart', handler);
}

// 在初始化 XR（或 createControllers）後執行
function bindPanelHotkeyInXR(devPanel) {
    const left = renderer.xr.getController(0);
    const right = renderer.xr.getController(1);
    [left, right].forEach((ctrl) => {
        if (!ctrl) return;
        ctrl.addEventListener('squeezestart', () => devPanel.toggle());
    });
}

/**
 * 綁定 XR session 狀態以顯示/隱藏 DOM Overlay（vrHud）
 */
export function bindXRHudVisibility({ hudEl }) {
    if (!hudEl) return;

    // 進入 XR
    renderer.xr.addEventListener('selectstart', () => {
        const session = renderer.xr.getSession?.();
        // 若支援 DOM Overlay，顯示 HUD；否則可維持隱藏（避免在 HMD 中看不到/不能點）
        const hasDomOverlay = !!session?.domOverlayState;
        hudEl.style.display = hasDomOverlay ? 'block' : 'none';
    });

    // 離開 XR
    renderer.xr.addEventListener('sessionend', () => {
        hudEl.style.display = 'none';
    });
}

// 進入/退出 Session 時顯示提示
renderer.xr.addEventListener('sessionend', () => {
    console.log('VR 結束');
});
