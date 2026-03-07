export function normalizeGetter(g) {

    if (typeof g === "string") return g;

    if (typeof g === "object" && g.value) {
        return g.value;
    }

    return "";

}