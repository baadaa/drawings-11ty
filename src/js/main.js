(function () {
  "use strict";

  const dataEl = document.getElementById("artwork-data");
  if (!dataEl) return; // page has no gallery (shouldn't happen, but be safe)
  const artworks = JSON.parse(dataEl.textContent);

  const grid = document.querySelector(".grid");
  const thumbs = Array.from(grid.querySelectorAll(".thumb"));

  // ---------- roving tabindex + spatial arrow nav ----------

  function setFocused(el) {
    thumbs.forEach((t) => t.setAttribute("tabindex", "-1"));
    el.setAttribute("tabindex", "0");
    el.focus();
  }

  // find the nearest thumb in a given direction using real screen geometry,
  // so this works correctly regardless of which CSS layout renders the grid
  // (column-masonry today, grid-lanes once it's supported — see stylesheet).
  function nearestInDirection(current, dir) {
    const from = current.getBoundingClientRect();
    const fromCenter = { x: from.left + from.width / 2, y: from.top + from.height / 2 };

    let best = null;
    let bestScore = Infinity;

    for (const t of thumbs) {
      if (t === current || t.hidden) continue;
      const r = t.getBoundingClientRect();
      const center = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      const dx = center.x - fromCenter.x;
      const dy = center.y - fromCenter.y;

      // only consider candidates roughly in the pressed direction
      const inDirection =
        (dir === "right" && dx > 4) ||
        (dir === "left" && dx < -4) ||
        (dir === "down" && dy > 4) ||
        (dir === "up" && dy < -4);
      if (!inDirection) continue;

      // weight perpendicular distance more heavily so "down" doesn't
      // jump sideways to a far column just because it's slightly closer
      const primary = dir === "left" || dir === "right" ? Math.abs(dx) : Math.abs(dy);
      const secondary = dir === "left" || dir === "right" ? Math.abs(dy) : Math.abs(dx);
      const score = primary + secondary * 2;

      if (score < bestScore) {
        bestScore = score;
        best = t;
      }
    }
    return best; // null at a grid edge — caller clamps (no-op)
  }

  grid.addEventListener("keydown", (e) => {
    const current = document.activeElement;
    if (!current.classList.contains("thumb")) return;

    const dirMap = { ArrowRight: "right", ArrowLeft: "left", ArrowDown: "down", ArrowUp: "up" };
    if (dirMap[e.key]) {
      e.preventDefault();
      const next = nearestInDirection(current, dirMap[e.key]);
      if (next) setFocused(next); // clamp: no-op at edges
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      openOverlay(Number(current.dataset.index), 0, current);
    }
  });

  thumbs.forEach((t) => {
    t.addEventListener("click", (e) => {
      e.preventDefault();
      setFocused(t);
      openOverlay(Number(t.dataset.index), 0, t);
    });
  });

  // ---------- overlay ----------

  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML = `
    <button class="overlay-close" aria-label="Close">esc to close</button>
    <button class="overlay-nav overlay-nav--prev" aria-label="Previous">‹</button>
    <img alt="">
    <button class="overlay-nav overlay-nav--next" aria-label="Next">›</button>
    <span class="overlay-caption"></span>
  `;
  document.body.appendChild(overlay);

  const overlayImg = overlay.querySelector("img");
  const overlayCaption = overlay.querySelector(".overlay-caption");
  const btnClose = overlay.querySelector(".overlay-close");
  const btnPrev = overlay.querySelector(".overlay-nav--prev");
  const btnNext = overlay.querySelector(".overlay-nav--next");

  let state = { artIndex: null, imgIndex: 0, returnFocusEl: null };

  function renderOverlay() {
    const art = artworks[state.artIndex];
    const img = art.images[state.imgIndex];
    overlayImg.src = img.full.jpeg[img.full.jpeg.length - 1].url;
    overlayImg.alt = art.title;
    overlayCaption.textContent = art.isCollection
      ? `${state.imgIndex + 1} / ${art.images.length} — ${art.title}${art.medium ? ", " + art.medium : ""}`
      : `${art.title}${art.medium ? ", " + art.medium : ""}`;
    btnPrev.style.visibility = art.isCollection && state.imgIndex > 0 ? "visible" : "hidden";
    btnNext.style.visibility =
      art.isCollection && state.imgIndex < art.images.length - 1 ? "visible" : "hidden";
  }

  function openOverlay(artIndex, imgIndex, originEl) {
    state = { artIndex, imgIndex, returnFocusEl: originEl };
    renderOverlay();
    overlay.hidden = false;
    btnClose.focus();
    document.addEventListener("keydown", onOverlayKeydown);
  }

  function closeOverlay() {
    overlay.hidden = true;
    document.removeEventListener("keydown", onOverlayKeydown);
    if (state.returnFocusEl) setFocused(state.returnFocusEl);
  }

  function stepCollection(delta) {
    const art = artworks[state.artIndex];
    const next = state.imgIndex + delta;
    if (next < 0 || next >= art.images.length) return; // clamp
    state.imgIndex = next;
    renderOverlay();
  }

  function onOverlayKeydown(e) {
    if (e.key === "Escape") { e.preventDefault(); closeOverlay(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); stepCollection(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); stepCollection(1); }
  }

  btnClose.addEventListener("click", closeOverlay);
  btnPrev.addEventListener("click", () => stepCollection(-1));
  btnNext.addEventListener("click", () => stepCollection(1));
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeOverlay(); });
})();
