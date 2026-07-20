import { fetchPostBySlug } from "./postsData.js";
import { parse } from "./markdown.js";
import { formatDate, escapeHtml, qs } from "./util.js";
import { highlightCodeBlocks } from "./highlight.js";

const articleEl = document.getElementById("post-article");

function renderTags(tags) {
  if (!tags.length) return "";
  return `<div class="post-article__tags">${tags
    .map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`)
    .join("")}</div>`;
}

function renderNotFound() {
  document.title = "글을 찾을 수 없습니다 - My Blog";
  articleEl.innerHTML = `<p>글을 찾을 수 없습니다. <a href="index.html">목록으로 돌아가기</a></p>`;
}

async function init() {
  const slug = qs("slug");
  if (!slug) {
    renderNotFound();
    return;
  }

  try {
    const post = await fetchPostBySlug(slug);
    if (!post) {
      renderNotFound();
      return;
    }

    document.title = `${post.meta.title} - My Blog`;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) descMeta.setAttribute("content", post.meta.excerpt || post.meta.title);

    const bodyHtml = parse(post.body);
    articleEl.innerHTML = `
      <header class="post-article__header">
        <h1 class="post-article__title">${escapeHtml(post.meta.title)}</h1>
        ${post.meta.date ? `<time class="post-article__date" datetime="${post.meta.date}">${formatDate(post.meta.date)}</time>` : ""}
        ${renderTags(post.meta.tags)}
      </header>
      <div class="prose">${bodyHtml}</div>
    `;

    highlightCodeBlocks(articleEl);
  } catch (err) {
    articleEl.innerHTML = `<p>글을 불러오지 못했습니다: ${escapeHtml(err.message)}</p>`;
  }
}

init();
