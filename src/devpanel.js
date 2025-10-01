// src/devpanel.js
export class DevPanel {
    constructor({ renderer, sky, models, audioPlayer, videoPanel, anim, lists }) {
        this.renderer = renderer;
        this.sky = sky;
        this.models = models;
        this.audio = audioPlayer;
        this.video = videoPanel;
        this.anim = anim;
        this.lists = lists || {};
        this._visible = false;

        this._lastFrameTs = performance.now();
        this._fps = 0;

        this._rafCounter = 0;
        this._initDOM();
        this._bindHotkey();
    }

    _initDOM() {
        // 容器
        this.root = document.createElement('div');
        this.root.id = 'dev-panel';
        Object.assign(this.root.style, {
            position: 'fixed',
            right: '16px',
            top: '16px',
            width: '320px',
            maxHeight: '70vh',
            overflow: 'auto',
            padding: '12px',
            background: 'rgba(0,0,0,.7)',
            color: '#fff',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
            fontSize: '12px',
            lineHeight: '1.4',
            borderRadius: '12px',
            boxShadow: '0 6px 24px rgba(0,0,0,.35)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'none',
        });

        this.root.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div style="font-weight:700;">XR Dev Panel</div>
          <button id="dev-close" style="all:unset;cursor:pointer;padding:4px 8px;border-radius:8px;background:#222;">
            關閉 (M)
          </button>
        </div>

        <div style="margin-bottom:10px;border-top:1px solid #333;padding-top:8px;">
          <div style="opacity:.8;margin-bottom:4px;">狀態</div>
          <div id="dev-stats" style="display:grid;grid-template-columns: 100px 1fr;gap:4px;">
            <div>FPS</div><div id="stat-fps">—</div>
            <div>JS Heap</div><div id="stat-mem">—</div>
            <div>Draw Calls</div><div id="stat-draws">—</div>
            <div>Triangles</div><div id="stat-tris">—</div>
          </div>
        </div>

        <div style="margin-bottom:10px;border-top:1px solid #333;padding-top:8px;">
          <div style="opacity:.8;margin-bottom:4px;">天空盒</div>
          <div style="display:flex;gap:6px;">
            <select id="sel-sky" style="flex:1; background:#111;color:#fff;border:1px solid #333;border-radius:6px;padding:6px;"></select>
            <button id="btn-sky-apply" style="all:unset;cursor:pointer;padding:6px 10px;border-radius:6px;background:#2a2;">套用</button>
          </div>
        </div>

        <div style="margin-bottom:10px;border-top:1px solid #333;padding-top:8px;">
          <div style="opacity:.8;margin-bottom:4px;">模型</div>
          <div style="display:flex;gap:6px;">
            <select id="sel-model" style="flex:1; background:#111;color:#fff;border:1px solid #333;border-radius:6px;padding:6px;"></select>
            <button id="btn-model-add" style="all:unset;cursor:pointer;padding:6px 10px;border-radius:6px;background:#2a2;">新增</button>
          </div>
          <div style="margin-top:6px;display:flex;gap:6px;">
            <button id="btn-model-clear" style="all:unset;cursor:pointer;padding:6px 10px;border-radius:6px;background:#a22;">清空全部</button>
            <button id="btn-model-remove-last" style="all:unset;cursor:pointer;padding:6px 10px;border-radius:6px;background:#a22;">移除最後</button>
            <button id="btn-model-add-all" style="all:unset;cursor:pointer;padding:6px 10px;border-radius:6px;background:#226;">載入全部</button>
            <button id="btn-anim-toggle" style="all:unset;cursor:pointer;padding:6px 10px;border-radius:6px;background:#226;">動畫 播/停</button>
          </div>
        </div>

        <div style="margin-bottom:10px;border-top:1px solid #333;padding-top:8px;">
          <div style="opacity:.8;margin-bottom:4px;">音樂</div>
          <div style="display:flex;gap:6px;">
            <button id="btn-audio-play"  style="all:unset;cursor:pointer;padding:6px 10px;border-radius:6px;background:#2a2;">播放/暫停</button>
            <button id="btn-audio-next"  style="all:unset;cursor:pointer;padding:6px 10px;border-radius:6px;background:#226;">下一首</button>
            <button id="btn-audio-stop"  style="all:unset;cursor:pointer;padding:6px 10px;border-radius:6px;background:#a22;">停止</button>
          </div>
        </div>

        <div style="margin-bottom:0;border-top:1px solid #333;padding-top:8px;">
          <div style="opacity:.8;margin-bottom:4px;">影片</div>
          <div style="display:flex;gap:6px;">
            <button id="btn-video-play" style="all:unset;cursor:pointer;padding:6px 10px;border-radius:6px;background:#2a2;">播放</button>
            <button id="btn-video-stop" style="all:unset;cursor:pointer;padding:6px 10px;border-radius:6px;background:#a22;">關閉</button>
          </div>
        </div>
      `;

        document.body.appendChild(this.root);

        // 控件參照
        this.$ = (id) => this.root.querySelector(id);
        this.$fps = this.$('#stat-fps');
        this.$mem = this.$('#stat-mem');
        this.$draws = this.$('#stat-draws');
        this.$tris = this.$('#stat-tris');

        // 下拉清單填充
        const skyList = this.lists.SKYBOXES || [];
        const modelList = this.lists.MODEL_URLS || [];

        const skySel = this.$('#sel-sky');
        const skyName = ['巴黎', '草地', '西洋棋', '星空', '雪地'];
        skyList.forEach((item, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            // opt.textContent = item.name || `Sky ${i + 1}`;
            opt.textContent = item.name || `${i + 1}. ${skyName[i]}`;

            skySel.appendChild(opt);
        });

        const modelSel = this.$('#sel-model');
        const modelName = ['暴龍', '馬', '貓', '盆栽', '小鴨', '柴犬'];
        modelList.forEach((url, i) => {
            const opt = document.createElement('option');
            opt.value = url;
            // opt.textContent = url.split("/").pop();
            opt.textContent = `${i + 1}. ${modelName[i]}`;
            modelSel.appendChild(opt);
        });

        // 事件
        this.$('#dev-close').addEventListener('click', () => this.hide());
        this.$('#btn-sky-apply').addEventListener('click', () => {
            const idx = Number(this.$('#sel-sky').value);
            if (this.sky?.set && skyList[idx]) this.sky.set(skyList[idx]);
        });

        this.$('#btn-model-add').addEventListener('click', () => {
            const url = this.$('#sel-model').value;
            if (url && this.models?.add) this.models.add(url);
        });

        this.$('#btn-model-remove-last').addEventListener('click', () => {
            if (this.models?.removeLast) this.models.removeLast();
        });
        this.$('#btn-model-clear').addEventListener('click', () => {
            if (this.models?.clear) this.models.clear();
        });
        this.$('#btn-model-add-all').addEventListener('click', () => {
            if (this.models?.addAllRow) this.models.addAllRow();
        });

        this.$('#btn-anim-toggle').addEventListener('click', () => {
            if (!this.anim) return;
            if (this._animPlaying) {
                this.anim.pauseAll?.();
                this._animPlaying = false;
            } else {
                this.anim.resumeAll?.();
                this._animPlaying = true;
            }
        });

        this.$('#btn-audio-play').addEventListener('click', () => this.audio?.togglePlayPause?.());
        this.$('#btn-audio-next').addEventListener('click', () => this.audio?.next?.());
        this.$('#btn-audio-stop').addEventListener('click', () => this.audio?.stop?.());

        this.$('#btn-video-play').addEventListener('click', () => this.video?.open?.());
        this.$('#btn-video-stop').addEventListener('click', () => this.video?.close?.());
    }

    _bindHotkey() {
        // 切換面板顯示
        window.addEventListener('keydown', (e) => {
            if (e.key?.toLowerCase() === 'm') {
                this.toggle();
            }
        });
    }

    toggle() {
        this._visible ? this.hide() : this.show();
    }
    show() {
        this._visible = true;
        this.root.style.display = 'block';
    }
    hide() {
        this._visible = false;
        this.root.style.display = 'none';
    }

    // 每幀呼叫（由你的 render loop / xr loop 觸發）
    update() {
        // FPS（取 10 幀平均）
        const now = performance.now();
        const dt = now - this._lastFrameTs;
        this._lastFrameTs = now;

        // 累計器避免太頻繁 DOM 更新
        if (++this._rafCounter % 10 === 0) {
            this._fps = Math.round(1000 / Math.max(dt, 0.0001));

            // JS 記憶體（可能僅 Chrome 支援）
            let memText = 'n/a';
            const pm = performance.memory;
            if (pm && pm.totalJSHeapSize) {
                const usedMB = (pm.usedJSHeapSize / (1024 * 1024)).toFixed(1);
                const totalMB = (pm.totalJSHeapSize / (1024 * 1024)).toFixed(1);
                memText = `${usedMB} / ${totalMB} MB`;
            }

            // WebGL 統計
            const info = this.renderer?.info;
            const draws = info?.render?.calls ?? 0;
            const tris = info?.render?.triangles ?? 0;

            // 寫入 UI
            this.$fps.textContent = `${this._fps}`;
            this.$mem.textContent = memText;
            this.$draws.textContent = `${draws}`;
            this.$tris.textContent = `${tris}`;
        }
    }
}
