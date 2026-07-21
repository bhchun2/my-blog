const STAR_COUNT = 90;

function createStarfield() {
  const field = document.createElement("div");
  field.className = "starfield";
  field.setAttribute("aria-hidden", "true");

  for (let i = 0; i < STAR_COUNT; i++) {
    const star = document.createElement("span");
    star.className = "star";
    const size = (Math.random() * 2 + 1).toFixed(2);
    star.style.left = `${(Math.random() * 100).toFixed(2)}%`;
    star.style.top = `${(Math.random() * 100).toFixed(2)}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.animationDuration = `${(Math.random() * 3 + 2).toFixed(2)}s`;
    star.style.animationDelay = `${(Math.random() * 5).toFixed(2)}s`;
    field.appendChild(star);
  }

  document.body.prepend(field);
}

createStarfield();
