import { fetchAllPosts } from "./postsData.js";
import { formatDate, escapeHtml, debounce } from "./util.js";
import { collectTags, filterPosts } from "./search.js";

const PAGE_SIZE = 10;

const listEl = document.getElementById("post-list");
const latestListEl = document.getElementById("latest-list");
const paginationEl = document.getElementById("pagination");
const searchInput = document.getElementById("search-input");
const tagFilterEl = document.getElementById("tag-filter");

let allPosts = [];
const state = { query: "", tag: null, page: 1 };

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

function renderTags(tags, wrapperClass = "post-card__tags") {
  if (!tags.length) return "";
  return `<div class="${wrapperClass}">${tags
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

function postRowHtml(post) {
  return `
    <li class="post-board__row">
      <a class="post-board__link" href="post.html?slug=${encodeURIComponent(post.slug)}">
        <div class="post-board__main">
          <h3 class="post-board__title">${escapeHtml(post.meta.title)}</h3>
          ${renderTags(post.meta.tags, "post-board__tags")}
        </div>
        ${post.meta.date ? `<time class="post-board__date" datetime="${post.meta.date}">${formatDate(post.meta.date)}</time>` : ""}
      </a>
    </li>
  `;
}

function renderLatest(posts) {
  if (!latestListEl) return;
  if (!posts.length) {
    latestListEl.innerHTML = `<li class="post-board__empty">글이 없습니다.</li>`;
    return;
  }
  latestListEl.innerHTML = posts.slice(0, 10).map(postRowHtml).join("");
}

function buildPageWindow(totalPages, current) {
  const delta = 1;
  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= current - delta && p <= current + delta)) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }
  return pages;
}

function renderPagination(totalPages, currentPage) {
  if (totalPages <= 1) {
    paginationEl.innerHTML = "";
    return;
  }

  const pageButtons = buildPageWindow(totalPages, currentPage)
    .map((p) =>
      p === "…"
        ? `<span class="pagination__ellipsis">…</span>`
        : `<button type="button" class="pagination__page${p === currentPage ? " is-active" : ""}" data-page="${p}" aria-current="${p === currentPage ? "page" : "false"}">${p}</button>`
    )
    .join("");

  paginationEl.innerHTML = `
    <button type="button" class="pagination__nav" data-page="${currentPage - 1}" aria-label="이전 페이지"${currentPage === 1 ? " disabled" : ""}>‹</button>
    ${pageButtons}
    <button type="button" class="pagination__nav pagination__nav--next" data-page="${currentPage + 1}" aria-label="다음 페이지"${currentPage === totalPages ? " disabled" : ""}>다음 ›</button>
  `;
}

function render() {
  const filtered = filterPosts(allPosts, state);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (state.page > totalPages) state.page = totalPages;

  const start = (state.page - 1) * PAGE_SIZE;
  renderPosts(filtered.slice(start, start + PAGE_SIZE));
  renderPagination(totalPages, state.page);
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
      state.page = 1;
      tagFilterEl.querySelectorAll("[data-tag]").forEach((b) => {
        b.classList.toggle("is-active", b.dataset.tag === state.tag);
      });
      render();
    });
  });
}

function wireSearch() {
  if (!searchInput) return;
  searchInput.addEventListener(
    "input",
    debounce((e) => {
      state.query = e.target.value;
      state.page = 1;
      render();
    }, 150)
  );
}

function wirePagination() {
  paginationEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-page]");
    if (!btn || btn.disabled) return;
    const page = Number(btn.dataset.page);
    if (!page || page < 1) return;
    state.page = page;
    render();
    listEl.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

async function init() {
  try {
    allPosts = await fetchAllPosts();
    renderLatest(allPosts);
    renderTagFilter(collectTags(allPosts));
    wireSearch();
    wirePagination();
    render();
  } catch (err) {
    listEl.innerHTML = `<li class="post-list__empty">글을 불러오지 못했습니다: ${escapeHtml(err.message)}</li>`;
  }
}

init();
