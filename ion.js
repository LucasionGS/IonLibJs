/**
 * A custom context menu class with clickable functions.
 */
class ContextMenu
{
  static ActionsFormat = 
  [
    {
      /**
       * The display name of the action.
       * @type {(ref: HTMLElement) => string}
       */
      "name": "",

      /**
       * The click event that will happen once the user clicks on the action.  
       * If ``type`` is set to ``menu``, this should be set to an instance of a ContextMenu.
       * @type {(ev: MouseEvent, ref: HTMLElement, btnClicked: HTMLDivElement) => void | ContextMenu}
       */
      "click": function(ev, ref, btnClicked) {},

      /**
       * Set to a function that will have the specific action button parsed as a parameter and you can run an event on it, like modifiying it, before it gets used.
       * @type {(actionBtn: HTMLDivElement) => void}
       */
      "runOnThis": function(actionBtn) {},

      /**
       * The type of action button this is.  
       * If set to ``menu``, then the ``click`` key should be set to an instance of a ContextMenu or an array of objects with relative ContextMenu data.
       * @type {"click" | "checkbox" | "menu"}
       */
      "type": "click",
      
      /**
       * This is only valid if ``type`` is set to``checkbox``.
       * Marks if the checkbox is checked or not by default.
       * @type {boolean}
       */
      "checked": false
    }
  ];

  /**
   * @type {ContextMenu.ActionsFormat}
   */
  actions = [];

  /**
   * Create a new custom context menu.
   * @param {ContextMenu.ActionsFormat} actions The list of available actions. If ``click`` is missing, it will act as a non-clickable label.
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
    menu.style.opacity = 1;

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

    div.ion_menuEntry[checked]{
      /* background-color: lightgreen; */
    }

    div.ion_menuEntry:hover{
      background: #5b5b5b;
      cursor: pointer;
    }

    div.ion_menuEntry.ion_label{
      text-align: center;
    }
    
    div.ion_menuEntry.ion_label:hover{
      background: #1b1b1b;
      cursor: not-allowed;
    }

    div.ion_menuEntry div.checkboxTick{
      width: 18px;
      height: 18px;
      border-radius: 20px;
      background-color: white;
      opacity: 0.75;
      float: right;
    }

    div.ion_menuEntry[checked] div.checkboxTick{
      background-color: lightgreen;
      opacity: 1;
    }
    `;

    this.menu.appendChild(styling);

    var inst = this;
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const div = document.createElement("div");
      div.className = "ion_menuEntry";
      div.innerHTML = action.name;
      
      if (action.type && action.type == "checkbox") {
        if (action.checked) {
          div.toggleAttribute("checked", true);
        }
        const cBox = document.createElement("div");
        cBox.className = "checkboxTick";
  
        div.appendChild(cBox);

        div.title = "\""+action.name+"\" is "+div.hasAttribute("checked")+".";
      }
      else if (action.type && action.type == "menu") {
        const menuIndicator = document.createElement("div");
        menuIndicator.className = "menu_entry";
  
        div.appendChild(menuIndicator);
        if (action.click instanceof ContextMenu) {
          var _cm = action.click;
          
          action.click = function(previous_ev, previous_ref) {
            _cm.show(previous_ref);
          }
        }
        else if (typeof action.click == "object") {
          var _cmData = action.click;
          action.click = function(previous_ev, previous_ref) {
            new ContextMenu(_cmData).show(previous_ref);
          }
          console.log(action.click);
        }
      }

      if (typeof action.click == "function") {
        div.onclick = function(e) {
          action.click(e, inst.reference, e.target);
          if (action.type == "checkbox") {
            div.toggleAttribute("checked");
            div.title = "\""+action.name+"\" is "+div.hasAttribute("checked")+".";
          }
          inst.hide();
        };
      }
      else {
        div.classList.add(["ion_label"]);
        div.style.borderBottomStyle = "solid";
        div.style.borderBottomWidth = "1px";
        div.style.borderBottomColor = "#3b3b3b";

        div.style.borderTopStyle = "solid";
        div.style.borderTopWidth = "1px";
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
    /**
     * @type {this}
     */
    var inst = element.i;
    if (element) {
      this.reference = element;
    }
    else {
      this.reference = undefined;
    }
    // if (this.displayAt == "cursor") // Enable when other types are supported >_>
    {
      this.menu.style.opacity = 1;
      document.body.appendChild(this.menu);
      this.menu.style.left = (ContextMenu.cursorPos.x-8).toString()+"px";
      this.menu.style.top = (ContextMenu.cursorPos.y-8).toString()+"px";
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
 * Popup Notification with customizable content.
 */
class Popup {
  // Transition time
  deltaMoveTime = 300;
  /**
   * Create a new Popup.
   * @param {string} title The header of the popup.
   * @param {string | any[]} message A longer message inside of the popup. This can be plain text or an array of mixed strings and HTML objects.
   * @param {number} dieAfter Automatically closes the popup after ``dieAfter`` milliseconds.
   */
  constructor(title, message, dieAfter)
  {
    if (document.querySelector("#PopupStylingObject") == null) {
      // console.log("Styling not made, adding default.");
      Popup.addStyle();
    }
    // Variable check
    if (!message) {
      message = "";
    }

    // Object creation
    /**
     * Object of the notification.
     */
    var mainDiv = document.createElement("div");
    /**
     * Title object
     */
    var h1 = document.createElement("h1");
    /**
     * Description object
     */
    var p = document.createElement("p");
    var button = document.createElement("a");
    /**
     * Button object
     */
    var button_div = document.createElement("div");
    var button_div_p = document.createElement("p");
    var button_divExit = document.createElement("div");
    var button_divExit_p = document.createElement("p");
    // Settings
    mainDiv.setAttribute("class","_notification");
    h1.innerHTML = title;

    // Use of text or object[]?
    if (typeof message == "string" || typeof message == "number") {
      p.innerHTML = message;
    }
    else if (typeof message == "object") {
      p.innerHTML = "";
      for (var i = 0; i < message.length; i++) {
        if (typeof message[i] == "string" || typeof message[i] == "number") {
          if (message.length > 1 && (typeof message[i-1] == "string" || typeof message[i-1] == "number")) {
            p.innerHTML += "<br>"+message[i];
          }
          else {
            p.innerHTML += message[i];
          }
        }
        else if (typeof message[i] == "object") {
          p.appendChild(message[i]);
        }
      }
    }

    p.setAttribute("class", "notifText");
    button_div.onclick = function () {
      mainDiv.close();
    }
    button_divExit.onclick = function () {
      mainDiv.close();
    }
    button_div.setAttribute("class", "_notificationButton");
    button_div.setAttribute("id", "_doneNotificationButton");
    button_div_p.innerHTML = "Done";

    button_divExit.setAttribute("class", "_notificationExitButton");
    button_divExit.setAttribute("id", "_notificationExitButton");
    button_divExit_p.innerHTML = "X";

    button_div.setText = function (text) {
      button_div_p.innerHTML = text;
    }

    // Merging
    mainDiv.appendChild(h1);
    mainDiv.appendChild(p);
    button_divExit.appendChild(button_divExit_p);
    mainDiv.appendChild(button_divExit);
    // Add a button if dieAfter time hasn't been set. Button will close the notification
    if (!dieAfter) {
      button_div.appendChild(button_div_p);
      button.appendChild(button_div);
      mainDiv.appendChild(button);
    }

    // Finalizing
    document.getElementsByTagName("body")[0].appendChild(mainDiv);
    setTimeout(function () {
      mainDiv.setAttribute("action", "open");
    }, 0);
    if (dieAfter > 0) {
      setTimeout(function () {
        mainDiv.close();
      }, dieAfter);
    }

    mainDiv.instance = this;
    mainDiv.close = function () {
      Popup.closeByObject(this);
    }

    // Return the object
    this.object = mainDiv;
    this.titleObject = h1;
    this.descriptionObject = p;
    this.buttonObject = button_div;
    this.exitObject = button_divExit;
  }

  // Random method to return a random integer from min to max
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }

  // Extra Initialize function for those who expect it instead of addStyle
  static Initialize = Popup.addStyle;

  static StyleOptions = {
    /**
     * The color theme the popups will have.
     * @type { "light" | "dark" }
     */
    "theme": "light",
    /**
     * Distance from the top of the screen.
     * Can be CSS style string or an integer for pixels.  
     * You can use an alternate top style by setting this to `"fullTop"`
     * @type { number | "fullTop" }
     */
    "top": "",
    /**
     * Transition animation.
     * @type {"ease-in-out" | "ease-out" | "ease-in"}
     */
    "transition": "ease-out",
    /**
     * Milliseconds for the popups to transition. (Appear and disappear)
     * @type { number }
     */
    "transitionTime": 300,
    /**
     * A number between 0 and 1 to determined it's transparency/opacity.
     * @type { number }
     */
    "opacity": 1,
  };

  /**
   * Adds styling to the document so the notification can be used.  
   * If it is not initialized before use, it will use default settings.
   * @param {Popup.StyleOptions} options 
   */
  static addStyle(options = {}) {
    // Default style settings
    const dVars = {
      top: "5%",
      minWidth: "512px",
      maxWidth: "768px",
      minHeight: "128px",
      textColor: "black",
      backgroundColor: "white",
      transition: "ease-out",
      borderRadius: "10px",
      opacity: "1"
    };
    this.deltaMoveTime = 300;
    // Filter options
    if (typeof options == "object") {
      // Themes
      if (options.theme) {
        if (options.theme == "dark") {
          dVars.backgroundColor = "rgb(45, 45, 45)";
          dVars.textColor = "white";
        }
      }

      // Height the notification box goes down
      if (options.top) {
        if (options.top == "fullTop") {
          dVars.top = "0px";
          dVars.minWidth = "100%";
          dVars.maxWidth = "100%";
          dVars.borderRadius = "0 0 10px 10px";
        }
        else if (options.top.match(/(\d+)%/g)) {
          dVars.top = options.top.match(/(\d+)%/g)[0];
        }
        else if (options.top.match(/(\d+)/g)) {
          dVars.top = options.top.match(/(\d+)/g)[0]+"px";
        }
      }

      // Transition animation
      if (options.transition) {
        if (options.transition.replace(/([\-\s]+)/g, "") == "easeinout") {
        dVars.transition = "ease-in-out";
        }
        else if (options.transition.replace(/([\-\s]+)/g, "") == "easein") {
          dVars.transition = "ease-in";
        }
        else if (options.transition.replace(/([\-\s]+)/g, "") == "easeout") {
          dVars.transition = "ease-out";
        }
      }

      // Transition time
      if (options.transitionTime) {
        if (typeof options.transitionTime == "number") {
          this.deltaMoveTime = options.transitionTime;
        }
      }

      if(options.opacity) {
        if (typeof options.opacity == "number") {
          dVars.opacity = options.opacity;
        }
      }
    }

    // Create style object
    const style = document.createElement("style");
    style.setAttribute("id", "PopupStylingObject");
    style.innerHTML = `
      div._notification{
        position: fixed;
        left: 50%;
        top: 0;
        transform:translate(-50%, -100%);
        min-width: ${dVars.minWidth};
        max-width: ${dVars.maxWidth};
        min-height: ${dVars.minHeight};
        margin: auto;
        background: ${dVars.backgroundColor};
        border-radius: ${dVars.borderRadius};
        box-shadow: 3px 3px 5px black;
        transition: all ${this.deltaMoveTime/1000}s ${dVars.transition};
        opacity: ${dVars.opacity}
      }
      div._notification h1, div._notification p{
        color: ${dVars.textColor};
        text-align: center;

      }
      div._notification p.notifText{
        padding: 5px;
        padding-bottom: 36px;
        white-space: pre-wrap;

      }
      div._notification[action="open"]{
        left: 50%;
        top: ${dVars.top};
        transform:translateX(-50%);

      }
      div._notification[action="close"]{
        left: 50%;
        top: -32px;
        transform: translate(-50%,-100%);

      }
      div._notificationButton{
        position: absolute;
        right: 0;
        width: 128px;
        height: 40px;
        transform: translateY(-100%);
        background: #259f00;
        border-radius: 10px;
        overflow: hidden;
        transition: all 0.1s ease-in-out;
      }

      div._notificationExitButton{
        position: absolute;
        font-size: 28px;
        top: 0;
        right: 0;
        width: 32px;
        height: 32px;
        background: red;
        border-radius: 10px;
        overflow: hidden;
        transition: all 0.1s ease-in-out;
      }

      div._notificationExitButton p{
        margin: 0;
        padding: 0;
      }
      div._notificationButton:hover, div._notificationExitButton:hover{
        cursor: pointer;
      }
      div._notificationButton p{
        user-select: none;
        margin: 0;
        text-align: center;
        color: white;
        width: 100%;
        transform: translateY(50%);

      }
    `;
    document.getElementsByTagName("html")[0].firstChild.appendChild(style);
  }

  makeUntouchable()
  {
    this.object.style.pointerEvents = "none";
  }

  /**
   * Assign the button new text.  
   * @param {string | false} text
   */
  setButtonText(text) {
    if (text == false) {
      this.buttonObject.querySelector("p").innerText = "";
      this.buttonObject.style.display = "none";
    }
    else {
      this.buttonObject.querySelector("p").innerText = text;
      this.buttonObject.style.display = "default";
    }
  }

  /**
   * Set to true if you want the button to show, and false if you want it to disappear.
   * @param {boolean} force 
   */
  toggleExitButton(force = undefined) {
    if (force != undefined && typeof force == "boolean") {
      this.exitObject.hidden = !force;
    }
    else {
      this.exitObject.hidden = !this.exitObject.hidden;
    }
  }

  /**
   * Close current object
   */
  close()
  {
    this.makeUntouchable();
    Popup.closeByObject(this.object);
  }

  /**
   * Close the top-most open notification.
   */
  static closeNewest()
  {
    var id = document.querySelectorAll("._notification[action='open']").length-1;
    document.getElementsByClassName("_notification")[id].instance.makeUntouchable();
    document.getElementsByClassName("_notification")[id].setAttribute("action", "close");
    setTimeout(function () {
      document.getElementsByClassName("_notification")[id]
      .parentNode.removeChild(
        document.getElementsByClassName("_notification")[id]
        );
      }, this.deltaMoveTime);
  }

  /**
   * Close a notification by ID.
   * @param {number} id The ID of the visible notification objects.
   */
  static closeById(id)
  {
    if (typeof id != "number") {
      throw "No valid id was provided.";
      // id = document.getElementsByClassName("_notification").length-1;
    }
    document.getElementsByClassName("_notification")[id].instance.makeUntouchable();;
    document.getElementsByClassName("_notification")[id].setAttribute("action", "close");
    setTimeout(function () {
      document.getElementsByClassName("_notification")[id]
      .parentNode.removeChild(
        document.getElementsByClassName("_notification")[id]
      );
    }, this.deltaMoveTime);
  }

  /**
   * Close a notification by it's specific object.
   * @param {HTMLElement} element The HTML element to close.
   */
  static closeByObject(element)
  {
    element.setAttribute("action", "close");
    setTimeout(function () {
      try {
        element.parentNode.removeChild(element);
      }
      catch (e) {}
    }, this.deltaMoveTime);
    element.instance.makeUntouchable();
  }
}

class Parse {
  /**
   * Parses a string into an array of arguments. Separates by space and quotes.
   * @param {string} argumentString String to parse into arguments.
   * @param {Parse.ArgumentsOptParameters} opts Options for parsing.
   */
  static arguments(argumentString, opts = {}) {
    // Fixing missing arguments.
    for (const key in Parse.ArgumentsOptParameters) {
      if (Parse.ArgumentsOptParameters.hasOwnProperty(key)) {
        const value = Parse.ArgumentsOptParameters[key];
        if (!opts.hasOwnProperty(key)) {
          opts[key] = value;
        }
      }
    }

    // Actual parsing
    if (opts.autoTrim) {
      argumentString = argumentString.trim();
    }

    var args = [];
    var arg = "";
    var inQuote = false;
    for (let i = 0; i < argumentString.length; i++) {
      const l = argumentString[i];
      if (opts.allowQuotes && l == "\"" && arg == "") {
        inQuote = true;
        // console.log("Start of arg by quote");
        continue;
      }
      else if (opts.allowQuotes && l == "\"" && arg != "") {
        inQuote = false;
        args.push(arg);
        arg = "";
        // console.log("End of arg by quote");
        
        continue;
      }
      else if (opts.allowQuotes && !inQuote && l == opts.separator && arg != "") {
        args.push(arg);
        arg = "";
        // console.log("End of arg by space");
        
        continue;
      }
      else if (opts.allowQuotes && !inQuote && l == opts.separator && arg == "") {
        // console.log("Skip space");
        continue;
      }
      else {
        arg += l;
        // console.log(arg+" <= "+l);
      }
    }

    return args;
  }

  static ArgumentsOptParameters = {
    /**
     * Allowing quotes to be used to capture spaces inside of arguments.  
     * `Default: true`
     */
    allowQuotes: true,
    /**
     * Separator to separate each argument by.  
     * `Default: " "`
     */
    separator: " ",
    /**
     * Automatically trim the argument string down for whitespaces in the start and end.  
     * `Default: true`
     */
    autoTrim: true,
  };
}

class HTMLObjects {
  static swapPlacement(element1, element2) {
    var elm1Sib = element1.nextSibling;
    element1.parentNode.insertBefore(element1, element2);
    element2.parentNode.insertBefore(element2, elm1Sib);
  }
}

class TextSuggest {
  /**
   * @param {HTMLInputElement} inputElement 
   * @param {string[]} suggestions 
   */
  constructor(inputElement, suggestions = []) {
    this.inputElement = inputElement;
    /**
     * @type {string[]}
     */
    this.suggestions = suggestions;
    this.suggestionBox = document.createElement("div");

    /**
     * @param {boolean} toggle
     */
    this.visible = function(toggle = null) {
      if (toggle != null && typeof toggle == "boolean") {
        if (toggle == true) {
          this.suggestionBox.style.display == "block";
        }
        else {
          this.suggestionBox.style.display == "none";
        }
        
        return toggle;
      }

      if (this.suggestionBox.style.display == "none") {
        return false;
      }
      else {
        return true;
      }
    }

    let obj = this;

    var iEBox = inputElement.getBoundingClientRect();
    this.suggestionBox.style.position = "absolute";
    this.suggestionBox.style.left = iEBox.left+"px";
    this.suggestionBox.style.top = iEBox.bottom+"px";
    this.suggestionBox.style.width = iEBox.right - iEBox.left+"px";
    // this.suggestionBox.style.minHeight = iEBox.bottom - iEBox.top+"px";
    this.suggestionBox.style.backgroundColor = "#1b1b1b";
    this.suggestionBox.style.color = "white";
    this.suggestionBox.className = "suggestionBox";
    this.suggestionBox.style.fontSize = this.inputElement.style.fontSize;

    document.body.appendChild((function() {
      let s = document.createElement("style");
      s.innerHTML = `
        div.suggestionBox div[selected] {
          background-color: #6b6b6b;
        }
      `;
      return s;
    })());
    document.body.appendChild(this.suggestionBox);


    inputElement.addEventListener("keydown", function(e) {
      let key = e.key;
      if (obj.visible()) {
        console.log();
        
        if (key == "ArrowUp") {
          e.preventDefault();
          /**
           * @type {HTMLDivElement}
           */
          let childElm = obj.suggestionBox.querySelector("[selected]");
          if (childElm == null) {
            childElm = obj.suggestionBox.lastChild;
            if (!childElm) {
              return;
            }
            childElm.toggleAttribute("selected", true);
            return;
          }
          childElm.toggleAttribute("selected", false);
          if (childElm.previousSibling) {
            childElm.previousSibling.toggleAttribute("selected", true);
          }
          else {
            obj.suggestionBox.lastElementChild.toggleAttribute("selected", true);
          }
        }
        if (key == "ArrowDown") {
          e.preventDefault();
          /**
           * @type {HTMLDivElement}
           */
          let childElm = obj.suggestionBox.querySelector("[selected]");
          if (childElm == null) {
            childElm = obj.suggestionBox.firstChild;
            if (!childElm) {
              return;
            }
            childElm.toggleAttribute("selected", true);
            return;
          }
          childElm.toggleAttribute("selected", false);
          if (childElm.nextSibling) {
            childElm.nextSibling.toggleAttribute("selected", true);
          }
          else {
            obj.suggestionBox.firstElementChild.toggleAttribute("selected", true);
          }
        }
        if (key == "Enter" || key == "Tab") {
          
          /**
           * @type {HTMLDivElement}
           */
          let childElm;
          childElm = obj.suggestionBox.querySelector("[selected]");
          if (childElm == null) {
            childElm = obj.suggestionBox.firstElementChild;
          }
          
          if (!childElm) return;

          let w = obj.getCurrentWords(childElm.innerText.split(" ").length);

          if (w == null || w.word == "") return;

          e.preventDefault();
          obj.replaceAt("", w.start, w.end);
          let newWord = childElm.innerText;
          obj.insertAt(newWord, w.start, newWord.length);
        }
      }

      if (
        key != "ArrowUp"
        && key != "ArrowDown"
        && key != "ArrowLeft"
        && key != "ArrowRight"
        && key != "Escape"
        ) {
        setTimeout(() => {
          obj.suggest();
        }, 0);
      }
    });
  }

  suggest(maxWordCount = this.inputElement.value.split(" ").length) {
    let wordCount = maxWordCount;
    this.suggestionBox.innerHTML = "";
    let count = 0;
    let word = this.getCurrentWords(wordCount);
    let suggested = [];
    
    for (let i = 0; i < this.suggestions.length; i++) {
      wordCount = maxWordCount;
      const sgtn = this.suggestions[i];
      do {
        word = this.getCurrentWords(wordCount--);
        
        if (word == null) {
          continue;
        }
        if (
          sgtn.split(" ").length == word.word.split(" ").length
          && sgtn.toLowerCase().trim().startsWith(word.word.toLowerCase().trim())
          && sgtn != word.word
          && !suggested.includes(sgtn)) {
          const div = document.createElement("div");
          div.innerText = sgtn;
          let cur = this;
          div.onclick = function() {
            cur.replaceAt(sgtn, word.start, word.end);
            cur.suggestionBox.innerHTML= "";
            cur.visible(false);
          };
    
          this.suggestionBox.appendChild(div);
          suggested.push(sgtn);
          // Something to do with suggestions?
          count++;
        }
      }
      while(wordCount > 0);
    }
    if (count > 0) {
      this.visible(true);
      this.suggestionBox.firstElementChild.toggleAttribute("selected", true);
    }
    else {
      // if (word.start > 0) {
      //   this.suggest(wordCount + 1);
      //   return;
      // }
      this.visible(false);
    }
  }

  addSuggestionsSplitBySpaces() {
    let newList = [];
    for (let i = 0; i < this.suggestions.length; i++) {
      const sug = this.suggestions[i];
      let words = sug.split(" ");
      for (let i2 = 0; i2 < words.length; i2++) {
        const word = words[i2];
        if (!newList.includes(word)) newList.push(word);
      }
      if (!newList.includes(sug)) newList.push(sug);
    }

    this.suggestions = newList;
  }

  /**
   * @param {string} text 
   * @param {number} pos 
   * @param {number} startPlus 
   * @param {number} endPlus 
   */
  insertAt(text, pos, startPlus = 0, endPlus = startPlus) {
    let curStart = this.inputElement.selectionStart;
    let curEnd = this.inputElement.selectionEnd;
    let str = this.inputElement.value;
    let part1 = str.substring(0, pos);
    let part2 = str.substring(pos);
    this.inputElement.value = part1 + text + part2;
    setTimeout(() => {
      this.inputElement.setSelectionRange(curStart + startPlus, curEnd + endPlus)
    }, 0);
  }

  /**
   * @param {string} txt
   * @param {number} start
   * @param {number} end
   */
  replaceAt(txt, start, end = start) {
    
    this.inputElement.focus();
    let text = this.inputElement.value;
    // let oldStart = this.inputElement.selectionStart;
    // let oldEnd = this.inputElement.selectionEnd;
    // while(oldStart > start) {
    //   oldStart--;
    //   oldEnd--;
    // }
    let chars = text.split("");
    chars.splice(start, end - start);
    
    let newStr = "";
    for (let i = 0; i < chars.length; i++) {
      newStr += chars[i];
    }

    let part1 = newStr.substring(0, start);
    let part2 = newStr.substring(start);
    
    newStr = part1 + txt + part2;

    this.inputElement.value = newStr;

    this.inputElement.setSelectionRange((part1 + txt).length, (part1 + txt).length);
  }

  getCurrentWords(wordCount = 1) {
    let str = this.inputElement.value;
    let start = 0, end = start = this.inputElement.selectionEnd;
    let wordsFound = 0;
    while(start > -1) {
      if (str[--start] == " ") {
        wordsFound++;
      }

      if (str[start] == " " && wordsFound >= wordCount) {
        break;
      }
    };
    start++;
    
    if (start >= end ) {
      return null;
    }
    
    return {
      "word": str.substring(start, end),
      "start": start,
      "end": end
    };
  }
}

class Web {
  /**
   * Get a parameter's value from a GET request.
   * @param {string} param The parameter's name to get.
   */
  static getGETParameter(param) {
    var result = null,
        tmp = [];
    location.search
    .substr(1)
    .split("&")
    .forEach(function (item) {
      tmp = item.split("=");
      if (tmp[0] === param) {
        result = decodeURIComponent(tmp[1]);
      }
    });
    return result;
  }
}

//#region Unfinished

class Select {
  static SelectFormat = [
    {
      /**
       * The displayed text on the select option.  
       * If ``text`` is not set, it will be the same as ``value.toString()``.
       */
      "text": false,
      /**
       * The value that will be set when clicked on.  
       * ``REQUIRED``
       * @type {any}
       */
      "value": "",
      /**
       * An event that will be called when this option has been selected.
       * @type {(info: {event: MouseEvent, index: Number, text: string, value: any}) => void}
       */
      "click": false
    }
  ];

  static OptionsFormat = {
    /**
     * Defines if this object is multiple choice or not. ``false`` keeps it a single select.
     * @type {boolean}
     */
    "multi": false,
    /**
     * CSS width value.
     */
    "width": "100%"
  };

  /**
   * 
   * @param {Select.SelectFormat} selectableOptions Array of objects with settings for each selectable option.
   * @param {Select.OptionsFormat} opts Options for this object.
   */
  constructor(selectableOptions, opts = {}) {
    // If styling hasnt been set...
    if (!document.querySelector("style#ION_SELECTABLESTYLING")) {
      const style = document.createElement("style");
      style.id = "ION_SELECTABLESTYLING";
      style.innerHTML =
`div.ion_select{
  border-style: solid;
  border-width: 1px;
}
div.ion_selectOption{
  border-style: solid;
  border-width: 1px;
}
`;
      document.body.appendChild(style);
    }

    const div = document.createElement("div");
    div.i = this;
    this.div = div;
    this.options = selectableOptions;
    this.value = undefined;
    div.classList.add([
      "ion_select"
    ])

    // Width
    if (typeof opts.width == "string") {
      div.style.width = opts.width;
    }
    else {
      div.style.width = Select.OptionsFormat.width;
    }

    // Type
    if (typeof opts.multi == "boolean") {
      this.multi = opts.multi;
    }
    else {
      this.multi = Select.OptionsFormat.multi;
    }

    this.build();
  }

  /**
   * Add an option to this object.
   * @param {Select.SelectFormat[0]} option 
   */
  addOption(option) {
    this.options.push(option);
  }

  /**
   * Build or rebuild the object using the current ``Select.options``
   */
  build() {
    this.div.innerHTML = "";
    const opts = this.options;
    for (let i = 0; i < opts.length; i++) {
      const opt = opts[i];
      if (typeof opt.value == "undefined") {
        console.error("Could not create option at index "+i+" as it is missing a value.", opt);
        continue;
      }
      if (opt.text == false) {
        opt.text = opt.value;
      }

      const obj = document.createElement("div");

      obj.style.height = "32px";
      obj.style.width = "95%";
      obj.style.marginLeft = "2.5%";

      obj.innerText = opt.text;
      obj.classList.add([
        "ion_selectOption"
      ])

      this.div.appendChild(obj);
    }
  }
}

/**
 * WORK IN PROGRESS  
 * Extra JSON functions to modify and use JSON objects.
 */
class EJSON {
  /**
   * Sort a JSON Object alphabetically.
   * @param {[{}]} json The JSON Object to sort.
   * @param {string} sortValue The variable inside the JSON Object to sort by.
   */
  static sort(json, sortValue) {
    json.sort((a, b) => {
      a = a[sortValue].toLowerCase();
      b = b[sortValue].toLowerCase();
    
      return (a < b) ? -1 : (a > b) ? 1 : 0;
    });
    return json;
  }
}

/**
 * WORK IN PROGRESS  
 * Item List
 */
class ItemList {
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

class Path {
  /**
   * Returns the basename of a path.
   * @param {string} path Path to a file/folder.
   */
  static basename(path){
    path = path.replace(/\\/g, "/");
    return path.split("/").pop();
  }

  /**
   * Returns the basename of a path.
   * @param {string} path Path to a file/folder.
   */
  static getPath(path) {
    path = path.replace(/\\/g, "/");
    var pathParts = path.split("/");
    pathParts.pop();
    return pathParts.join("/");
  }
}

//#endregion

// Exports
try {
  exports.ContextMenu = ContextMenu;
  exports.Popup = Popup;
  exports.Parse = Parse;
  exports.Select = Select;
  exports.TextSuggest = TextSuggest;
  exports.EJSON = EJSON;
  exports.HTMLObjects = HTMLObjects;
  exports.Path = Path;
  exports.Web = Web;
} catch {}