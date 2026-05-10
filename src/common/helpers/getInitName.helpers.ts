export const getInitialsName = (name?: string | null) => {
    if (!name) return "A";

    const words = name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 0) return "A";

    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }

    const first = words[0].charAt(0);
    const last = words[words.length - 1].charAt(0);

    return `${first}${last}`.toUpperCase();
}