// ============ PARTICLE SYSTEM ============
const canvas = document.getElementById("particleCanvas");
const ctx = canvas?.getContext("2d");
let particles = [];

function initParticles() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 0.5,
    speedX: (Math.random() - 0.5) * 0.3,
    speedY: (Math.random() - 0.5) * 0.3,
    opacity: Math.random() * 0.5 + 0.2,
  }));
}

function animateParticles() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
    ctx.fill();
    p.x += p.speedX;
    p.y += p.speedY;
    if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
    if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
  });
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();
window.addEventListener("resize", initParticles);

// ============ REACTION PICKER ============
document.querySelectorAll(".reaction-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const picker = btn.closest(".post").querySelector(".reaction-picker");
    picker?.classList.toggle("show");
  });
});

document.querySelectorAll(".reaction").forEach((r) => {
  r.addEventListener("click", (e) => {
    e.stopPropagation();
    const emoji = r.dataset.reaction || r.textContent;
    const post = r.closest(".post");
    const likesEl = post.querySelector(".likes b");
    const current = parseInt(likesEl.textContent.replace(/,/g, ""));
    likesEl.textContent = (current + 1).toLocaleString() + ` ${emoji}`;
    post.querySelector(".reaction-picker").classList.remove("show");

    // Float animation
    const rect = r.getBoundingClientRect();
    const floater = document.createElement("div");
    floater.textContent = emoji;
    floater.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;font-size:32px;pointer-events:none;z-index:9999;transition:all 1s;`;
    document.body.appendChild(floater);
    requestAnimationFrame(() => {
      floater.style.top = `${rect.top - 100}px`;
      floater.style.opacity = "0";
      floater.style.transform = "scale(2)";
    });
    setTimeout(() => floater.remove(), 1000);
  });
});

document.addEventListener("click", () => {
  document
    .querySelectorAll(".reaction-picker.show")
    .forEach((p) => p.classList.remove("show"));
});

// ============ FEED FILTERS ============
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// ============ CHAT FOLDERS ============
document.querySelectorAll(".folder-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".folder-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});
