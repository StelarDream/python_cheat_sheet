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

function escapeHTML(str = "") {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* =========================
   Getters
========================= */

function renderGetters(getters = []) {

    const inline = [];
    const commented = [];

    getters.forEach(g => {

        if (typeof g === "string") {
            inline.push({ value: g });
            return;
        }

        if (g.comment) {
            commented.push(g);
        } else {
            inline.push(g);
        }

    });

    const inlineHTML = inline.length
        ? `<p class="getters-inline">${
            inline
                .map(g => `
                    <code>${escapeHTML(g.value)}</code>
                    ${
                        g.link
                        ? `<a class="see-more" href="${escapeHTML(g.link)}" target="_blank">see more</a>`
                        : ""
                    }
                `)
                .join(", ")
          }</p>`
        : "";

    const commentedHTML = commented.length
        ? `<div class="getters-commented">
            ${
                commented.map(g => `
                    <div class="getter-row">
                        <code>${escapeHTML(g.value)}</code>
                        <span>${escapeHTML(g.comment)}</span>
                        ${
                            g.link
                            ? `<a class="see-more" href="${escapeHTML(g.link)}" target="_blank">see more</a>`
                            : ""
                        }
                    </div>
                `).join("")
            }
          </div>`
        : "";

    return inlineHTML + commentedHTML;
}

/* =========================
   Block
========================= */

function renderBlock(block) {

    const el = document.createElement("article");

    el.className = "block";
    el.dataset.name = block.name;

    if (block.id) {
        el.id = block.id;
    }

    const gettersHTML = renderGetters(block.getters);

    const pointsHTML = (block.point || [])
        .map(p => `<li>${escapeHTML(p)}</li>`)
        .join("");

    const examplesHTML = (block.examples || [])
        .map(e => `
            <pre class="example">
<code>${escapeHTML(e.code)}</code> → <span class="result">${escapeHTML(e.result)}</span>
${
    e.link
    ? `<a class="see-more" href="${escapeHTML(e.link)}" target="_blank">see more</a>`
    : ""
}</pre>`)
        .join("");

    const blockTitle = block.link
        ? `<a href="${escapeHTML(block.link)}" target="_blank">${escapeHTML(block.name)}</a>`
        : escapeHTML(block.name);

    el.innerHTML = `
        <h3 class="dunder-name">${blockTitle}</h3>

        <div class="meta">
            <span class="kind">${escapeHTML(block.kind)} of type</span>
            <span class="type"><code>${escapeHTML(block.value_type)}</code></span>
        </div>

        <h4>${escapeHTML(block.desc)}</h4>
        
        <ul class="points">
            ${pointsHTML}
        </ul>

        <h4>Getters</h4>
        <div class="getters">
            ${gettersHTML}
        </div>

        <h4>Examples</h4>
        ${examplesHTML}
    `;

    return el;
}

/* =========================
   Category
========================= */

function renderCategory(category) {

    const section = document.createElement("section");

    section.className = "gallery";
    section.id = category.id;

    const titleHTML = category.link
        ? `<a href="${escapeHTML(category.link)}" target="_blank">${escapeHTML(category.name)}</a>`
        : escapeHTML(category.name);

    section.innerHTML = `
        <header class="gallery-header">
            <h2>${titleHTML}</h2>
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

        li.innerHTML = `<a href="#${category.id}">${escapeHTML(category.name)}</a>`;

        categoryList.appendChild(li);
    });
}

init();