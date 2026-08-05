import TurndownService from "turndown";
import * as gfmPlugin from "turndown-plugin-gfm";
import * as domino from "@mixmark-io/domino";

export function safePathPart(value) {
  return (
    value
      .replace(/[<>:"/\\|?*？\x00-\x1f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[. ]+$/g, "")
      .replace(/^-+|-+$/g, "") || "untitled"
  );
}

function cleanMarkdownTables(markdown) {
  return markdown.replace(/<table[\s\S]*?<\/table>/g, (tableHtml) => {
    const window = domino.createWindow(`<div id="table-root">${tableHtml}</div>`);
    const table = window.document.querySelector("table");
    const rows = Array.from(table.querySelectorAll("tr"))
      .map((row) =>
        Array.from(row.querySelectorAll("th,td")).map((cell) =>
          (cell.textContent || "")
            .replace(/\u200B/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/\|/g, "\\|"),
        ),
      )
      .filter((row) => row.length);

    if (!rows.length) return "";

    const columnCount = Math.max(...rows.map((row) => row.length));
    const paddedRows = rows.map((row) =>
      row.concat(Array(columnCount - row.length).fill("")),
    );

    return (
      "\n\n" +
      paddedRows
        .map((row, index) => {
          const line = `| ${row.join(" | ")} |`;
          if (index !== 0) return line;
          return `${line}\n| ${row.map(() => "---").join(" | ")} |`;
        })
        .join("\n") +
      "\n\n"
    );
  });
}

export function convertYuqueArticle(pageData) {
  const window = domino.createWindow(
    `<article id="clip-root">${pageData.html}</article>`,
  );
  const document = window.document;
  const root = document.querySelector("#clip-root");

  for (const card of Array.from(
    root.querySelectorAll('ne-card[data-card-name="codeblock"]'),
  )) {
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    const lines = Array.from(card.querySelectorAll(".cm-content .cm-line")).map(
      (line) => line.textContent || "",
    );
    const language =
      card.querySelector(".cm-content")?.getAttribute("data-language") || "";

    if (language) code.setAttribute("class", `language-${language}`);
    code.textContent =
      lines.join("\n") || card.querySelector(".cm-content")?.textContent || "";
    pre.appendChild(code);
    card.parentNode.replaceChild(pre, card);
  }

  for (const card of Array.from(
    root.querySelectorAll('ne-card[data-card-name="image"]'),
  )) {
    const sourceImage = card.querySelector("img");
    if (!sourceImage) {
      card.remove();
      continue;
    }

    const image = document.createElement("img");
    image.setAttribute("src", sourceImage.getAttribute("src") || "");
    image.setAttribute("alt", sourceImage.getAttribute("alt") || "");
    card.parentNode.replaceChild(image, card);
  }

  for (const table of Array.from(root.querySelectorAll("table"))) {
    const firstRow = table.querySelector("tr");
    if (!firstRow) continue;

    for (const cell of Array.from(firstRow.children)) {
      if (cell.tagName !== "TD") continue;
      const heading = document.createElement("th");
      while (cell.firstChild) heading.appendChild(cell.firstChild);
      cell.parentNode.replaceChild(heading, cell);
    }
  }

  for (const selector of [
    "svg",
    ".ne-viewer-header",
    ".ne-heading-ext",
    ".ne-list-fold",
    ".ne-list-symbol",
    ".ne-v-codeblock-hold",
    ".ne-codeblock-copy-icon",
    ".cm-gutters",
    ".cm-announced",
    ".cm-layer",
    ".ne-ui-image-inner-button-wrap",
    ".ne-viewer-b-filler",
  ]) {
    for (const element of Array.from(root.querySelectorAll(selector))) {
      element.remove();
    }
  }

  for (const level of [2, 3, 4, 5, 6]) {
    for (const element of Array.from(root.querySelectorAll(`ne-h${level}`))) {
      const heading = document.createElement(`h${level}`);
      heading.textContent = (
        element.querySelector("ne-heading-content")?.textContent ||
        element.textContent ||
        ""
      ).trim();
      element.parentNode.replaceChild(heading, element);
    }
  }

  for (const [from, to] of [
    ["ne-quote", "blockquote"],
    ["ne-p", "p"],
  ]) {
    for (const element of Array.from(root.querySelectorAll(from))) {
      const replacement = document.createElement(to);
      while (element.firstChild) replacement.appendChild(element.firstChild);
      element.parentNode.replaceChild(replacement, element);
    }
  }

  for (const element of Array.from(root.querySelectorAll("ne-text"))) {
    const tag =
      element.getAttribute("ne-code") === "true"
        ? "code"
        : element.getAttribute("ne-bold") === "true"
          ? "strong"
          : element.getAttribute("ne-italic") === "true"
            ? "em"
            : "span";
    const replacement = document.createElement(tag);
    while (element.firstChild) replacement.appendChild(element.firstChild);
    element.parentNode.replaceChild(replacement, element);
  }

  for (const [from, listTag, contentTag] of [
    ["ne-uli", "ul", "ne-uli-c"],
    ["ne-oli", "ol", "ne-oli-c"],
  ]) {
    for (const element of Array.from(root.querySelectorAll(from))) {
      const list = document.createElement(listTag);
      const item = document.createElement("li");
      const content = element.querySelector(contentTag);

      if (content) {
        while (content.firstChild) item.appendChild(content.firstChild);
      } else {
        item.textContent = element.textContent || "";
      }

      list.appendChild(item);
      element.parentNode.replaceChild(list, element);
    }
  }

  const turndown = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**",
  });
  turndown.use(gfmPlugin.gfm);
  turndown.remove(
    (node) => node.tagName === "BUTTON" || node.tagName === "STYLE",
  );

  let body = turndown
    .turndown(root.innerHTML)
    .replace(/\u200B/g, "")
    .replace(/^(#{2,6}\s+\d+)\\\./gm, "$1.")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  body = cleanMarkdownTables(body)
    .replace(/```stex\n/g, "```text\n")
    .replace(/\n{3,}/g, "\n\n");

  return `---
title: ${JSON.stringify(pageData.title)}
source: ${pageData.source}
exported_at: 2026-07-27
---

# ${pageData.title}

${body}
`;
}
