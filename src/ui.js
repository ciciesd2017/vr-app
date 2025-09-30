const $ = (id) => document.getElementById(id);
export function bindUI({ sky, models, anim, audioPlayer, videoPanel, lists }) {
  $("btnBg_paris")?.addEventListener("click", () => sky.set(lists.SKYBOXES[0]));
  $("btnBg_alps")?.addEventListener("click", () => sky.set(lists.SKYBOXES[1]));
  $("btnBg_chess")?.addEventListener("click", () => sky.set(lists.SKYBOXES[2]));
  $("btnBg_starlight")?.addEventListener("click", () => sky.set(lists.SKYBOXES[3]));
  $("btnBg_sunrise")?.addEventListener("click", () => sky.set(lists.SKYBOXES[4]));

  $("btnModel_TRex")?.addEventListener("click", () => models.add(lists.MODEL_URLS[0]));
  $("btnModel_chair")?.addEventListener("click", () => models.add(lists.MODEL_URLS[1]));
  $("btnModel_horse")?.addEventListener("click", () => models.add(lists.MODEL_URLS[2]));
  $("btnModel_cat")?.addEventListener("click", () => models.add(lists.MODEL_URLS[3]));
  $("btnModel_plant")?.addEventListener("click", () => models.add(lists.MODEL_URLS[4]));
  $("btnModel_duck")?.addEventListener("click", () => models.add(lists.MODEL_URLS[5]));
  $("btnModel_dog")?.addEventListener("click", () => models.add(lists.MODEL_URLS[6]));
  $("btnModel_clear")?.addEventListener("click", () => models.clear());
  $("btnModel_removeLast")?.addEventListener("click", () => models.removeLast());
  
  $("btnBg")?.addEventListener("click", () => sky.next(lists.SKYBOXES));
  $("btnModel")?.addEventListener("click", () => models.next(lists.MODEL_URLS));
  
  $("btnPlayAll")?.addEventListener("click", () => anim.playAll());
  $("btnPauseAll")?.addEventListener("click", () => anim.pauseAll());
  $("btnResumeAll")?.addEventListener("click", () => anim.resumeAll());
  $("btnStopAll")?.addEventListener("click", () => anim.stopAll());
  $("btnPlay3x")?.addEventListener("click", () => anim.playNTimesExact(0, 3));
  $("btnSeek0")?.addEventListener("click", () => anim.seekToStart(0));
  $("btnAddAll")?.addEventListener("click", () =>
    models.addAllRow(lists.MODEL_URLS)
  );

  $("btnPlayOrPause")?.addEventListener("click", () =>
    audioPlayer.togglePlayPause()
  );
  $("btnStopMusic")?.addEventListener("click", () => audioPlayer.stop());
  $("btnSwitchToMusic")?.addEventListener("click", () => audioPlayer.next());
  $("btnPlayVideo")?.addEventListener("click", () => videoPanel.open());
  $("btnCloseVideo")?.addEventListener("click", () => videoPanel.close());
}
