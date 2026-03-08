import { state } from "../state.js";
import { buildDOM } from "../render/buildDOM.js";
import {
    getBlockMatchInfo,
    getCategoryMatchInfo
} from "./matchers.js";
import { updateHighlight } from "../ui/highlight.js";
import { focusBestSearchMatch } from "../ui/focus.js";

/* =========================
   Public API
========================= */

export function applySearch() {
    const query = (state.searchQuery ?? "").trim();

    restoreAutoExpanded();

    if (!query) {
        buildDOM();
        return;
    }

    const blockMatches = new Map();
    const categoryMatches = new Map();

    for (const cat of (state.data?.categories ?? [])) {
        scanCategory(cat, query, blockMatches, categoryMatches);
    }

    for (const [catId, info] of categoryMatches) {
        if (!info?.matched) continue;

        if (state.collapsed.has(catId)) {
            state.collapsed.delete(catId);
            state.autoExpanded.add(catId);
        }
    }

    buildDOM();

    for (const entry of state.categories) {
        const info = categoryMatches.get(entry.data.id) ?? { matched: false, score: 0 };

        entry.el.style.display = info.matched ? "" : "none";
        entry.el.dataset.searchScore = String(info.score ?? 0);
    }

    for (const entry of state.blocks) {
        const info = blockMatches.get(entry.data.id) ?? { matched: false, score: 0 };

        entry.el.style.display = info.matched ? "" : "none";
        entry.el.dataset.searchScore = String(info.score ?? 0);

        if (info.matched) {
            updateHighlight(entry.el, query);
        }
    }

    focusBestSearchMatch();
}

/* =========================
   Helpers
========================= */

export function restoreAutoExpanded() {
    for (const id of state.autoExpanded) {
        state.collapsed.add(id);
    }

    state.autoExpanded.clear();
}

function scanCategory(cat, query, blockMatches, categoryMatches) {
    let categoryMatched = false;
    let bestScore = 0;

    for (const block of (cat.blocks ?? [])) {
        const info = getBlockMatchInfo(block, query);

        blockMatches.set(block.id, info);

        if (info.matched) {
            categoryMatched = true;
            bestScore = Math.max(bestScore, info.score);
        }
    }

    for (const sub of (cat.subcategories ?? [])) {
        const subInfo = scanCategory(sub, query, blockMatches, categoryMatches);

        if (subInfo.matched) {
            categoryMatched = true;
            bestScore = Math.max(bestScore, subInfo.score);
        }
    }

    const selfInfo = getCategoryMatchInfo(cat, query);

    if (selfInfo.matched) {
        categoryMatched = true;
        bestScore = Math.max(bestScore, selfInfo.score);
    }

    const finalInfo = {
        matched: categoryMatched,
        score: bestScore,
        reason: selfInfo.reason ?? null
    };

    categoryMatches.set(cat.id, finalInfo);

    return finalInfo;
}