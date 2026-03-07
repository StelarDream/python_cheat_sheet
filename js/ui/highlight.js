export function updateHighlight(root, query) {

    const marks = root.querySelectorAll("mark");

    marks.forEach(m => {
        m.replaceWith(m.textContent);
    });

    if (!query) return;

    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT
    );

    const regex = new RegExp(`(${escapeRegex(query)})`, "gi");

    let node;

    while (node = walker.nextNode()) {

        if (!node.nodeValue.trim()) continue;

        const parent = node.parentNode;

        if (parent.tagName === "CODE") continue;

        if (regex.test(node.nodeValue)) {

            const span = document.createElement("span");

            span.innerHTML = node.nodeValue.replace(
                regex,
                "<mark>$1</mark>"
            );

            parent.replaceChild(span, node);

        }

    }

}


export function escapeRegex(str) {

    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

}