// ==UserScript==
// @name         Panda+ — Gestor de Catálogo, Downloads & Sync Cloud
// @namespace    leinad4mind.top/forum
// @version      2.0.0
// @description  Conta e guarda filmes/séries do Panda+, sincroniza com Cloudflare Workers (multi-API), gere downloads e copiados, e apresenta uma Dashboard com filtros, posters, notas e exportação. Modifica também os links do header para incluir ?watch_more=1 e adiciona item "Destaques".
// @author       Leinad4Mind
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pandaplus.pt
// @match        https://pandaplus.pt/*
// @match        https://www.pandaplus.pt/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @require      https://raw.githubusercontent.com/Leinad4Mind/media-vault/main/src/media-vault-core.js
// ==/UserScript==

(function () {
    'use strict';

    if (typeof window.initMediaVault !== 'function') {
        console.error("Media-Vault Core não carregou corrertamente!");
        return;
    }

    const context = {
        KV_PREFIX: "panda_",
        BRAND_COLOR: "#ffa61a",
        CARD_ROOT_SELECTOR: ".thumbnail",
        BASE_URL: "https://pandaplus.pt",

        isRelevantItem: function (url) {
            if (!url) return false;
            const s = url.toLowerCase();
            return s.includes("/filmes-e-series/") || s.includes("/conteudo/") || s.includes("/vod/");
        },

        extractCardDetails: function (root) {
            const linkEl = root.nodeName === "A" ? root : root.querySelector("a");
            let href = linkEl?.href || linkEl?.getAttribute("href") || "";
            if (href.startsWith('/')) href = "https://pandaplus.pt" + href;

            let title = linkEl?.getAttribute("aria-label") || "";
            if (!title) {
                const imgEl = root.querySelector("img");
                if (imgEl && imgEl.hasAttribute("alt")) {
                    title = imgEl.getAttribute("alt");
                } else if (root.hasAttribute("aria-label")) {
                    title = root.getAttribute("aria-label");
                }
            }
            if (title) title = title.trim();

            let poster = "";
            const rawImg = root.querySelector("img.thumbnail-image, img");
            let imgWrapper = null;

            if (rawImg) {
                poster = rawImg.getAttribute("data-src") || rawImg.getAttribute("src") || "";
                imgWrapper = linkEl?.querySelector('.ft-img-wrapper');
                if (!imgWrapper) {
                    imgWrapper = document.createElement("div");
                    imgWrapper.className = "ft-img-wrapper";
                    imgWrapper.style.position = "relative";
                    imgWrapper.style.display = "block";
                    rawImg.parentNode.insertBefore(imgWrapper, rawImg);
                    imgWrapper.appendChild(rawImg);
                }
            } else {
                const style = window.getComputedStyle(root);
                if (style.backgroundImage && style.backgroundImage !== 'none') {
                    poster = style.backgroundImage.slice(4, -1).replace(/"/g, "");
                }
            }

            return {
                href,
                title,
                poster,
                insertTarget: imgWrapper || root,
                hideContainer: root.parentElement?.classList.contains("relative") ? root.parentElement : (root.parentElement || root)
            };
        },

        injectHeaderMods: function () { },
        injectDetailPageButtons: function () { }
    };

    window.initMediaVault(context);

})();
