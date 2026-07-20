export function collectTags(posts) {
  const set = new Set();
  posts.forEach((post) => post.meta.tags.forEach((tag) => set.add(tag)));
  return Array.from(set).sort((a, b) => a.localeCompare(b, "ko"));
}

function matchesQuery(post, query) {
  const haystack = `${post.meta.title} ${post.body}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function filterPosts(posts, { query = "", tag = null } = {}) {
  return posts.filter((post) => {
    if (tag && !post.meta.tags.includes(tag)) return false;
    if (query.trim() && !matchesQuery(post, query.trim())) return false;
    return true;
  });
}
