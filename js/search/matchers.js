/* =========================
   Text matching helpers
========================= */

export function includesQuery(value, query) {

    if (!query) return false;

    const text = String(value ?? "").toLowerCase();

    const tokens = query.split(/\s+/).filter(Boolean);

    return tokens.every(token => text.includes(token));

}


/* =========================
   Block matching
========================= */

export function getBlockMatchInfo(block, query) {

    if (!query) {
        return { matched: false, reason: null };
    }

    if (includesQuery(block.name, query)) {
        return { matched: true, reason: "name" };
    }

    if (includesQuery(block.id, query)) {
        return { matched: true, reason: "id" };
    }

    if (includesQuery(block.desc, query)) {
        return { matched: true, reason: "description" };
    }

    if (includesQuery(block.text, query)) {
        return { matched: true, reason: "content" };
    }

    return { matched: false, reason: null };

}


/* =========================
   Category matching
========================= */

export function getCategoryMatchInfo(cat, query) {

    if (!query) {
        return { matched: false, reason: null };
    }

    if (includesQuery(cat.name, query)) {
        return { matched: true, reason: "name" };
    }

    if (includesQuery(cat.id, query)) {
        return { matched: true, reason: "id" };
    }

    if (includesQuery(cat.desc, query)) {
        return { matched: true, reason: "description" };
    }

    return { matched: false, reason: null };

}


/* =========================
   Recursive match helpers
========================= */

export function blockMatches(block, query) {

    if (!query) return true;

    const fields = [
        block.id,
        block.name,
        block.desc,
        ...(block.getters ?? []).map(normalizeGetter)
    ]
        .join(" ")
        .toLowerCase();

    return includesQuery(fields, query);

}


export function categoryMatches(cat, query) {

    if (!query) return true;

    if (includesQuery(cat.name, query))
        return true;

    const blocks = cat.blocks ?? [];
    const subs = cat.subcategories ?? [];

    if (blocks.some(b => blockMatches(b, query)))
        return true;

    if (subs.some(s => categoryMatches(s, query)))
        return true;

    return false;

}


/* =========================
   Getter normalization
========================= */

function normalizeGetter(g) {

    if (typeof g === "string") return g;

    if (typeof g === "object" && g.value) return g.value;

    return "";

}