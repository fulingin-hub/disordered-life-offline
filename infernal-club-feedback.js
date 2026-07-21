(function (LG) {
  let before = 0;
  let impactBefore = 0;
  let pendingSpecial = false;
  let pendingImpact = false;
  let pendingQueen = "";
  let pendingKind = "";
  LG.infernalClubFeedback = {
    track(item, queen) {
      pendingSpecial = item?.type === "special";
      pendingImpact = item?.type === "consumable"
        && ["water", "gold"].includes(item.specialKind);
      pendingKind = pendingImpact ? item.specialKind : "";
      if (pendingImpact) LG.buttImpactVoice?.prime?.();
      pendingQueen = queen?.id || (pendingSpecial
        ? LG.INFERNAL_CLUB_DATA.queens.find((queen) =>
          queen.specials.some((special) => special.id === item.id))?.id || "" : "");
      before = LG.infernalClub.specialUses(pendingQueen);
      impactBefore = LG.infernalClub.buttImpactUses(pendingQueen);
    },
    show(text, tone) {
      LG.itemFeedback?.show?.(text, tone);
      const after = LG.infernalClub.specialUses(pendingQueen);
      if (pendingSpecial && after > before && after % 7 === 0) {
        LG.infernalStompPopup?.show?.(pendingQueen);
      }
      const impactAfter = LG.infernalClub.buttImpactUses(pendingQueen);
      if (pendingImpact && impactAfter > impactBefore && impactAfter % 10 === 0) {
        LG.buttImpactPopup?.showQueen?.(pendingQueen, impactAfter, pendingKind);
      }
      pendingSpecial = false;
      pendingImpact = false;
      pendingQueen = "";
      pendingKind = "";
    },
  };
})(window.LifeGame);
