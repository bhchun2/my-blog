import { fetchAllPosts } from "./postsData.js";
import { formatDate, escapeHtml, debounce } from "./util.js";
import { collectTags, filterPosts } from "./search.js";

const listEl = document.getElementById("post-list");
const searchInput = document.getElementById("search-input");
const tagFilterEl = document.getElementById("tag-filter");

let allPosts = [];
const state = { query: "", tag: null };

function plainExcerpt(body, maxLen = 120) {
  const text = body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
}

function renderTags(tags) {
  if (!tags.length) return "";
  return `<div class="post-card__tags">${tags
    .map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`)
    .join("")}</div>`;
}

function postCardHtml(post) {
  const excerpt = post.meta.excerpt || plainExcerpt(post.body);
  return `
    <li class="post-card">
      <a class="post-card__link" href="post.html?slug=${encodeURIComponent(post.slug)}">
        <h2 class="post-card__title">${escapeHtml(post.meta.title)}</h2>
        ${post.meta.date ? `<time class="post-card__date" datetime="${post.meta.date}">${formatDate(post.meta.date)}</time>` : ""}
        <p class="post-card__excerpt">${escapeHtml(excerpt)}</p>
        ${renderTags(post.meta.tags)}
      </a>
    </li>
  `;
}

export function renderPosts(posts) {
  if (!posts.length) {
    listEl.innerHTML = `<li class="post-list__empty">글이 없습니다.</li>`;
    return;
  }
  listEl.innerHTML = posts.map(postCardHtml).join("");
}

function applyFilters() {
  renderPosts(filterPosts(allPosts, state));
}

function renderTagFilter(tags) {
  if (!tags.length) {
    tagFilterEl.innerHTML = "";
    return;
  }
  tagFilterEl.innerHTML = tags
    .map(
      (tag) =>
        `<button type="button" class="tag-chip" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`
    )
    .join("");

  tagFilterEl.querySelectorAll("[data-tag]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tag = btn.dataset.tag;
      state.tag = state.tag === tag ? null : tag;
      tagFilterEl.querySelectorAll("[data-tag]").forEach((b) => {
        b.classList.toggle("is-active", b.dataset.tag === state.tag);
      });
      applyFilters();
    });
  });
}

function wireSearch() {
  if (!searchInput) return;
  searchInput.addEventListener(
    "input",
    debounce((e) => {
      state.query = e.target.value;
      applyFilters();
    }, 150)
  );
}

async function init() {
  try {
    allPosts = await fetchAllPosts();
    renderPosts(allPosts);
    renderTagFilter(collectTags(allPosts));
    wireSearch();
  } catch (err) {
    listEl.innerHTML = `<li class="post-list__empty">글을 불러오지 못했습니다: ${escapeHtml(err.message)}</li>`;
  }
}

init();
