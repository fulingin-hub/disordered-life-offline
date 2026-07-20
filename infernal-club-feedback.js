(function (LG) {
  let before = 0;
  let pendingSpecial = false;
  let pendingQueen = "";
  LG.infernalClubFeedback = {
    track(item) {
      pendingSpecial = item?.type === "special";
      pendingQueen = pendingSpecial
        ? LG.INFERNAL_CLUB_DATA.queens.find((queen) =>
          queen.specials.some((special) => special.id === item.id))?.id || "" : "";
      before = LG.infernalClub.specialUses(pendingQueen);
    },
    show(text, tone) {
      LG.itemFeedback?.show?.(text, tone);
      const after = LG.infernalClub.specialUses(pendingQueen);
      if (pendingSpecial && after > before && after % 7 === 0) {
        LG.infernalStompPopup?.show?.(pendingQueen);
      }
      pendingSpecial = false;
      pendingQueen = "";
    },
  };
})(window.LifeGame);
