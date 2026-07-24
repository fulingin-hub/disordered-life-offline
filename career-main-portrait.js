(function (LG) {
  LG.careerMainPortrait = {
    get(gender) {
      const goldenId = LG.goldenHorizon?.data?.()?.professions?.equipped;
      const golden = LG.GOLDEN_HORIZON_DATA?.professions?.find(
        (item) => item.id === goldenId);
      if (golden) {
        return {
          id: golden.id,
          src: LG.GOLDEN_HORIZON_DATA.professionPortrait(golden, gender),
          name: golden.name,
          category: "second",
          exclusiveVehicle: true,
        };
      }
      const data = LG.career?.data?.();
      const id = data?.equippedProfession;
      if (!id) return null;
      const job = data.professionDefinitions?.find((item) => item.id === id);
      const src = LG.careerPortraits.mainSource(id, gender);
      return src ? {
        id, src, name: job?.name || id,
        category: LG.careerPortraits.category(id),
      } : null;
    },
    apply({ wrap, image, mountImage, gender, career }) {
      image.alt = `${gender === "female" ? "女" : "男"}主角·${career.name}职业立绘`;
      image.className = "career-main-portrait";
      mountImage.removeAttribute("src");
      mountImage.hidden = true;
      wrap.dataset.category = `career-${career.category}`;
      delete wrap.dataset.vehicleFamily;
      delete wrap.dataset.vehicleTone;
      delete wrap.dataset.vehicleMode;
      delete wrap.dataset.vehicleCombination;
      wrap.classList.remove("mounted", "following");
      wrap.hidden = false;
    },
  };
})(window.LifeGame);
