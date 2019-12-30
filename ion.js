/**
 * A custom context menu class with clickable functions.
 */
class ContextMenu
{
  /**
   * @type {[{"name": (ref: HTMLElement) => string, "click": (ev: MouseEvent, ref: HTMLElement) => void, runOnThis: (actionBtn: HTMLDivElement) => void}]}
   */
  actions = [];

  /**
   * Create a new custom context menu.
   * @param {[{"name": (ref: HTMLElement) => string, "click": (ev: MouseEvent, ref: HTMLElement) => void, runOnThis: (actionBtn: HTMLDivElement) => void}]} actions The list of available actions. If ``click`` is missing, it will act as a non-clickable label.
   */
  constructor(actions) {
    this.actions = actions;
    const menu = document.createElement("div");
    this.menu = menu;
    menu.i = this;


    if (!ContextMenu.initialized) {
      window.addEventListener("keydown", function(e) {
        if (e.key == "Escape") {
          menu.i.hide();
        }
      }, false);
      window.addEventListener("mousemove", function(e) {
        ContextMenu.cursorPos = {
          x: e.clientX,
          y: e.clientY
        };
      }, false);
    }

    menu.className = "ion_contextMenu";


    menu.addEventListener("mouseover", function(e) {
      menu.toggleAttribute("hovering", true);
    }, false);

    menu.addEventListener("mouseout", function(e) {
      menu.toggleAttribute("hovering", false);
    }, false);

    this.reloadActions(actions);
    this.menu.style.opacity = 1;

    setInterval(() => {
      if (!menu.hasAttribute("hovering")) {
        if (menu.style.opacity != "0") {
          menu.style.opacity = (+menu.style.opacity - 0.008).toString();
        }
        if (+menu.style.opacity <= "0") {
          menu.style.opacity = "0";
          this.hide();
        }
      }
      else {
        if (menu.style.opacity != "1") {
          menu.style.opacity = (+menu.style.opacity + 0.1).toString();
        }
        if (+menu.style.opacity > "1") {
          menu.style.opacity = "1";
        }
      }
    }, 10);
  }

  /**
   * An object reference if it has been set.
   * @type {HTMLElement}
   */
  reference;

  /**
   * If you've changed the ``actions`` variable, you want to run this.
   */
  reloadActions(actions = this.actions) {
    if (this.menu.children.length > 0) {
      this.menu.innerHTML = "";
    }
    var styling = document.createElement("style");
    styling.innerHTML = `
    div.ion_contextMenu{
      position: absolute;
      max-width: 256px;
      background: #1b1b1b;
      color: white;
      border-style: solid;
      border-width: 2px;
      border-color: white;
      z-index: 10000;
    }

    div.ion_menuEntry{
      padding: 4px;
      user-select: none;
    }

    div.ion_menuEntry:hover{
      background: #5b5b5b;
      cursor: pointer;
    }
    
    div.ion_menuEntry.ion_label:hover{
      background: #1b1b1b;
      cursor: not-allowed;
    }
    `;

    this.menu.appendChild(styling);

    var inst = this;
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const div = document.createElement("div");
      div.className = "ion_menuEntry";


      div.innerHTML = action.name;

      if (typeof action.click == "function") {
        div.onclick = function(e) {
          action.click(e, inst.reference);
          inst.hide();
        };
      }
      else {
        div.classList.add(["ion_label"]);
        div.style.borderBottomStyle = "solid";
        div.style.borderBottomWidth = "1px";
        div.style.borderTopStyle = "solid";
        div.style.borderTopWidth = "2px";
      }

      if (typeof action.runOnThis == "function") {
        action.runOnThis(div);
      }

      this.menu.appendChild(div);
    }
  }

  /**
   * This tells whether or not the first ContextMenu has been initialized or not.  
   * Do not modify this manually.
   */
  static initialized = false;

  /**
   * Current position of the cursor.
   */
  static cursorPos = {
    x: 0,
    y: 0,
  }

  /**
   * Where the Context menu should appear when ``show()`` is executed.
   * @type {"cursor" | "element" | "topleft" | [number, number]}
   */
  displayAt = "cursor";

  /**
   * Show the menu
   * @param {HTMLElement} element
   */
  show(element) {
    this.menu.style.display = "block";
    if (element) {
      this.reference = element;
    }
    else {
      this.reference = undefined;
    }

    // if (this.displayAt == "cursor") // Enable when other types are supported >_>
    {
      document.body.appendChild(this.menu);
      this.menu.style.left = ContextMenu.cursorPos.x.toString()+"px";
      this.menu.style.top = ContextMenu.cursorPos.y.toString()+"px";
    }
  }
  
  /**
   * Hide the menu
   */
  hide() {
    try {
      this.menu.parentElement.removeChild(this.menu);
    }
    catch {}
  }

  /**
   * Attach a context menu to an element.  
   * It will add an ``Eventlistener`` for ``contextMenu``
   * @param {HTMLElement} element
   * @param {ContextMenu} contextMenu
   */
  static attachContextMenu(element, contextMenu) {
    element.addEventListener("contextmenu", function(e) {
      e.preventDefault();
      contextMenu.show(element);
    }, false);
    return element;
  }

  /**
   * Attach this context menu to an element.  
   * It will add an ``Eventlistener`` for ``contextMenu``
   * @param {HTMLElement} element
   */
  attachContextMenu(element) {
    return ContextMenu.attachContextMenu(element, this);
  }
}

/**
 * WIP  
 * Item List
 */
class ItemList
{
  /**
   * 
   * @param {ItemList.ListFormat} items 
   */
  constructor(items) {
  }

  /**
   * @type {[{"text": string}]}
   */
  static ListFormat = [
    {
      "text": ""
    }
  ];
}

// Exports
try {
  exports.ContextMenu = ContextMenu;
} catch {}