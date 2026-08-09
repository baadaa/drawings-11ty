(function () {
  "use strict";
  const chips = document.querySelectorAll(".chip");
  const thumbs = document.querySelectorAll("#archive-grid .thumb");
  if (!chips.length) return;

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");

      const type = chip.dataset.filterType;
      const value = chip.dataset.filterValue;

      thumbs.forEach((t) => {
        if (type === "all") { t.hidden = false; return; }
        if (type === "tag") { t.hidden = !t.dataset.tags.split(",").includes(value); return; }
        if (type === "year") { t.hidden = t.dataset.year !== value; return; }
      });
    });
  });
})();
