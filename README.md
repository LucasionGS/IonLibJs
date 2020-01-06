# IonLib (Javascript)
IonLib is a collection of code that I use in my own software or websites to make my life easier. And so can you.

**Key features**
- Custom Context Menus

Yes that was a short list, but this is in constant development and more features will be added.  
I might add my [Notification library](https://github.com/LucasionGS/notif) into this.

# ContextMenu

To get started, assign a `ContextMenu` class to a variable to use for later.
```js
var cm = new ContextMenu(actions);
```
The `actions` variable parsed through the constructor is required to follow this object format:
```js
// An array of objects
[
  // Each object will act as a button which can have a unique action each.
  {
    // Required
    // The name is the displayed text on the button.
    name: "Button name",

    /** Optional
     * The click event that will happen once the user clicks on the action.
     * If this option is left out, the button will only display the button's name (text) as a label and will have no clickable feature.
     * 
     * ev: MouseEvent - ev is the MouseEvent that occurred when the button was clicked. (Unless it is activated manually by ContextMenu.show())
     * ref: HTMLElement - ref is the object that was clicked. (Unless it is activated manually by ContextMenu.show(), BUT can have an object parsed through instead as a parameter.)
     * btnClicked: HTMLDivElement - btnClicked is the button in the Context Menu that was clicked. (again, unless it is activated manually by ContextMenu.show())
     */
    click: (ev, ref, btnClicked) => { },

    /** Optional
     * Set to a function that will have the specific action button parsed as a parameter and you can run an event on it, like modifiying it, before it gets used.
     * actionBtn: HTMLDivElement - The button that is run on.
     */
    runOnThis: (actionBtn) => { },

    /**
     * The type of action button this is.
     * type can be one of the following:
     * // click is the default behavior and acts as a regular button.
     * "click"
     * 
     * // checkbox is as the name suggests, a checkbox. It is toggled when you click on it, with a white or green circle indicating if it is toggled on or off.
     * "checkbox"
     */
    "type": "click",

    /**
     * This is only valid if type is set to "checkbox".
     * Marks if the checkbox is checked or not by default.
     * @type {boolean}
     */
    "checked": false
  },
  { ... }, { ... } // You can technically add as many buttons or labels as you like.
]
```
Each instance of a `ContextMenu` have a couple of variables and functions to use.

## Instance functions
`show(element)`: The `show` function displays the context menu at the user's cursor. It can accept 1 parameter, an element to have as reference. It is accessible via the instance object as *`instance`*.`reference`.

`hide()`: Literally the opposite of `show`. This hides the context menu if it is visible.

`attachContextMenu(element)`: The `attachContextMenu` function will attach it's instance to the parsed `element` as an `addEventListener` for `contextmenu` (aka right-click).

`reloadActions(actions)`: `reloadActions` will reload all the actions in the `actions` array (Displayed below, not the parsed variable). You'll need to call this whenever you add, remove, or in general change the ``actions`` array. You can leave this function blank with no parameters to just reload the *instance's* `actions` array, or you can parse through a new array of actions which it will use and replace.

## Instance variables
`actions`: An array of all the buttons in this `ContextMenu`.
You can add more buttons to this array, but keep in mind that the buttons display in the order they are in inside the `actions` array.  

`reference`: This updates to the most recent object that was clicked to trigger a `ContextMenu`. It will also update when the *`instance`*.`show(element)` function is called. If no `element` parameter is parsed, `reference` will be `undefined`.