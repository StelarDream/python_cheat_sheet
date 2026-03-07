import { state } from "../state.js";

import { buildDOM } from "../render/buildDOM.js";

import {
    getBlockMatchInfo,
    getCategoryMatchInfo
} from "./matchers.js";

import { updateHighlight } from "../ui/highlight.js";

import { focusFirstSearchMatch } from "../ui/focus.js";


/* =========================
   Public API
========================= */

export function applySearch() {

    const query = (state.searchQuery ?? "").trim().toLowerCase();

    restoreAutoExpanded();

    if (!query) {
        buildDOM();
        return;
    }

    const blockMatches = new Map();
    const categoryMatches = new Map();

    /* scan raw data instead of DOM */

    for (const cat of (state.data?.categories ?? [])) {
        scanCategory(cat, query, blockMatches, categoryMatches);
    }

    /* open categories that contain matches */

    for (const [catId, matched] of categoryMatches) {

        if (!matched) continue;

        if (state.collapsed.has(catId)) {

            state.collapsed.delete(catId);
            state.autoExpanded.add(catId);

        }

    }

    /* rebuild DOM once */

    buildDOM();

    /* apply visibility */

    for (const entry of state.categories) {

        const visible = categoryMatches.get(entry.data.id);

        entry.el.style.display = visible ? "" : "none";

    }

    for (const entry of state.blocks) {

        const visible = blockMatches.get(entry.data.id);

        entry.el.style.display = visible ? "" : "none";

        if (visible) {
            updateHighlight(entry.el, query);
        }

    }

    focusFirstSearchMatch(query);

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

    /* check blocks */

    for (const block of (cat.blocks ?? [])) {

        const match = getBlockMatchInfo(block, query);

        if (match.matched) {
            blockMatches.set(block.id, true);
            categoryMatched = true;
        } else {
            blockMatches.set(block.id, false);
        }

    }

    /* check subcategories */

    for (const sub of (cat.subcategories ?? [])) {

        const subMatch = scanCategory(sub, query, blockMatches, categoryMatches);

        if (subMatch) {
            categoryMatched = true;
        }

    }

    /* check category itself */

    if (getCategoryMatchInfo(cat, query).matched) {
        categoryMatched = true;
    }

    categoryMatches.set(cat.id, categoryMatched);

    return categoryMatched;

}