document.addEventListener("DOMContentLoaded", () => {
  const noteDefinitions = {};
  const body = document.body;

  const walker = document.createTreeWalker(
    body,
    NodeFilter.SHOW_TEXT,
    null
  );

  const textNodes = [];
  let currentNode;

  while ((currentNode = walker.nextNode())) {
    textNodes.push(currentNode);
  }

  textNodes.forEach((node) => {
    const text = node.nodeValue;

    if (!text || !text.includes("[note:")) return;

    const match = text.match(
      /\[note:([a-zA-Z0-9-_]+)\]\s*([\s\S]*)/
    );

    if (!match) return;

    const noteId = match[1];
    const noteText = match[2].trim();

    if (noteText) {
      noteDefinitions[noteId] = noteText;
    }

    node.nodeValue = "";
  });

  /*
   * 2. Convert:
   *
   * {{note:maly-bialy-domek|Mały biały domek}}
   *
   * into:
   *
   * <span
   *   class="note"
   *   data-note-id="maly-bialy-domek"
   *   data-note="..."
   * >
   *   Mały biały domek
   * </span>
   */

  function convertNoteReferences(element) {
    const childNodes = Array.from(element.childNodes);

    childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue;

        if (!text || !text.includes("{{note:")) return;

        const fragment = document.createDocumentFragment();

        const pattern =
          /\{\{note:([a-zA-Z0-9-_]+)\|([^}]+)\}\}/g;

        let lastIndex = 0;
        let match;

        while ((match = pattern.exec(text)) !== null) {
          const before = text.slice(lastIndex, match.index);

          if (before) {
            fragment.appendChild(
              document.createTextNode(before)
            );
          }

          const noteId = match[1];
          const visibleText = match[2];

          const note = document.createElement("span");

          note.className = "note";
          note.dataset.noteId = noteId;
          note.dataset.note =
            noteDefinitions[noteId] || "";
          note.textContent = visibleText;

          fragment.appendChild(note);

          lastIndex = pattern.lastIndex;
        }

        const after = text.slice(lastIndex);

        if (after) {
          fragment.appendChild(
            document.createTextNode(after)
          );
        }

        node.replaceWith(fragment);
      } else if (
        node.nodeType === Node.ELEMENT_NODE &&
        !node.classList.contains("note")
      ) {
        convertNoteReferences(node);
      }
    });
  }

  convertNoteReferences(body);

  /*
   * 3. Tooltip
   */

  const notes = document.querySelectorAll(".note");

  if (!notes.length) return;

  const tooltip = document.createElement("div");

  tooltip.className = "note-tooltip";
  tooltip.setAttribute("role", "tooltip");

  document.body.appendChild(tooltip);

  let activeNote = null;

  function positionTooltip(note) {
    const rect = note.getBoundingClientRect();
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

    left = Math.max(
      10,
      Math.min(
        left,
        window.innerWidth -
          tooltipRect.width -
          10
      )
    );

    if (top < 10) {
      top = rect.bottom + 10;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function showNote(note) {
    const noteId = note.dataset.noteId;
    const noteText =
      note.dataset.note ||
      noteDefinitions[noteId];

    if (!noteText) return;

    activeNote = note;

    tooltip.textContent = noteText;
    tooltip.classList.add("visible");

    requestAnimationFrame(() => {
      positionTooltip(note);
    });
  }

  function hideNote() {
    activeNote = null;
    tooltip.classList.remove("visible");
  }

  /*
   * 4. Mouse, keyboard and touch behaviour
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
    }
  );
});
