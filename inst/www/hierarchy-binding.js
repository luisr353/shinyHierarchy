(function () {
  "use strict";

  const hierarchyBinding = new Shiny.InputBinding();

  $.extend(hierarchyBinding, {
    find: function (scope) {
      return $(scope).find(".shiny-hierarchy-input");
    },

    getId: function (element) {
      return element.id;
    },

    getType: function () {
      return "shinyHierarchy.value";
    },

    getValue: function (element) {
      if (!window.shinyHierarchy) {
        return null;
      }
      return window.shinyHierarchy.buildValue(element);
    },

    setValue: function (element, value) {
      if (!window.shinyHierarchy) {
        return;
      }

      if (Array.isArray(value)) {
        window.shinyHierarchy.applySelectedIds(element, value);
        return;
      }

      if (value && value.schema_version === 1) {
        const ids = (value.resolved || []).map(function (n) {
          return n.id;
        });
        if (ids.length > 0) {
          window.shinyHierarchy.applySelectedIds(element, ids);
        } else if (value.rollup && value.rollup.length > 0) {
          window.shinyHierarchy.applySelectedIds(
            element,
            value.rollup.map(function (n) {
              return n.id;
            })
          );
        } else {
          window.shinyHierarchy.clearSelection(element);
        }
      }
    },

    subscribe: function (element, callback) {
      element._shinyHierarchyCallback = function () {
        callback(true);
      };
      element.addEventListener(
        "shinyhierarchy:change",
        element._shinyHierarchyCallback
      );
    },

    unsubscribe: function (element) {
      if (element._shinyHierarchyCallback) {
        element.removeEventListener(
          "shinyhierarchy:change",
          element._shinyHierarchyCallback
        );
        delete element._shinyHierarchyCallback;
      }
      if (element._outsideClickHandler) {
        document.removeEventListener("click", element._outsideClickHandler);
        delete element._outsideClickHandler;
      }
    },

    receiveMessage: function (element, data) {
      const config = element._hierarchyConfig || {};

      if (data.tree && window.shinyHierarchy) {
        const opts = {
          levels: data.levels || config.levels || element._hierarchyLevels,
          placeholder: config.placeholder,
          display: config.display,
          search: config.search,
          searchPlaceholder: config.searchPlaceholder,
          selectAll: config.selectAll,
          selectAllLabel: config.selectAllLabel,
          expand: config.expand,
          selected: data.selected,
          expanded: data.expanded
        };
        window.shinyHierarchy.render(element, data.tree, opts);
      } else if (data.selected) {
        window.shinyHierarchy.applySelectedIds(element, data.selected);
      }

      if (data.expanded && window.shinyHierarchy) {
        window.shinyHierarchy.applyExpandedIds(element, data.expanded);
      }

      if (data.clear) {
        window.shinyHierarchy.clearSelection(element);
      }

      if (data.open === true || data.open === false) {
        const panel = element.querySelector(".shiny-hierarchy-panel");
        const trigger = element.querySelector(".shiny-hierarchy-trigger");
        if (panel && trigger) {
          panel.hidden = !data.open;
          trigger.setAttribute("aria-expanded", data.open ? "true" : "false");
        }
      }
    },

    initialize: function (element) {
      const configEl = element.querySelector(".shiny-hierarchy-config");
      const treeEl = element.querySelector(".shiny-hierarchy-tree-data");

      if (!configEl || !treeEl || !window.shinyHierarchy) {
        return;
      }

      const config = JSON.parse(configEl.textContent);
      const tree = JSON.parse(treeEl.textContent);

      element._hierarchyConfig = config;

      window.shinyHierarchy.render(element, tree, {
        levels: config.levels,
        placeholder: config.placeholder,
        display: config.display,
        search: config.search,
        searchPlaceholder: config.searchPlaceholder,
        selectAll: config.selectAll,
        selectAllLabel: config.selectAllLabel,
        expand: config.expand,
        selected: config.selected,
        expanded: config.expanded
      });
    }
  });

  Shiny.inputBindings.register(
    hierarchyBinding,
    "shinyHierarchy.hierarchyInput"
  );
})();
