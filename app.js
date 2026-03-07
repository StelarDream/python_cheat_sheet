async function loadData() {
    const res = await fetch("data.json");
    return await res.json();
}

function renderCategory(category) {

    const section = document.createElement("section");
    section.className = "gallery";
    section.id = category.id;

    section.innerHTML = `
        <header class="gallery-header">
            <h2>${category.name}</h2>
            <p>${category.desc}</p>
        </header>
        <div class="gallery-grid"></div>
    `;

    const grid = section.querySelector(".gallery-grid");

    category.blocks.forEach(block => {
        grid.appendChild(renderBlock(block));
    });

    return section;
}

function renderBlock(block) {

    const el = document.createElement("article");
    el.className = "block";
    el.dataset.name = block.name;

    const getters = (block.getters || [])
        .map(g => {
            if (typeof g === "string") return `<code>${g}</code>`;
            return `<code>${g.value}</code>`;
        })
        .join("");

    const points = (block.point || [])
        .map(p => `<li>${p}</li>`)
        .join("");

    const examples = (block.examples || [])
        .map(e => `
            <div class="examples">
                <pre><code>${e.code}</code></pre>
                <div class="result">${e.result}</div>
            </div>
        `).join("");

    el.innerHTML = `
        <h3 class="dunder-name">${block.name}</h3>

        <div class="meta">
            <span class="kind">${block.kind} of type</span>
            <span class="type"><code>${block.value_type}</code></span>
        </div>

        <p>${block.desc}</p>

        <ul class="points">${points}</ul>

        <div class="getters">
            ${getters}
        </div>

        ${examples}
    `;

    return el;
}

async function init() {

    const data = await loadData();

    document.getElementById("title").textContent = data.title;

    const content = document.querySelector(".content");
    const list = document.getElementById("category-list");

    data.categories.forEach(cat => {

        const section = renderCategory(cat);
        content.appendChild(section);

        const li = document.createElement("li");
        li.innerHTML = `<a href="#${cat.id}">${cat.name}</a>`;
        list.appendChild(li);
    });
}

init();