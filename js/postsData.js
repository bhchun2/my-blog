import { splitFrontmatter } from "./frontmatter.js";
import { slugFromFilename } from "./util.js";

let cachedPosts = null;

function normalizeMeta(meta, fallbackTitle) {
  return {
    title: meta.title || fallbackTitle,
    date: meta.date || "",
    tags: Array.isArray(meta.tags) ? meta.tags : meta.tags ? [meta.tags] : [],
    excerpt: meta.excerpt || "",
  };
}

async function fetchManifest() {
  const res = await fetch("posts/posts.json");
  if (!res.ok) throw new Error(`posts.json을 불러오지 못했습니다 (${res.status})`);
  return res.json();
}

async function fetchRawPost(filename) {
  const res = await fetch(`posts/${filename}`);
  if (!res.ok) throw new Error(`${filename}을 불러오지 못했습니다 (${res.status})`);
  return res.text();
}

export async function fetchAllPosts() {
  if (cachedPosts) return cachedPosts;

  const filenames = await fetchManifest();
  const posts = await Promise.all(
    filenames.map(async (filename) => {
      const raw = await fetchRawPost(filename);
      const { meta, body } = splitFrontmatter(raw);
      const slug = slugFromFilename(filename);
      return { slug, filename, meta: normalizeMeta(meta, slug), body };
    })
  );

  posts.sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1));
  cachedPosts = posts;
  return posts;
}

export async function fetchPostBySlug(slug) {
  const res = await fetch(`posts/${slug}.md`);
  if (!res.ok) return null;
  const raw = await res.text();
  const { meta, body } = splitFrontmatter(raw);
  return { slug, filename: `${slug}.md`, meta: normalizeMeta(meta, slug), body };
}
