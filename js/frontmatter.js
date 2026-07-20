function parseValue(raw) {
  const value = raw.trim();
  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => stripQuotes(item.trim()))
      .filter(Boolean);
  }
  return stripQuotes(value);
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

// Parses a restricted YAML subset: flat `key: value` pairs and
// inline lists like `tags: [a, b, c]`. No nested maps, no multi-line values.
export function splitFrontmatter(raw) {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  if (lines[0].trim() !== "---") {
    return { meta: {}, body: raw };
  }

  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) {
    return { meta: {}, body: raw };
  }

  const meta = {};
  for (const line of lines.slice(1, end)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1);
    if (!key) continue;
    meta[key] = parseValue(value);
  }

  const body = lines.slice(end + 1).join("\n").replace(/^\n+/, "");
  return { meta, body };
}
