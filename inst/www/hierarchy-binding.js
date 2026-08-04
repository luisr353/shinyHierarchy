(function () {
  "use strict";

  var hierarchyBinding = new Shiny.InputBinding();

  function parseJSON(value, fallback) {
    if (value == null || value === "") {
      return fallback;
    }
    try {
      return JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  }

  $.extend(hierarchyBinding, {
    find: function (scope) {
      return $(scope).find(".shiny-hierarchy-input");
    },

    initialize: function (el) {
      var container = el.querySelector(".hierarchy-container");
      if (!container) {
        return;
      }

      var choices = parseJSON(container.getAttribute("data-choices"), []);
      var selected = parseJSON(container.getAttribute("data-selected"), null);
      var multiple = container.getAttribute("data-multiple") === "true";

      el._hierarchyTree = new ShinyHierarchy.HierarchyTree(container, {
        choices: choices,
        selected: selected,
        multiple: multiple,
        onChange: function () {
          $(el).trigger("change");
        }
      });
    },

    getValue: function (el) {
      if (!el._hierarchyTree) {
        return null;
      }
      return el._hierarchyTree.selected;
    },

    setValue: function (el, value) {
      if (el._hierarchyTree) {
        el._hierarchyTree.setSelected(value);
      }
    },

    receiveMessage: function (el, data) {
      if (data.label !== undefined) {
        var label = el.querySelector("label.control-label");
        if (label) {
          label.textContent = data.label;
        }
      }

      if (!el._hierarchyTree) {
        return;
      }

      if (data.choices !== undefined) {
        var choices = typeof data.choices === "string"
          ? parseJSON(data.choices, [])
          : data.choices;
        el._hierarchyTree.setChoices(choices);
      }

      if (data.selected !== undefined) {
        var selected = typeof data.selected === "string"
          ? parseJSON(data.selected, null)
          : data.selected;
        el._hierarchyTree.setSelected(selected);
      }

      $(el).trigger("change");
    },

    subscribe: function (el, callback) {
      $(el).on("change.hierarchyBinding", function () {
        callback(true);
      });
    },

    unsubscribe: function (el) {
      $(el).off(".hierarchyBinding");
    }
  });

  Shiny.inputBindings.register(hierarchyBinding, "shinyHierarchy.hierarchyInput");
})();
