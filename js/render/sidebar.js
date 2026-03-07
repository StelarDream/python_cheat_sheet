import { state } from "../state.js";
import { toggleCollapse } from "../ui/collapse.js";
import { focusContentBlock, focusContentCategory } from "../ui/focus.js";

export function renderSidebarCategory(cat, parent) {

    const li = document.createElement("li");
    li.className = "category";
    li.dataset.categoryId = cat.id;

    state.categories.push({ data: cat, el: li, kind: "sidebar" });

    const header = document.createElement("div");
    header.className = "category-header";

    const collapseBtn = document.createElement("button");
    collapseBtn.className = "collapse-btn";
    collapseBtn.type = "button";
    collapseBtn.textContent = state.collapsed.has(cat.id) ? "+" : "−";

    collapseBtn.addEventListener("click", e => {
        e.stopPropagation();
        toggleCollapse(cat.id);
    });

    header.appendChild(collapseBtn);

    const titleBtn = document.createElement("button");
    titleBtn.type = "button";
    titleBtn.className = "category-title";
    titleBtn.textContent = cat.name;
    titleBtn.addEventListener("click", () => {
        focusContentCategory(cat.id);
    });
    header.appendChild(titleBtn);

    if (cat.link) {
        const docsLink = document.createElement("a");
        docsLink.href = cat.link;
        docsLink.target = "_blank";
        docsLink.rel = "noopener noreferrer";
        docsLink.className = "category-doc-link";
        docsLink.textContent = "↗";
        docsLink.addEventListener("click", e => {
            e.stopPropagation();
            focusContentCategory(cat.id);
        });
        header.appendChild(docsLink);
    }

    li.appendChild(header);
    parent.appendChild(li);

    if (state.collapsed.has(cat.id)) return;

    const ul = document.createElement("ul");
    ul.className = "category-items";

    (cat.blocks ?? []).forEach(block => {
        const item = document.createElement("li");
        item.className = "block-item";

        const titleBtn = document.createElement("button");
        titleBtn.type = "button";
        titleBtn.className = "block-title";
        titleBtn.dataset.blockId = block.id;
        titleBtn.textContent = block.name;
        titleBtn.addEventListener("click", () => {
            focusContentBlock(block.id);
        });

        item.appendChild(titleBtn);

        if (block.link) {
            const docsLink = document.createElement("a");
            docsLink.href = block.link;
            docsLink.target = "_blank";
            docsLink.rel = "noopener noreferrer";
            docsLink.className = "category-doc-link";
            docsLink.textContent = "↗";
            docsLink.addEventListener("click", e => {
                e.stopPropagation();
                focusContentBlock(block.id);
            });
            item.appendChild(docsLink);
        }

        ul.appendChild(item);
    });

    (cat.subcategories ?? []).forEach(sub => {
        renderSidebarCategory(sub, ul);
    });

    li.appendChild(ul);

}
