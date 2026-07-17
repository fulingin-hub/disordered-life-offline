(function (global) {
  const key = "disordered-life-language-v1";
  const supported = new Set(["zh-CN", "ja", "en"]);
  const attributes = ["alt", "aria-label", "placeholder", "title"];
  const originalText = new WeakMap();
  const translatedText = new WeakMap();
  const originalAttributes = new WeakMap();
  const translatedAttributes = new WeakMap();
  let locale = "zh-CN";
  let dictionary = {};
  let observer;

  try {
    const saved = localStorage.getItem(key);
    if (supported.has(saved)) locale = saved;
  } catch (_) {
    // The standalone edition normally has localStorage available.
  }
  dictionary = global.OfflineI18nData?.[locale] || {};
  document.documentElement.lang = locale;

  function translate(value) {
    if (locale === "zh-CN" || typeof value !== "string") return value;
    return value.replace(/\p{Script=Han}+/gu,
      (part) => dictionary[part] || part);
  }

  function ignored(node) {
    const element = node.nodeType === Node.ELEMENT_NODE
      ? node : node.parentElement;
    return !element || Boolean(element.closest(
      "script, style, noscript, input, textarea, [contenteditable], .chat-message.user"));
  }

  function translateText(node) {
    if (ignored(node)) return;
    const current = node.nodeValue;
    const expected = translatedText.get(node);
    let source = originalText.get(node);
    if (source === undefined || (current !== expected && current !== source)) {
      source = current;
      originalText.set(node, source);
    }
    const next = translate(source);
    translatedText.set(node, next);
    if (next !== current) node.nodeValue = next;
  }

  function translateAttribute(element, name) {
    const originals = originalAttributes.get(element) || {};
    const translations = translatedAttributes.get(element) || {};
    const current = element.getAttribute(name);
    let source = originals[name];
    if (source === undefined ||
        (current !== translations[name] && current !== source)) {
      source = current;
      originals[name] = source;
    }
    const next = translate(source);
    translations[name] = next;
    originalAttributes.set(element, originals);
    translatedAttributes.set(element, translations);
    if (next !== current) element.setAttribute(name, next);
  }

  function translateElement(element) {
    if (!(element instanceof Element) || ignored(element)) return;
    for (const name of attributes) {
      if (!element.hasAttribute(name)) continue;
      translateAttribute(element, name);
    }
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) translateText(walker.currentNode);
  }

  function observe() {
    if (locale === "zh-CN") return;
    translateElement(document.documentElement);
    observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "characterData") translateText(record.target);
        if (record.type === "attributes") translateElement(record.target);
        for (const node of record.addedNodes || []) {
          if (node.nodeType === Node.TEXT_NODE) translateText(node);
          else translateElement(node);
        }
      }
    });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: attributes,
    });
  }

  const originalConfirm = global.confirm.bind(global);
  const originalAlert = global.alert.bind(global);
  global.confirm = (message) => originalConfirm(translate(String(message)));
  global.alert = (message) => originalAlert(translate(String(message)));

  global.OfflineI18n = {
    key,
    locale: () => locale,
    translate,
    setLocale(value) {
      if (!supported.has(value)) return false;
      try {
        localStorage.setItem(key, value);
        location.reload();
        return true;
      } catch (error) {
        console.error("语言设置保存失败:", error.message, error.stack);
        return false;
      }
    },
  };

  observe();
})(window);
