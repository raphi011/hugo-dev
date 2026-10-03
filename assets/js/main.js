// Ledger theme: progressive enhancements only. The site works fully without JS.
(() => {
  // Reading progress: only on pages with at least a viewport of scrolling
  const progress = document.querySelector(".progress");
  if (progress) {
    addEventListener("load", () => {
      progress.hidden = document.documentElement.scrollHeight < 2 * innerHeight;
    });
  }

  // Copy buttons on code blocks
  if (!navigator.clipboard) return;
  document.querySelectorAll(".code-block").forEach((block) => {
    const button = block.querySelector(".copy");
    // with table line numbers the code is in the last <code>; the first holds the numbers
    const codes = block.querySelectorAll("pre code");
    const code = codes[codes.length - 1] || block.querySelector("pre");
    if (!button || !code) return;
    const label = button.querySelector("span");
    button.hidden = false;
    button.addEventListener("click", async () => {
      // drop inline line numbers and shell prompts
      const clone = code.cloneNode(true);
      clone.querySelectorAll(".ln, .gp").forEach((node) => {
        const next = node.nextSibling;
        if (node.matches(".gp") && next && next.nodeType === Node.TEXT_NODE) {
          next.textContent = next.textContent.replace(/^ /, "");
        }
        node.remove();
      });
      const text = clone.textContent.replace(/\n$/, "");
      try {
        await navigator.clipboard.writeText(text);
        button.classList.add("is-copied");
        if (label) label.textContent = button.dataset.copied;
        setTimeout(() => {
          button.classList.remove("is-copied");
          if (label) label.textContent = button.dataset.copy;
        }, 1600);
      } catch (_) { /* clipboard blocked: do nothing */ }
    });
  });
})();
