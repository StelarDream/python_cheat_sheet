import { state } from "../state.js";
import { renderBlock } from "./block.js";
import { normalizeGetter } from "../utils/getters.js";
import { toggleCollapse, expandCategory } from "../ui/collapse.js";
import { focusContentCategory } from "../ui/focus.js";

export function renderContentCategory(cat, parent, depth = 0) {

    const gallery = document.createElement("section");
    gallery.className = "gallery";
    gallery.dataset.categoryId = cat.id;

    if (depth > 0) {
        gallery.classList.add("subcategory-section");
    }

    state.categories.push({ data: cat, el: gallery, kind: "content" });

    const header = document.createElement("div");
    header.className = "gallery-header";

    const titleRow = document.createElement("div");
    titleRow.className = "gallery-title-row";

    const collapseBtn = document.createElement("button");
    collapseBtn.className = "collapse-btn content-collapse-btn";
    collapseBtn.type = "button";
    collapseBtn.textContent = state.collapsed.has(cat.id) ? "+" : "−";
    collapseBtn.addEventListener("click", e => {
        e.stopPropagation();
        toggleCollapse(cat.id);
    });
    titleRow.appendChild(collapseBtn);

    const title = document.createElement("button");
    title.type = "button";
    title.className = "gallery-title";
    title.textContent = cat.name;
    title.addEventListener("click", () => {
        if (state.collapsed.has(cat.id)) {
            expandCategory(cat.id);
            return;
        }

        focusContentCategory(cat.id);
    });
    titleRow.appendChild(title);

    if (cat.link) {
        const docsLink = document.createElement("a");
        docsLink.href = cat.link;
        docsLink.target = "_blank";
        docsLink.rel = "noopener noreferrer";
        docsLink.className = "gallery-doc-link";
        docsLink.textContent = "docs ↗";
        docsLink.addEventListener("click", e => {
            e.stopPropagation();
            if (state.collapsed.has(cat.id)) {
                expandCategory(cat.id);
            } else {
                focusContentCategory(cat.id);
            }
        });
        titleRow.appendChild(docsLink);
    }

    header.appendChild(titleRow);

    if (cat.desc) {
        const desc = document.createElement("p");
        desc.textContent = cat.desc;
        header.appendChild(desc);
    }

    gallery.appendChild(header);
    parent.appendChild(gallery);

    if (state.collapsed.has(cat.id)) {
        gallery.classList.add("collapsed");
        return;
    }

    const blocks = cat.blocks ?? [];
    if (blocks.length) {
        const grid = document.createElement("div");
        grid.className = "gallery-grid";

        blocks.forEach(block => {
            block.categoryId = cat.id;

            const el = renderBlock(block);

            state.blocks.push({
                data: block,
                el,
                text: [
                    block.id,
                    block.name,
                    block.desc,
                    ...(block.getters ?? []).map(normalizeGetter)
                ]
                    .join(" ")
                    .toLowerCase()
            });

            grid.appendChild(el);
        });

        gallery.appendChild(grid);
    }

    const subcategories = cat.subcategories ?? [];
    if (subcategories.length) {
        const subWrap = document.createElement("div");
        subWrap.className = "subcategory-list";

        subcategories.forEach(sub => {
            renderContentCategory(sub, subWrap, depth + 1);
        });

        gallery.appendChild(subWrap);
    }

}
