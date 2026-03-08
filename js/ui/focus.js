import { state } from "../state.js";

export function focusBestSearchMatch() {
    const candidates = [];

    for (const entry of state.categories) {
        if (entry.kind !== "content") continue;
        if (!entry.el || entry.el.style.display === "none") continue;

        candidates.push({
            type: "category",
            data: entry.data,
            el: entry.el,
            score: Number(entry.el.dataset.searchScore ?? 0)
        });
    }

    for (const entry of state.blocks) {
        if (!entry.el || entry.el.style.display === "none") continue;

        candidates.push({
            type: "block",
            data: entry.data,
            el: entry.el,
            score: Number(entry.el.dataset.searchScore ?? 0)
        });
    }

    if (!candidates.length) return;

    candidates.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;

        const pos = a.el.compareDocumentPosition(b.el);

        if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;

        return 0;
    });

    const best = candidates[0];

    best.el.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    if (best.type === "category") {
        focusSidebarCategory(best.data.id);
    } else {
        focusSidebarBlock(best.data.id);
    }
}

export function focusContentCategory(catId) {
    const section = document.querySelector(
        `.gallery[data-category-id="${CSS.escape(catId)}"]`
    );

    if (!section) return;

    section.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });

    focusSidebarCategory(catId);
}

export function focusContentBlock(blockId) {

    const block = document.getElementById(blockId);

    if (!block) return;

    block.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    focusSidebarBlock(blockId);

}

export function focusSidebarBlock(blockId) {

    const button = document.querySelector(
        `#category-list .block-title[data-block-id="${CSS.escape(blockId)}"]`
    );

    if (!button) return;

    button.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}

export function focusSidebarCategory(catId) {

    const title = document.querySelector(
        `#category-list .category[data-category-id="${CSS.escape(catId)}"] > .category-header > .category-title`
    );

    if (!title) return;

    title.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}

