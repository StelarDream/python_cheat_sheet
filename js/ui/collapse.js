import { state } from "../state.js";
import { buildDOM } from "../render/buildDOM.js";
import { applySearch } from "../search/search.js";


export function toggleCollapse(id) {

    if (state.collapsed.has(id)) {
        state.collapsed.delete(id);
    } else {
        state.collapsed.add(id);
    }

    /* this is now a manual state change, not an auto-expanded one */
    state.autoExpanded.delete(id);

    if ((state.searchQuery ?? "").trim()) {
        applySearch();
    } else {
        buildDOM();
    }

}