import { state } from "../state.js";

import { renderSidebarCategory } from "./sidebar.js";
import { renderContentCategory } from "./content.js";


/* =========================
   Build full DOM
========================= */

let initialized = false;

export function buildDOM() {

    const CONTENT = document.querySelector(".content");
    const SIDEBAR = document.getElementById("category-list");

    if (!initialized) {
        initializeCollapsed(state.data?.categories ?? []);
        initialized = true;
    }

    CONTENT.innerHTML = "";
    SIDEBAR.innerHTML = "";

    state.blocks = [];
    state.categories = [];

    const cats = state.data?.categories ?? [];

    for (const cat of cats) {

        renderSidebarCategory(cat, SIDEBAR);
        renderContentCategory(cat, CONTENT);

    }

}

function initializeCollapsed(categories, depth = 0) {

    for (const cat of categories) {

        if (depth >= 2) {
            state.collapsed.add(cat.id);
        }

        if (cat.subcategories) {
            initializeCollapsed(cat.subcategories, depth + 1);
        }

    }

}