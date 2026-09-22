import "./setup.js";
import { afterEach, test, expect } from "bun:test";

afterEach(() => {
  document.body.innerHTML = "";
});

function sampleTree() {
  return [
    {
      id: "Colombia",
      label: "Colombia",
      value: "Colombia",
      valueType: "character",
      level: 1,
      levelName: "country",
      levelIndex: 1,
      parentId: null,
      path: [{ id: "Colombia", levelName: "country", value: "Colombia" }],
      children: [
        {
          id: "Colombia::Antioquia",
          label: "Antioquia",
          value: "Antioquia",
          valueType: "character",
          level: 2,
          levelName: "department",
          levelIndex: 2,
          parentId: "Colombia",
          path: [
            { id: "Colombia", levelName: "country", value: "Colombia" },
            {
              id: "Colombia::Antioquia",
              levelName: "department",
              value: "Antioquia"
            }
          ],
          children: []
        }
      ]
    }
  ];
}

function createElement() {
  const element = document.createElement("div");
  element.id = "places";
  element.className = "shiny-hierarchy-input";
  const tree = document.createElement("div");
  tree.className = "shiny-hierarchy-tree";
  element.appendChild(tree);
  document.body.appendChild(element);
  return element;
}

test("indexTree maps all node ids", () => {
  const tree = [
    {
      id: "2026",
      children: [
        { id: "2026::January", children: [{ id: "2026::January::1" }] }
      ]
    }
  ];

  const index = new Map();
  globalThis.shinyHierarchyModel.indexTree(tree, index);

  expect(index.size).toBe(3);
  expect(index.get("2026::January::1").id).toBe("2026::January::1");
});

test("summaryLabel reflects selection counts", () => {
  const label = globalThis.shinyHierarchyModel.summaryLabel(
    {
      summary: { selectedLeaves: 2, allSelected: false }
    },
    "Multiple selection"
  );

  expect(label).toBe("2 selected");
});

test("inline mode renders without search by default", () => {
  const element = createElement();

  globalThis.shinyHierarchy.render(element, sampleTree(), {
    levels: ["country", "department", "city"],
    display: "inline",
    search: false,
    selectAll: true,
    expand: "first"
  });

  expect(element.querySelector(".shiny-hierarchy-search")).toBeNull();
  expect(element.querySelector(".shiny-hierarchy-clear")).toBeNull();
  expect(element.querySelector(".shiny-hierarchy-panel").hidden).toBe(false);
  expect(element.querySelector(".shiny-hierarchy-select-all")).not.toBeNull();
});

test("dropdown mode starts closed and search remains optional", () => {
  const element = createElement();

  globalThis.shinyHierarchy.render(element, sampleTree(), {
    levels: ["country", "department"],
    display: "dropdown",
    search: true,
    expand: "none"
  });

  expect(element.querySelector(".shiny-hierarchy-panel").hidden).toBe(true);
  expect(element.querySelector(".shiny-hierarchy-search")).not.toBeNull();
});

test("select all cascades to leaves and produces a generic value", () => {
  const element = createElement();

  globalThis.shinyHierarchy.render(element, sampleTree(), {
    levels: ["country", "department"],
    display: "inline",
    selectAll: true
  });

  const checkbox = element.querySelector(".shiny-hierarchy-select-all");
  expect(
    element.querySelectorAll(
      ".shiny-hierarchy-tree > .shiny-hierarchy-node"
    ).length
  ).toBe(1);
  checkbox.click();
  expect(
    element.querySelector(
      ".shiny-hierarchy-tree > .shiny-hierarchy-node " +
        ".shiny-hierarchy-checkbox"
    ).checked
  ).toBe(true);
  expect(checkbox.checked).toBe(true);

  const value = globalThis.shinyHierarchy.buildValue(element);
  expect(value.summary.allSelected).toBe(true);
  expect(value.resolved).toHaveLength(1);
  expect(value.resolved[0].levelName).toBe("department");
  expect(value.resolved[0].sourceId).toBe("Colombia");
});
