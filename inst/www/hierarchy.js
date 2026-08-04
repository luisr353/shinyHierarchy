(function (global) {
  "use strict";

  function HierarchyTree(el, options) {
    this.el = el;
    this.choices = options.choices || [];
    this.selected = normalizeSelected(options.selected, options.multiple);
    this.multiple = !!options.multiple;
    this.onChange = options.onChange || function () {};
    this.render();
  }

  function normalizeSelected(selected, multiple) {
    if (selected == null) {
      return multiple ? [] : null;
    }
    if (multiple) {
      return Array.isArray(selected) ? selected.slice() : [selected];
    }
    return Array.isArray(selected) ? selected[0] : selected;
  }

  HierarchyTree.prototype.isSelected = function (id) {
    if (this.multiple) {
      return this.selected.indexOf(id) !== -1;
    }
    return this.selected === id;
  };

  HierarchyTree.prototype.toggle = function (id) {
    if (this.multiple) {
      var idx = this.selected.indexOf(id);
      if (idx === -1) {
        this.selected.push(id);
      } else {
        this.selected.splice(idx, 1);
      }
    } else {
      this.selected = this.selected === id ? null : id;
    }
    this.render();
    this.onChange(this.selected);
  };

  HierarchyTree.prototype.setChoices = function (choices) {
    this.choices = choices || [];
    this.render();
  };

  HierarchyTree.prototype.setSelected = function (selected) {
    this.selected = normalizeSelected(selected, this.multiple);
    this.render();
  };

  HierarchyTree.prototype.renderNode = function (node) {
    var self = this;
    var li = document.createElement("li");
    li.className = "hierarchy-node";

    var row = document.createElement("div");
    row.className = "hierarchy-row" + (this.isSelected(node.id) ? " selected" : "");

    var hasChildren = Array.isArray(node.children) && node.children.length > 0;

    if (hasChildren) {
      var toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "hierarchy-toggle";
      toggle.setAttribute("aria-label", "Expand or collapse");
      toggle.textContent = "▸";
      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        li.classList.toggle("collapsed");
        toggle.textContent = li.classList.contains("collapsed") ? "▸" : "▾";
      });
      toggle.textContent = "▾";
      row.appendChild(toggle);
    } else {
      var spacer = document.createElement("span");
      spacer.className = "hierarchy-spacer";
      row.appendChild(spacer);
    }

    var label = document.createElement("button");
    label.type = "button";
    label.className = "hierarchy-label";
    label.textContent = node.label != null ? node.label : String(node.id);
    label.addEventListener("click", function () {
      self.toggle(node.id);
    });
    row.appendChild(label);
    li.appendChild(row);

    if (hasChildren) {
      var ul = document.createElement("ul");
      ul.className = "hierarchy-children";
      node.children.forEach(function (child) {
        ul.appendChild(self.renderNode(child));
      });
      li.appendChild(ul);
    }

    return li;
  };

  HierarchyTree.prototype.render = function () {
    this.el.innerHTML = "";
    var ul = document.createElement("ul");
    ul.className = "hierarchy-tree";
    var self = this;
    this.choices.forEach(function (node) {
      ul.appendChild(self.renderNode(node));
    });
    this.el.appendChild(ul);
  };

  global.ShinyHierarchy = {
    HierarchyTree: HierarchyTree
  };
})(window);
