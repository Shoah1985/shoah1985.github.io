document.addEventListener("DOMContentLoaded", () => {
  const noteDefinitions = {};
  const body = document.body;

  /*
   * NOTE FORMAT
   *
   * Reference:
   * ((note:maly-bialy-domek|Mały biały domek))
   *
   * Definition:
   * ((note:maly-bialy-domek))
   * A popular Polish tango...
   */

  /*
   * 1. Find and store note definitions.
   */

  const blockElements = Array.from(
    body.querySelectorAll("p, div, li")
  );

  blockElements.forEach((element) => {
    const text = element.textContent.trim();

    const inlineDefinition = text.match(
      /^\(\(note:([a-zA-Z0-9_-]+)\)\)\s*(.+)$/s
    );

    if (inlineDefinition) {
      const noteId = inlineDefinition[1];
      const noteText = inlineDefinition[2].trim();

      noteDefinitions[noteId] = noteText;
      element.remove();
      return;
    }

    const standaloneDefinition = text.match(
      /^\(\(note:([a-zA-Z0-9_-]+)\)\)$/
    );

    if (standaloneDefinition) {
      const noteId = standaloneDefinition[1];
      const next = element.nextElementSibling;

      if (next) {
        noteDefinitions[noteId] =
          next.textContent.trim();

        next.remove();
      }

      element.remove();
    }
  });

  /*
   * 2. Convert note references:
   *
   * ((note:maly-bialy-domek|Mały biały domek))
   *
   * into:
   *
   * <span class="note" data-note-id="maly-bialy-domek">
   *   Mały biały domek
   * </span>
   */

  function convertNoteReferences(root) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue.includes("((note:")) {
            return NodeFilter.FILTER_REJECT;
          }

          const parent = node.parentElement;

          if (
            !parent ||
            parent.classList.contains("note") ||
            parent.classList.contains("note-tooltip") ||
            parent.tagName === "SCRIPT" ||
            parent.tagName === "STYLE"
          ) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const textNodes = [];
    let node;

    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    textNodes.forEach((textNode) => {
      const text = textNode.nodeValue;

      const pattern =
        /\(\(note:([a-zA-Z0-9_-]+)\|(.+?)\)\)/g;

      const fragment =
        document.createDocumentFragment();

      let lastIndex = 0;
      let match;

      while ((match = pattern.exec(text)) !== null) {
        const before = text.slice(
          lastIndex,
          match.index
        );

        if (before) {
          fragment.appendChild(
            document.createTextNode(before)
          );
        }

        const noteId = match[1];
        const visibleText = match[2];

        const span =
          document.createElement("span");

        span.className = "note";
        span.dataset.noteId = noteId;
        span.textContent = visibleText;

        fragment.appendChild(span);

        lastIndex = pattern.lastIndex;
      }

      const after = text.slice(lastIndex);

      if (after) {
        fragment.appendChild(
          document.createTextNode(after)
        );
      }

      textNode.replaceWith(fragment);
    });
  }

  convertNoteReferences(body);

  /*
   * 3. Create tooltip.
   */

  const notes =
    document.querySelectorAll(".note");

  if (!notes.length) return;

  const tooltip =
    document.createElement("div");

  tooltip.className = "note-tooltip";
  tooltip.setAttribute("role", "tooltip");
  tooltip.setAttribute("aria-hidden", "true");

  document.body.appendChild(tooltip);

  let activeNote = null;

  function positionTooltip(note) {
    const rect =
      note.getBoundingClientRect();

    const tooltipRect =
      tooltip.getBoundingClientRect();

    let left =
      rect.left +
      rect.width / 2 -
      tooltipRect.width / 2;

    let top =
      rect.top -
      tooltipRect.height -
      10;

    const margin = 10;

    left = Math.max(
      margin,
      Math.min(
        left,
        window.innerWidth -
          tooltipRect.width -
          margin
      )
    );

    if (top < margin) {
      top = rect.bottom + 10;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function showNote(note) {
    const noteId =
      note.dataset.noteId;

    const noteText =
      noteDefinitions[noteId];

    if (!noteText) {
      console.warn(
        `No definition found for note: ${noteId}`
      );
      return;
    }

    activeNote = note;

    tooltip.textContent = noteText;
    tooltip.classList.add("visible");
    tooltip.setAttribute(
      "aria-hidden",
      "false"
    );

    requestAnimationFrame(() => {
      positionTooltip(note);
    });
  }

  function hideNote() {
    activeNote = null;

    tooltip.classList.remove("visible");
    tooltip.setAttribute(
      "aria-hidden",
      "true"
    );
  }

  /*
   * 4. Mouse, keyboard and touch behaviour.
   */

  notes.forEach((note) => {
    note.tabIndex = 0;

    note.addEventListener(
      "mouseenter",
      () => showNote(note)
    );

    note.addEventListener(
      "mouseleave",
      hideNote
    );

    note.addEventListener(
      "focus",
      () => showNote(note)
    );

    note.addEventListener(
      "blur",
      hideNote
    );

    note.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();

        if (activeNote === note) {
          hideNote();
        } else {
          showNote(note);
        }
      }
    );
  });

  document.addEventListener(
    "click",
    hideNote
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        hideNote();
      }
    }
  );

  window.addEventListener(
    "resize",
    () => {
      if (activeNote) {
        positionTooltip(activeNote);
      }
    }
  );

  window.addEventListener(
    "scroll",
    () => {
      if (activeNote) {
        positionTooltip(activeNote);
      }
    },
    true
  );
});
