(function (LG) {
  const fallback = {
    joined: false, selectedThisRun: false, faith: null,
    activeBooks: [], ownedBooks: [], books: [], baptized: false,
    roomCastCount: 0,
    resistedMagic: 0, achievements: [],
    daily: { tasks: [] }, weekly: {}, saintTrial: null,
    promotion: { label: "完成入教洗礼", canPromote: false, requirement: "" },
    soul: { tier: "black", name: "黑色", total: 0, colors: ["black"], effects: [] },
  };
  LG.infernalChurch = {
    data() {
      return LG.authority.snapshot()?.economy?.infernalChurch || fallback;
    },
    faith(id) {
      return LG.INFERNAL_CHURCH_DATA.faiths.find((item) => item.id === id) || null;
    },
    book(id) {
      return LG.INFERNAL_CHURCH_DATA.books.find((item) => item.id === id) || null;
    },
    activeBooks() {
      return this.data().activeBooks.map((id) => this.book(id)).filter(Boolean);
    },
    price(amount) {
      const data = this.data();
      const discounted = data.activeBooks.includes("lust")
        || data.soul?.colors?.includes("yellow");
      return discounted ? Math.ceil(Number(amount) * 0.5) : Number(amount);
    },
  };
})(window.LifeGame);
