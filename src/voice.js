
// 語音控制 + LLM 連線（Web Speech API）
const $ = (id) => document.getElementById(id);

export class VoiceController {
  // === LLM 設定（可依需要修改） ===

  constructor({ sky, models, anim, audioPlayer, videoPanel, lists }) {
    this.sky = sky;
    this.models = models;
    this.anim = anim;
    this.audioPlayer = audioPlayer;
    this.videoPanel = videoPanel;
    this.lists = lists;
    this.enabled = false;
    this.rec = null;
    this.asrEl = document.getElementById("asr");
    this.btn = document.getElementById("btnMic");
    this._llmBusy = false;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      this._setBadge("瀏覽器不支援語音辨識（需 Chrome/Edge 桌面版）");
      this._disableButton();
      return;
    }
    const rec = new SR();
    rec.lang = "zh-TW";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (ev) => {
      let finalText = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const res = ev.results[i];
        const text = res[0].transcript.trim();
        if (res.isFinal) {
          finalText += text;
        } else {
          this._setBadge(`聆聽中：${text}`);
        }
      }
      if (finalText) {
        console.log(`辨識： ${finalText}`);
        this._setBadge(`辨識：${finalText}`);
        // 送到 LLM 並顯示回覆
        this._sendToLLM(finalText);
        // 仍保留本地語音指令控制
        this._handleCommand(finalText);
      }
    };
    rec.onerror = (e) => {
      this._setBadge(`語音錯誤：${e.error}`);
      console.warn("[SpeechRecognition.onerror]", e);
    };
    rec.onend = () => {
      if (this.enabled) {
        try { rec.start(); } catch {}
      }
    };

    this.rec = rec;
    this.btn?.addEventListener("click", () => this.toggle());
  }

  _disableButton() {
    if (this.btn) {
      this.btn.disabled = true;
      this.btn.textContent = "🎙️ 語音：不支援";
    }
  }

  _setBadge(text) {
    if (this.asrEl) this.asrEl.textContent = text;
  }

  async _ensureMicReady() {
    if (!navigator.mediaDevices?.getUserMedia) {
      this._setBadge("此瀏覽器不支援 getUserMedia");
      throw new Error("no-getUserMedia");
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasMic = devices.some(d => d.kind === "audioinput");
      if (!hasMic) throw new Error("no-audioinput-device");
      stream.getTracks().forEach(t => t.stop());
    } catch (err) {
      const msg =
        err.name === "NotAllowedError" ? "麥克風權限被拒，請到瀏覽器設定允許" :
        err.name === "NotFoundError"   ? "找不到麥克風裝置，請插入或啟用麥克風" :
        err.name === "NotReadableError"? "裝置被其他程式占用，請關閉 Zoom/Meet/錄音軟體" :
        err.name === "SecurityError"   ? "非安全來源，請改用 https 或 localhost" :
        err.message || String(err);
      this._setBadge(`麥克風前置檢查失敗：${msg}`);
      throw err;
    }
  }

  async start() {
    if (!this.rec || this.enabled) return;
    try {
      await this._ensureMicReady();
      this.rec.start();
      this.enabled = true;
      if (this.btn) this.btn.textContent = "🎙️ 語音：開";
      this._setBadge("語音已啟用，說出指令吧！");
    } catch (err) {
      this._setBadge(`無法啟用語音：${err?.message || err}`);
    }
  }

  stop() {
    if (!this.rec || !this.enabled) return;
    this.enabled = false;
    try { this.rec.stop(); } catch {}
    if (this.btn) this.btn.textContent = "🎙️ 語音：關";
    this._setBadge("語音已關閉");
  }

  toggle() {
    this.enabled ? this.stop() : this.start();
  }

  async _sendToLLM(userText) {
    if (!userText || this._llmBusy) return;
    this._llmBusy = true;
    try {
      this._setBadge(`送到 LLM 中…：${userText}`);
      const res = await fetch(this.LLM_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.LLM_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.LLM_MODEL,
          messages: [ //我的右前方不遠處有一顆高大的椰子
            { role: "user", content: `將以下文字整理成正常邏輯的句子，不要添加額外意思的內容及其他說明:${userText}` }
          ]
        })
      });
      if (!res.ok) {
        const t = await res.text();
        console.log(`LLM 錯誤 ${res.status}: ${t?.slice(0, 120)}`);
        this._setBadge(`LLM 錯誤 ${res.status}: ${t?.slice(0, 120)}`);
        return;
      }
      const data = await res.json();
      let reply = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || JSON.stringify(data).slice(0, 2000);
      reply = (reply || "").trim();
      console.log(reply ? `LLM：${reply}` : "LLM 無回覆");
      this._setBadge(reply ? `LLM：${reply}` : "LLM 無回覆");
    } catch (err) {
      console.log(`LLM 連線失敗：${err?.message || err}`);
      this._setBadge(`LLM 連線失敗：${err?.message || err}`);
    } finally {
      this._llmBusy = false;
    }
  }

  // ====== 語音指令（本地端控制） ======
  _handleCommand(t) {
    const s = t.toLowerCase();
    const any = (...arr) => arr.some((k) => s.includes(k));

    // 天空/背景
    if (any("天空", "背景", "sky")) {
      if (any("切換", "下一個", "next", "換")) {
        this.sky?.next(this.lists?.SKYBOXES);
        return;
      }
    }

    // 模型
    if (any("模型", "model")) {
      if (any("切換", "下一個", "next", "換")) {
        this.models?.next(this.lists?.MODEL_URLS);
        return;
      }
      if (any("全部", "所有") && any("載入", "加入", "add", "load")) {
        this.models?.addAllRow(this.lists?.MODEL_URLS);
        return;
      }
    }

    // 動畫群控
    if (any("動畫", "animation")) {
      if (any("播放全部", "全部播放")) return this.anim?.playAll();
      if (any("暫停全部", "全部暫停")) return this.anim?.pauseAll();
      if (any("續播全部", "全部續播")) return this.anim?.resumeAll();
      if (any("停止全部", "全部停止")) return this.anim?.stopAll();
      if (any("三次", "3次", "三 次", "3 次")) return this.anim?.playNTimesExact(0, 3);
      if (any("回到零", "回到0", "回到 起點", "seek 0", "從頭")) return this.anim?.seekToStart(0);
      if (any("播放", "play")) return this.anim?.playAll();
      if (any("暫停", "pause")) return this.anim?.pauseAll();
      if (any("停止", "stop")) return this.anim?.stopAll();
    }

    // 音樂
    if (any("音樂", "music", "歌曲")) {
      if (any("下一首", "next")) return this.audioPlayer?.next();
      if (any("停止", "stop")) return this.audioPlayer?.stop();
      if (any("播放", "暫停", "play", "pause", "播")) return this.audioPlayer?.togglePlayPause();
    }

    // 影片
    if (any("影片", "video")) {
      if (any("開啟", "打開", "open", "播放")) return this.videoPanel?.open();
      if (any("關閉", "close", "停止")) return this.videoPanel?.close();
    }

    // 未命中
    this._setBadge(`未理解指令：${t}（試試：切換天空／切換模型／播放全部動畫／下一首／關閉影片）`);
  }
}
