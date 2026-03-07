import { normalizeGetter } from "../utils/getters.js";

export function renderBlock(block) {

    const el = document.createElement("div");
    el.className = "block";
    el.id = block.id;

    /* ---------- points ---------- */

    const points = (block.point ?? [])
        .map(p => `<li>${p}</li>`)
        .join("");

    /* ---------- getters ---------- */

    const getters = block.getters ?? [];

    const simpleGetters = [];
    const commentedGetters = [];

    getters.forEach(g => {

        if (typeof g === "string") {
            simpleGetters.push(g);
            return;
        }

        if (typeof g === "object") {

            if (g.comment) {
                commentedGetters.push(g);
            } else {
                simpleGetters.push(g.value);
            }

        }

    });

    const simpleGetterHTML = simpleGetters.length
        ? `<div><strong>Getters:</strong> ${simpleGetters.map(v => `<code>${v}</code>`).join(", ")}</div>`
        : "";

    const commentedGetterHTML = commentedGetters.length
        ? `
        <div class="getter-list">
            ${commentedGetters.map(g => `
                <div>
                    <code>${g.value}</code>
                    <span class="meta">${g.comment}</span>
                    ${g.link ? `<a class="see-more" href="${g.link}" target="_blank">see more</a>` : ""}
                </div>
            `).join("")}
        </div>
        `
        : "";

    /* ---------- examples ---------- */

    const examples = block.examples ?? [];

    const examplesHTML = examples.length
        ? `
        <div class="examples">
            <h4>Examples</h4>
            ${examples.map(e => `
                <div class="example">
                    <code>${e.code}</code>
                    <div class="result">${e.result}</div>
                    ${e.comment ? `<div class="meta">${e.comment}</div>` : ""}
                    ${e.link ? `<a class="see-more" href="${e.link}" target="_blank">see more</a>` : ""}
                </div>
            `).join("")}
        </div>
        `
        : "";

    /* ---------- title ---------- */

    const title = block.link
        ? `<a href="${block.link}" target="_blank"><h3 class="dunder-name">${block.name}</h3></a>`
        : `<h3 class="dunder-name">${block.name}</h3>`;

    /* ---------- final HTML ---------- */

    el.innerHTML = `

        ${title}

        <div class="meta">
            ${block.kind ?? ""}
            ${block.value_type ? `<span class="type"><code>${block.value_type}</code></span>` : ""}
        </div>

        <p class="block-desc">${block.desc ?? ""}</p>

        ${points ? `<ul class="points">${points}</ul>` : ""}

        ${simpleGetterHTML}

        ${commentedGetterHTML}

        ${examplesHTML}

    `;

    return el;

}