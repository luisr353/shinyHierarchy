(function () {
  "use strict";

  function directChild(node, className) {
    return Array.from(node.children).find(function (child) {
      return child.classList.contains(className);
    });
  }

  function directCheckbox(node) {
    const row = directChild(node, "shiny-hierarchy-row");
    return row
      ? row.querySelector(".shiny-hierarchy-checkbox")
      : null;
  }

  function childNodes(node) {
    const group = directChild(node, "shiny-hierarchy-children");
    return group
      ? Array.from(group.children).filter(function (child) {
          return child.classList.contains("shiny-hierarchy-node");
        })
      : [];
  }

  function setCheckbox(checkbox, checked, mixed) {
    if (!checkbox) return;
    checkbox.checked = checked;
    checkbox.indeterminate = mixed;
    checkbox.setAttribute(
      "aria-checked",
      mixed ? "mixed" : checked ? "true" : "false"
    );
  }

  function setSubtree(node, checked) {
    setCheckbox(directCheckbox(node), checked, false);
    childNodes(node).forEach(function (child) {
      setSubtree(child, checked);
    });
  }

  function updateNode(node) {
    const children = childNodes(node);
    if (!children.length) return;
    const states = children.map(directCheckbox).filter(Boolean);
    const all = states.every(function (box) {
      return box.checked && !box.indeterminate;
    });
    const none = states.every(function (box) {
      return !box.checked && !box.indeterminate;
    });
    setCheckbox(directCheckbox(node), all, !all && !none);
  }

  function updateTree(container) {
    Array.from(container.querySelectorAll(".shiny-hierarchy-node"))
      .reverse()
      .forEach(updateNode);
  }

  function updateAncestors(node) {
    let parent = node.parentElement?.closest(".shiny-hierarchy-node");
    while (parent) {
      updateNode(parent);
      parent = parent.parentElement?.closest(".shiny-hierarchy-node");
    }
  }

  function notify(element) {
    element.dispatchEvent(
      new CustomEvent("shinyhierarchy:change", { bubbles: true })
    );
  }

  function currentValue(element) {
    return window.shinyHierarchyModel.buildValue(
      element,
      element._hierarchyTree || [],
      element._hierarchyLevels || [],
      element._hierarchyState || window.shinyHierarchyModel.createState()
    );
  }

  function updateHeader(element) {
    const value = currentValue(element);
    const text = element.querySelector(".shiny-hierarchy-trigger-text");
    const selectAll = element.querySelector(".shiny-hierarchy-select-all");

    if (text) {
      text.textContent =
        element._display === "inline"
          ? element._placeholder
          : window.shinyHierarchyModel.summaryLabel(
              value,
              element._placeholder
            );
    }

    if (selectAll) {
      setCheckbox(
        selectAll,
        value.summary.allSelected,
        value.summary.selectedLeaves > 0 && !value.summary.allSelected
      );
    }
  }

  function setExpanded(node, expanded) {
    const children = directChild(node, "shiny-hierarchy-children");
    const row = directChild(node, "shiny-hierarchy-row");
    const toggle = row
      ? row.querySelector(".shiny-hierarchy-toggle")
      : null;
    if (!children || !toggle || toggle.disabled) return;
    children.hidden = !expanded;
    toggle.textContent = "";
    toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
  }

  function initialExpanded(node, element) {
    const explicit = element._expandedIds;
    if (explicit && explicit.size) return explicit.has(node.id);
    if (element._expandMode === "all") return true;
    if (element._expandMode === "none") return false;
    return node.level === 1;
  }

  function createNode(node, element, index) {
    const wrapper = document.createElement("div");
    wrapper.className = "shiny-hierarchy-node";
    wrapper.dataset.nodeId = node.id;
    wrapper.dataset.level = node.level;
    wrapper.setAttribute("role", "treeitem");
    wrapper.setAttribute("aria-level", String(node.level));

    const row = document.createElement("div");
    row.className = "shiny-hierarchy-row";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "shiny-hierarchy-toggle";
    toggle.setAttribute("aria-label", "Expandir o contraer " + node.label);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "shiny-hierarchy-checkbox";
    checkbox.id =
      element.id + "-node-" + node.id.replace(/[^a-zA-Z0-9_-]/g, "_");
    checkbox.setAttribute("aria-checked", "false");

    const label = document.createElement("label");
    label.className = "shiny-hierarchy-label-text";
    label.setAttribute("for", checkbox.id);
    label.textContent = node.label;

    row.appendChild(toggle);
    row.appendChild(checkbox);
    row.appendChild(label);
    wrapper.appendChild(row);

    const children = document.createElement("div");
    children.className = "shiny-hierarchy-children";
    children.setAttribute("role", "group");

    if (node.children && node.children.length) {
      node.children.forEach(function (child) {
        children.appendChild(createNode(child, element, index));
      });
      wrapper.appendChild(children);
      setExpanded(wrapper, initialExpanded(node, element));
      toggle.addEventListener("click", function (event) {
        event.stopPropagation();
        setExpanded(wrapper, children.hidden);
      });
    } else {
      toggle.disabled = true;
      toggle.setAttribute("aria-hidden", "true");
      wrapper.appendChild(children);
    }

    checkbox.addEventListener("change", function () {
      const action = checkbox.checked ? "selected" : "excluded";
      window.shinyHierarchyModel.recordExplicit(
        element._hierarchyState,
        node.id,
        action,
        index
      );
      setSubtree(wrapper, checkbox.checked);
      updateAncestors(wrapper);
      updateHeader(element);
      notify(element);
    });

    return wrapper;
  }

  function applySearch(element, query) {
    const normalized = (query || "").trim().toLocaleLowerCase();
    const nodes = Array.from(
      element.querySelectorAll(".shiny-hierarchy-node")
    );
    nodes.forEach(function (node) {
      node.classList.remove("shiny-hierarchy-hidden");
    });
    if (!normalized) return;

    nodes.forEach(function (node) {
      const label = node.querySelector(
        ".shiny-hierarchy-row .shiny-hierarchy-label-text"
      );
      const matches =
        label &&
        label.textContent.toLocaleLowerCase().includes(normalized);
      node.classList.toggle("shiny-hierarchy-hidden", !matches);
      if (matches) {
        let parent = node.parentElement?.closest(".shiny-hierarchy-node");
        while (parent) {
          parent.classList.remove("shiny-hierarchy-hidden");
          setExpanded(parent, true);
          parent = parent.parentElement?.closest(".shiny-hierarchy-node");
        }
      }
    });
  }

  function selectAll(element, checked) {
    const roots = element.querySelectorAll(
      ".shiny-hierarchy-tree > .shiny-hierarchy-node"
    );
    const index = new Map();
    window.shinyHierarchyModel.indexTree(element._hierarchyTree || [], index);
    element._hierarchyState = window.shinyHierarchyModel.createState();
    roots.forEach(function (root) {
      setSubtree(root, checked);
      if (checked) {
        window.shinyHierarchyModel.recordExplicit(
          element._hierarchyState,
          root.dataset.nodeId,
          "selected",
          index
        );
      }
    });
    updateHeader(element);
    notify(element);
  }

  function createSelectAllRow(element) {
    const row = document.createElement("div");
    row.className =
      "shiny-hierarchy-row shiny-hierarchy-select-all-row";

    const spacer = document.createElement("span");
    spacer.className = "shiny-hierarchy-toggle-spacer";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className =
      "shiny-hierarchy-checkbox shiny-hierarchy-select-all";
    checkbox.id = element.id + "-select-all";
    checkbox.setAttribute("aria-checked", "false");

    const label = document.createElement("label");
    label.className = "shiny-hierarchy-label-text";
    label.setAttribute("for", checkbox.id);
    label.textContent = element._selectAllLabel;

    checkbox.addEventListener("change", function () {
      selectAll(element, checkbox.checked);
    });

    row.appendChild(spacer);
    row.appendChild(checkbox);
    row.appendChild(label);
    return row;
  }

  function clearSelection(element, notifyServer) {
    element
      .querySelectorAll(".shiny-hierarchy-tree > .shiny-hierarchy-node")
      .forEach(function (root) {
        setSubtree(root, false);
      });
    element._hierarchyState = window.shinyHierarchyModel.createState();
    updateHeader(element);
    if (notifyServer) notify(element);
  }

  function installKeyboardNavigation(element, tree) {
    if (tree._hierarchyKeyboardInstalled) return;
    tree._hierarchyKeyboardInstalled = true;
    tree.addEventListener("keydown", function (event) {
      const target = event.target;
      if (!target.classList.contains("shiny-hierarchy-checkbox")) return;
      const node = target.closest(".shiny-hierarchy-node");
      if (!node) return;

      if (event.key === "ArrowRight") {
        setExpanded(node, true);
        event.preventDefault();
      } else if (event.key === "ArrowLeft") {
        setExpanded(node, false);
        event.preventDefault();
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        const visible = Array.from(
          tree.querySelectorAll(".shiny-hierarchy-checkbox")
        ).filter(function (box) {
          return box.offsetParent !== null;
        });
        const index = visible.indexOf(target);
        const delta = event.key === "ArrowDown" ? 1 : -1;
        const next = visible[index + delta];
        if (next) next.focus();
        event.preventDefault();
      }
    });
  }

  function buildShell(element) {
    const tree = element.querySelector(".shiny-hierarchy-tree");
    const shell = document.createElement("div");
    shell.className = "shiny-hierarchy-shell";

    const header = document.createElement("div");
    header.className = "shiny-hierarchy-header";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.id = element.id + "-trigger";
    trigger.className = "shiny-hierarchy-trigger";
    trigger.setAttribute("aria-expanded", "true");

    const text = document.createElement("span");
    text.className = "shiny-hierarchy-trigger-text";

    const chevron = document.createElement("span");
    chevron.className = "shiny-hierarchy-trigger-chevron";

    trigger.appendChild(text);
    trigger.appendChild(chevron);
    header.appendChild(trigger);

    const panel = document.createElement("div");
    panel.className = "shiny-hierarchy-panel";

    if (element._searchEnabled) {
      const search = document.createElement("input");
      search.type = "search";
      search.className = "shiny-hierarchy-search";
      search.placeholder = element._searchPlaceholder;
      search.setAttribute("aria-label", element._searchPlaceholder);
      search.addEventListener("input", function () {
        applySearch(element, search.value);
      });
      panel.appendChild(search);
    }

    if (element._selectAllEnabled) {
      panel.appendChild(createSelectAllRow(element));
    }

    tree.setAttribute("role", "tree");
    panel.appendChild(tree);
    shell.appendChild(header);
    shell.appendChild(panel);
    element.insertBefore(shell, element.firstChild);

    trigger.addEventListener("click", function () {
      const open = panel.hidden;
      panel.hidden = !open;
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
    });

    installKeyboardNavigation(element, tree);
  }

  function configureShell(element) {
    const shell = element.querySelector(".shiny-hierarchy-shell");
    const panel = element.querySelector(".shiny-hierarchy-panel");
    const trigger = element.querySelector(".shiny-hierarchy-trigger");
    if (!shell || !panel || !trigger) return;

    shell.classList.toggle(
      "shiny-hierarchy-shell-inline",
      element._display === "inline"
    );
    shell.classList.toggle(
      "shiny-hierarchy-shell-dropdown",
      element._display === "dropdown"
    );
    panel.hidden = element._display === "dropdown";
    trigger.setAttribute(
      "aria-haspopup",
      element._display === "dropdown" ? "tree" : "false"
    );
    trigger.setAttribute(
      "aria-expanded",
      element._display === "inline" ? "true" : "false"
    );

    if (element._display === "dropdown" && !element._outsideClickHandler) {
      element._outsideClickHandler = function (event) {
        if (!element.contains(event.target)) {
          panel.hidden = true;
          trigger.setAttribute("aria-expanded", "false");
        }
      };
      document.addEventListener("click", element._outsideClickHandler);
    }
  }

  function applySelectedIds(element, selectedIds) {
    clearSelection(element, false);
    const ids = new Set(selectedIds || []);
    const container = element.querySelector(".shiny-hierarchy-tree");
    const index = new Map();
    window.shinyHierarchyModel.indexTree(element._hierarchyTree || [], index);
    ids.forEach(function (id) {
      const node = container.querySelector(
        '.shiny-hierarchy-node[data-node-id="' + CSS.escape(id) + '"]'
      );
      if (node) {
        setSubtree(node, true);
        window.shinyHierarchyModel.recordExplicit(
          element._hierarchyState,
          id,
          "selected",
          index
        );
      }
    });
    updateTree(container);
    updateHeader(element);
  }

  function applyExpandedIds(element, ids) {
    const expanded = new Set(ids || []);
    element
      .querySelectorAll(".shiny-hierarchy-node")
      .forEach(function (node) {
        setExpanded(node, expanded.has(node.dataset.nodeId));
      });
  }

  window.shinyHierarchy = {
    render: function (element, tree, options) {
      options = options || {};
      element._hierarchyTree = tree;
      element._hierarchyLevels = options.levels || [];
      element._placeholder = options.placeholder || "Selección múltiple";
      element._display = options.display || "inline";
      element._searchEnabled = options.search === true;
      element._searchPlaceholder =
        options.searchPlaceholder || "Buscar...";
      element._selectAllEnabled = options.selectAll !== false;
      element._selectAllLabel =
        options.selectAllLabel || "Seleccionar todo";
      element._expandMode = options.expand || "first";
      element._expandedIds = new Set(options.expanded || []);
      element._hierarchyState =
        element._hierarchyState ||
        window.shinyHierarchyModel.createState();

      if (!element.querySelector(".shiny-hierarchy-shell")) {
        buildShell(element);
      }
      configureShell(element);

      const container = element.querySelector(".shiny-hierarchy-tree");
      const index = new Map();
      window.shinyHierarchyModel.indexTree(tree, index);
      container.innerHTML = "";
      tree.forEach(function (node) {
        container.appendChild(createNode(node, element, index));
      });

      updateTree(container);
      if (options.selected && options.selected.length) {
        applySelectedIds(element, options.selected);
      }
      updateHeader(element);
    },

    applySelectedIds: applySelectedIds,
    applyExpandedIds: applyExpandedIds,
    buildValue: currentValue,
    clearSelection: function (element) {
      clearSelection(element, false);
    }
  };
})();
