document.addEventListener("DOMContentLoaded", () => {
  const notes = document.querySelectorAll(".note");

  if (!notes.length) return;

  const tooltip = document.createElement("div");
  tooltip.className = "note-tooltip";
  tooltip.setAttribute("role", "tooltip");
  document.body.appendChild(tooltip);

  let activeNote = null;

  function positionTooltip(note) {
    const rect = note.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    let top = rect.top - tooltipRect.height - 10;

    left = Math.max(
      10,
      Math.min(left, window.innerWidth - tooltipRect.width - 10)
    );

    if (top < 10) {
      top = rect.bottom + 10;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function showNote(note) {
    const text = note.dataset.note;

    if (!text) return;

    activeNote = note;
    tooltip.textContent = text;
    tooltip.classList.add("visible");

    requestAnimationFrame(() => {
      positionTooltip(note);
    });
  }

  function hideNote() {
    activeNote = null;
    tooltip.classList.remove("visible");
  }

  notes.forEach((note) => {
    note.tabIndex = 0;

    note.addEventListener("mouseenter", () => showNote(note));
    note.addEventListener("mouseleave", hideNote);

    note.addEventListener("focus", () => showNote(note));
    note.addEventListener("blur", hideNote);

    note.addEventListener("click", (event) => {
      event.stopPropagation();

      if (activeNote === note) {
        hideNote();
      } else {
        showNote(note);
      }
    });
  });

  document.addEventListener("click", hideNote);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideNote();
    }
  });

  window.addEventListener("resize", () => {
    if (activeNote) {
      positionTooltip(activeNote);
    }
  });

  window.addEventListener("scroll", () => {
    if (activeNote) {
      positionTooltip(activeNote);
    }
  });
});
