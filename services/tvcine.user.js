// ==UserScript==
// @name         TVCine — Gestor de Catálogo, Downloads & Sync Cloud
// @namespace    leinad4mind.top/forum
// @version      2.0.0
// @description  Conta e guarda filmes/séries do TVCine, sincroniza com Cloudflare Workers (multi-API), gere downloads e copiados, e apresenta uma Dashboard com filtros, posters, notas e exportação. Modifica também os links do header para incluir ?watch_more=1 e adiciona item "Destaques".
// @author       Leinad4Mind
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tvcine.pt
// @match        https://tvcine.pt/*
// @match        https://www.tvcine.pt/*
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
        console.error("Media-Vault Core não carregou corretamente!");
        return;
    }

    const context = {
        KV_PREFIX: "tvcine_",
        BRAND_COLOR: "#00a8e0",
        CARD_ROOT_SELECTOR: ".catalog-movies",
        BASE_URL: "https://tvcine.pt",

        isRelevantItem: function (url) {
            if (!url) return false;
            const s = url.toLowerCase();
            return s.includes("/filmes-e-series/") || s.includes("/conteudo/") || s.includes("/vod/");
        },

        extractCardDetails: function (root) {
            const linkEl = root.querySelector("a") || root;

            let href = linkEl.href || linkEl.getAttribute("href") || "";
            if (href.startsWith('/')) href = "https://tvcine.pt" + href;

            const titleEl = root.querySelector(".catalog-cover-p");
            let title = titleEl
                ? Array.from(titleEl.childNodes)
                    .filter(n => n.nodeType === Node.TEXT_NODE)
                    .map(n => n.textContent)
                    .join(" ")
                    .trim()
                : "";
            const spanTitle = titleEl ? titleEl.querySelector("span") : null;
            if (spanTitle) title += " " + spanTitle.textContent.trim();
            if (!title) title = root.querySelector("img") ? (root.querySelector("img").getAttribute("alt") || "") : "";
            if (title) title = title.trim();

            const imgEl = linkEl.querySelector("img.catalog-cover, img");
            let poster = imgEl ? (imgEl.getAttribute("data-src") || imgEl.getAttribute("src") || "") : "";
            // High-res: remove _s suffix
            if (poster) poster = poster.replace(/_s\.([^.]+)$/i, '.$1');

            // Wrap img for overlay injection
            let imgWrapper = linkEl.querySelector('.ft-img-wrapper');
            if (imgEl && !imgWrapper) {
                imgWrapper = document.createElement("div");
                imgWrapper.className = "ft-img-wrapper";
                imgWrapper.style.position = "relative";
                imgWrapper.style.display = "block";
                imgEl.parentNode.insertBefore(imgWrapper, imgEl);
                imgWrapper.appendChild(imgEl);
            }

            return {
                href,
                title,
                poster,
                insertTarget: imgWrapper || root,
                hideContainer: root
            };
        },

        injectHeaderMods: function () { },
        injectDetailPageButtons: function () { }
    };

    window.initMediaVault(context);

})();
