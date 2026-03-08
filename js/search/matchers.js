function normalizeText(value) {
    return String(value ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[_-]+/g, " ")
        .replace(/[^\p{L}\p{N}\s.]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function splitWords(value) {
    return normalizeText(value)
        .split(/\s+/)
        .filter(Boolean);
}

function splitQuery(query) {
    return normalizeText(query)
        .split(/\s+/)
        .filter(Boolean);
}

function isSubsequence(query, word) {
    let i = 0;
    let j = 0;

    while (i < query.length && j < word.length) {
        if (query[i] === word[j]) i++;
        j++;
    }

    return i === query.length;
}

function levenshtein(a, b) {
    const rows = b.length + 1;
    const cols = a.length + 1;
    const dp = Array.from({ length: rows }, () => Array(cols).fill(0));

    for (let i = 0; i < rows; i++) dp[i][0] = i;
    for (let j = 0; j < cols; j++) dp[0][j] = j;

    for (let i = 1; i < rows; i++) {
        for (let j = 1; j < cols; j++) {
            const cost = a[j - 1] === b[i - 1] ? 0 : 1;

            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            );

            if (
                i > 1 &&
                j > 1 &&
                a[j - 1] === b[i - 2] &&
                a[j - 2] === b[i - 1]
            ) {
                dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
            }
        }
    }

    return dp[b.length][a.length];
}

function allowedDistance(tokenLength) {
    if (tokenLength <= 2) return 0;
    if (tokenLength <= 4) return 1;
    if (tokenLength <= 7) return 2;
    return 3;
}

function scoreTokenAgainstWord(token, word) {
    if (!token || !word) return 0;

    if (word === token) return 120;
    if (word.startsWith(token)) return 95;
    if (word.includes(token)) return 80;

    if (token.length >= 3 && isSubsequence(token, word)) {
        return 55;
    }

    const dist = levenshtein(token, word);
    const maxDist = allowedDistance(token.length);

    if (dist <= maxDist) {
        return 50 - dist * 10;
    }

    return 0;
}

function scoreTokenAgainstText(token, text) {
    if (!token || !text) return 0;

    const normalized = normalizeText(text);
    const words = splitWords(text);

    if (normalized === token) return 110;
    if (normalized.includes(token)) return 70;

    let best = 0;

    for (const word of words) {
        const score = scoreTokenAgainstWord(token, word);
        if (score > best) best = score;
    }

    return best;
}

function scoreField(value, queryTokens, weight = 1) {
    if (!queryTokens.length) return 0;

    const scores = queryTokens.map(token => scoreTokenAgainstText(token, value));
    const matchedTokens = scores.filter(score => score > 0).length;

    if (!matchedTokens) return 0;

    const total = scores.reduce((a, b) => a + b, 0);
    const coverageBonus = matchedTokens === queryTokens.length ? 40 : 0;

    return (total + coverageBonus) * weight;
}

function buildBlockFields(block) {
    return {
        name: block.name ?? "",
        id: block.id ?? "",
        desc: block.desc ?? "",
        text: [
            block.id,
            block.name,
            block.desc,
            ...(block.getters ?? []).map(normalizeGetter)
        ].join(" ")
    };
}

function buildCategoryFields(cat) {
    return {
        name: cat.name ?? "",
        id: cat.id ?? "",
        desc: cat.desc ?? ""
    };
}

/* =========================
   Public scoring API
========================= */

export function getBlockMatchInfo(block, query) {
    const tokens = splitQuery(query);

    if (!tokens.length) {
        return { matched: false, reason: null, score: 0 };
    }

    const fields = buildBlockFields(block);

    const nameScore = scoreField(fields.name, tokens, 3.2);
    const idScore = scoreField(fields.id, tokens, 2.6);
    const descScore = scoreField(fields.desc, tokens, 1.4);
    const textScore = scoreField(fields.text, tokens, 1);

    const score = nameScore + idScore + descScore + textScore;

    if (!score) {
        return { matched: false, reason: null, score: 0 };
    }

    let reason = "content";
    let best = textScore;

    if (nameScore > best) {
        best = nameScore;
        reason = "name";
    }

    if (idScore > best) {
        best = idScore;
        reason = "id";
    }

    if (descScore > best) {
        best = descScore;
        reason = "description";
    }

    return { matched: true, reason, score };
}

export function getCategoryMatchInfo(cat, query) {
    const tokens = splitQuery(query);

    if (!tokens.length) {
        return { matched: false, reason: null, score: 0 };
    }

    const fields = buildCategoryFields(cat);

    const nameScore = scoreField(fields.name, tokens, 3);
    const idScore = scoreField(fields.id, tokens, 2.4);
    const descScore = scoreField(fields.desc, tokens, 1.3);

    const score = nameScore + idScore + descScore;

    if (!score) {
        return { matched: false, reason: null, score: 0 };
    }

    let reason = "description";
    let best = descScore;

    if (nameScore > best) {
        best = nameScore;
        reason = "name";
    }

    if (idScore > best) {
        best = idScore;
        reason = "id";
    }

    return { matched: true, reason, score };
}

/* =========================
   Recursive match helpers
========================= */

export function blockMatches(block, query) {
    return getBlockMatchInfo(block, query).matched;
}

export function categoryMatches(cat, query) {
    if (getCategoryMatchInfo(cat, query).matched) {
        return true;
    }

    if ((cat.blocks ?? []).some(block => blockMatches(block, query))) {
        return true;
    }

    if ((cat.subcategories ?? []).some(sub => categoryMatches(sub, query))) {
        return true;
    }

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