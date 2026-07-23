(function (LG) {
  function refresh(nav, currentId, onSelect, node) {
    const data = LG.goldenHorizon.data();
    const schedule = LG.goldenHorizonResidents.select({
      date: data.today.date,
      hour: new Date().getHours(),
      professionId: LG.career?.data?.()?.equippedProfession || "",
      residentState: data.tavern?.residents || {},
    });
    const selected = schedule.residents.some((item) => item.id === currentId)
      ? currentId : schedule.residents[0].id;
    nav.replaceChildren(...schedule.residents.map((item) => {
      const button = node("button", "",
        LG.goldenHorizonResidents.label(item));
      button.type = "button";
      button.dataset.tavernResident = item.id;
      button.addEventListener("click", () => onSelect(item.id));
      return button;
    }));
    return { schedule, selected };
  }

  LG.goldenHorizonTavernRoster = { refresh };
})(window.LifeGame);
