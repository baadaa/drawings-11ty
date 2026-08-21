(function () {
  "use strict";
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  toggle.addEventListener("click", () => {
    setOpen(!nav.classList.contains("is-open"));
  });

  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  // collapsing back to desktop width shouldn't leave the menu stuck open
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 900) setOpen(false);
  });
})();
