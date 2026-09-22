(function () {
  "use strict";

  function indexTree(tree, index) {
    (tree || []).forEach(function (node) {
      index.set(node.id, node);
      if (node.children && node.children.length > 0) {
        indexTree(node.children, index);
      }
    });
  }

  function isLeaf(node) {
    return !node.children || node.children.length === 0;
  }

  function directCheckbox(nodeElement) {
    if (!nodeElement) {
      return null;
    }
    const row = Array.from(nodeElement.children).find(function (child) {
      return child.classList.contains("shiny-hierarchy-row");
    });
    return row
      ? row.querySelector(".shiny-hierarchy-checkbox")
      : null;
  }

  function getCheckboxState(checkbox) {
    if (!checkbox) {
      return "unchecked";
    }
    if (checkbox.indeterminate) {
      return "indeterminate";
    }
    if (checkbox.checked) {
      return "checked";
    }
    return "unchecked";
  }

  function collectLeaves(tree, leaves) {
    (tree || []).forEach(function (node) {
      if (isLeaf(node)) {
        leaves.push(node);
      } else {
        collectLeaves(node.children, leaves);
      }
    });
  }

  function computeRollup(tree, container, index) {
    const rollup = [];

    function walk(node) {
      const el = container.querySelector(
        '.shiny-hierarchy-node[data-node-id="' + CSS.escape(node.id) + '"]'
      );
      const checkbox = directCheckbox(el);
      const state = getCheckboxState(checkbox);

      if (state === "checked") {
        rollup.push(nodeMeta(node, index));
        return;
      }

      if (state === "indeterminate" && node.children) {
        node.children.forEach(walk);
      }
    }

    (tree || []).forEach(walk);
    return rollup;
  }

  function nodeMeta(node, index) {
    const full = index.get(node.id) || node;
    return {
      id: full.id,
      level: full.level,
      levelName: full.levelName,
      levelIndex: full.levelIndex,
      value: full.value,
      valueType: full.valueType,
      label: full.label,
      parentId: full.parentId,
      path: full.path
    };
  }

  function buildResolved(tree, container, index, state) {
    const resolved = [];
    const leaves = [];
    collectLeaves(tree, leaves);

    leaves.forEach(function (leaf) {
      const el = container.querySelector(
        '.shiny-hierarchy-node[data-node-id="' + CSS.escape(leaf.id) + '"]'
      );
      const checkbox = directCheckbox(el);

      if (!checkbox || !checkbox.checked) {
        return;
      }

      const meta = nodeMeta(leaf, index);
      const selectedBy = state.selected.has(leaf.id)
        ? "explicit"
        : "cascade";
      let sourceId = selectedBy === "explicit" ? leaf.id : null;

      if (!sourceId && meta.path && meta.path.length > 0) {
        for (let i = meta.path.length - 2; i >= 0; i--) {
          if (state.selected.has(meta.path[i].id)) {
            sourceId = meta.path[i].id;
            break;
          }
        }
      }

      resolved.push(
        Object.assign({}, meta, {
          selectedBy: selectedBy,
          sourceId: sourceId || null
        })
      );
    });

    return resolved;
  }

  function buildExplicitList(state, index) {
    const list = [];
    const pushRule = function (id, action) {
      const node = index.get(id);
      if (!node) {
        return;
      }
      list.push(
        Object.assign({}, nodeMeta(node, index), {
          action: action
        })
      );
    };

    state.selected.forEach(function (id) {
      pushRule(id, "selected");
    });
    state.excluded.forEach(function (id) {
      pushRule(id, "excluded");
    });

    return list;
  }

  function buildSummary(tree, container, index) {
    const leaves = [];
    collectLeaves(tree, leaves);
    let selectedLeaves = 0;

    leaves.forEach(function (leaf) {
      const el = container.querySelector(
        '.shiny-hierarchy-node[data-node-id="' + CSS.escape(leaf.id) + '"]'
      );
      const checkbox = directCheckbox(el);
      if (checkbox && checkbox.checked) {
        selectedLeaves += 1;
      }
    });

    const rootNodes = tree || [];
    let allSelected = rootNodes.length > 0;

    rootNodes.forEach(function (node) {
      const el = container.querySelector(
        '.shiny-hierarchy-node[data-node-id="' + CSS.escape(node.id) + '"]'
      );
      const checkbox = directCheckbox(el);
      if (getCheckboxState(checkbox) !== "checked") {
        allSelected = false;
      }
    });

    return {
      totalLeaves: leaves.length,
      selectedLeaves: selectedLeaves,
      allSelected: allSelected
    };
  }

  window.shinyHierarchyModel = {
    indexTree: indexTree,

    createState: function () {
      return {
        selected: new Set(),
        excluded: new Set(),
        lastExplicit: null
      };
    },

    recordExplicit: function (state, nodeId, action, index) {
      const node = index.get(nodeId);
      if (!node) {
        return;
      }

      state.lastExplicit = Object.assign({}, nodeMeta(node, index), {
        action: action,
        cascade: "descendants"
      });

      if (action === "selected") {
        state.selected.add(nodeId);
        state.excluded.delete(nodeId);
      } else {
        state.excluded.add(nodeId);
        state.selected.delete(nodeId);
      }
    },

    buildValue: function (element, tree, levels, state) {
      const container = element.querySelector(".shiny-hierarchy-tree");
      const index = new Map();
      indexTree(tree, index);

      const resolved = buildResolved(tree, container, index, state);

      return {
        schema_version: 1,
        levels: levels,
        explicit: buildExplicitList(state, index),
        lastExplicit: state.lastExplicit,
        resolved: resolved,
        rollup: computeRollup(tree, container, index),
        summary: buildSummary(tree, container, index)
      };
    },

    summaryLabel: function (value, placeholder) {
      if (!value || !value.summary) {
        return placeholder;
      }

      const n = value.summary.selectedLeaves;
      if (n === 0) {
        return placeholder;
      }

      if (value.summary.allSelected) {
        return "All";
      }

      return n === 1 ? "1 selected" : n + " selected";
    }
  };
})();
