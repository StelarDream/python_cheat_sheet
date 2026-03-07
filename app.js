/* =========================
   Data Loading
========================= */

async function loadData() {
    const res = await fetch("data.json");
    return res.json();
}

/* =========================
   Rendering helpers
========================= */

function escapeHTML(str) {
    return str
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderBlock(block) {

    const el = document.createElement("article");
    el.className = "block";
    el.dataset.name = block.name;

    const gettersHTML = (block.getters || [])
        .map(g => {
            if (typeof g === "string") {
                return `<code>${escapeHTML(g)}</code>`;
            }
            return `<code>${escapeHTML(g.value)}</code>`;
        })
        .join("");

    const pointsHTML = (block.point || [])
        .map(p => `<li>${escapeHTML(p)}</li>`)
        .join("");

    const examplesHTML = (block.examples || [])
        .map(e => `
            <pre class="example"><code>${escapeHTML(e.code)}</code> → <span class="result">${escapeHTML(e.result)}</span></pre>
        `)
        .join("");

    el.innerHTML = `
        <h3 class="dunder-name">${escapeHTML(block.name)}</h3>

        <div class="meta">
            <span class="kind">${escapeHTML(block.kind)} of type</span>
            <span class="type"><code>${escapeHTML(block.value_type)}</code></span>
        </div>

        <p>${escapeHTML(block.desc)}</p>

        <ul class="points">
            ${pointsHTML}
        </ul>

        <div class="getters">
            ${gettersHTML}
        </div>

        ${examplesHTML}
    `;

    return el;
}

function renderCategory(category) {

    const section = document.createElement("section");

    section.className = "gallery";
    section.id = category.id;

    section.innerHTML = `
        <header class="gallery-header">
            <h2>${escapeHTML(category.name)}</h2>
            <p>${escapeHTML(category.desc)}</p>
        </header>

        <div class="gallery-grid"></div>
    `;

    const grid = section.querySelector(".gallery-grid");

    category.blocks.forEach(block => {
        grid.appendChild(renderBlock(block));
    });

    return section;
}

/* =========================
   App Init
========================= */

async function init() {

    const data = await loadData();

    document.getElementById("title").textContent = data.title;

    const content = document.querySelector(".content");
    const categoryList = document.getElementById("category-list");

    data.categories.forEach(category => {

        const section = renderCategory(category);
        content.appendChild(section);

        const li = document.createElement("li");
        li.innerHTML = `<a href="#${category.id}">${category.name}</a>`;

        categoryList.appendChild(li);
    });
}

init();