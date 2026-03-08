import { state } from "./state.js";
import { loadData } from "./data/loader.js";
import { buildDOM } from "./render/buildDOM.js";
import { applySearch } from "./search/search.js";


async function init() {

    state.data = await loadData();

    buildDOM();

    document
        .getElementById("search")
        .addEventListener("input", e => {
            state.searchQuery = e.target.value;
            applySearch();
        });

}

window.addEventListener("DOMContentLoaded", init);