import { state } from "../state.js";
import { buildDOM } from "../render/buildDOM.js";
import { applySearch } from "../search/search.js";
import { focusContentCategory } from "./focus.js";

function rerenderAfterManualCollapse(id, shouldRefocus = false) {
    state.autoExpanded.delete(id);

    if ((state.searchQuery ?? "").trim()) {
        applySearch();
    } else {
        buildDOM();
    }

    if (shouldRefocus) {
        requestAnimationFrame(() => {
            focusContentCategory(id);
        });
    }
}

export function toggleCollapse(id) {
    const wasCollapsed = state.collapsed.has(id);

    if (wasCollapsed) {
        state.collapsed.delete(id);
    } else {
        state.collapsed.add(id);
    }

    rerenderAfterManualCollapse(id, wasCollapsed);
}

export function expandCategory(id) {
    if (!state.collapsed.has(id)) return;

    state.collapsed.delete(id);
    rerenderAfterManualCollapse(id, true);
}