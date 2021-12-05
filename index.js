/**
 * @typedef {{ parent: HTMLElement, current: HTMLElement}} FlexNode
 */

window.flexDOM = null;

class FlexDOM {
  /**
   * @type {Object.<string, FlexNode>}
   */
  nodes = {};
  /**
   * @type {HTMLElement|null}
   */
  root = null;

  /**
   * @param {string} rootSelector
   */
  constructor(rootSelector) {
    this.root = document.querySelector(rootSelector);
    this.nodes = {
      ...this.nodes,
      [FlexDOM.key()]: { current: this.root, parent: this.root.parentNode }
    };
  }

  /**
   * Do render for main component
   *
   * @param {function} componentFn
   */
  render(componentFn) {
    const element = componentFn();
    this.add(this.root, element);
  }

  /**
   * Returns FlexNode object
   *
   * @param {string} key
   * @returns {FlexNode}
   */
  get(key) {
    return this.nodes[key];
  }

  /**
   * Append new element to parent
   *
   * @param {HTMLElement} parent
   * @param {HTMLElement} child
   */
  add(parent, child) {
    if (!parent) {
      throw new Error(`Parent doesn't exists`);
    } else if (!child) {
      throw new Error(`Child doesn't exists`);
    }

    parent.appendChild(child);

    this.nodes[child.key] = {
      parent,
      current: child
    };
  }

  /**
   * Replaces existing element to new one
   *
   * @param {string} key
   * @param {HTMLElement} newChild
   */
  replace(key, newChild) {
    const { parent, current } = this.get(key);

    newChild.key = key;
    parent.replaceChild(newChild, current);

    this.nodes[key] = {
      ...this.nodes[key],
      current: newChild,
    };
  }

  /**
   * Generates random hash key
   *
   * @param {number} hashCharCount
   * @returns {string}
   */
  static key(hashCharCount = 10) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-#@';

    let text = '';

    for (let i = 0; i < hashCharCount; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
}

/** Utils **/

/**
 * Creates local state for component and adds ability to subscribe on it
 *
 * @param {any} defaultState
 * @returns {[function, function]}
 */
export const useState = defaultState => {
  let state = defaultState;
  let subs = [];

  /**
   * Subscribe Component function to state updates
   *
   * @param {function} componentFn
   * @param {function} mapStateToProps
   * @param {object} fnProps
   * @returns {HTMLElement}
   */
  const connectToState = (componentFn, mapStateToProps = state => state, fnProps = {}) => {
    const $element = componentFn({ ...fnProps, ...mapStateToProps(state) });

    subs.push([componentFn, mapStateToProps, fnProps, $element.key]);

    return $element;
  };

  /**
   * Change local state and re-render subscribed components
   *
   * @param {any|function} newStateOrFunc
   * @param {boolean} skipRender
   */
  const setState = (newStateOrFunc, skipRender = false) => {
    const newState = typeof newStateOrFunc === 'function'
      ? newStateOrFunc(state)
      : newStateOrFunc;

    if (newState !== state) {
      state = newState;

      // skipRender is used to prevent render when you change state with <input/> or <textarea/> change
      // After adding 'true' as third parameter all subs won't be re-rendered
      if (!skipRender) {
        subs.forEach(([component, mapToProps, props, dataKey]) => {
          window.flexDOM.replace(dataKey, component({ ...props, ...mapToProps(state) }));
        });
      }
    }
  };

  return [setState, connectToState];
};

/**
 * Creates component
 *
 * @param {string} tagName
 * @param {string | array} children
 * @param {object} props
 * @returns {HTMLElement}
 */
export function c(tagName, children = [], props = {}) {
  const $element = document.createElement(tagName);
  $element.key = FlexDOM.key();

  Object.entries(props).forEach(([key, value]) => {
    const propKey = typeof value === 'function' ? key.toLowerCase() : key;
    $element[propKey] = value;
  });

  if (typeof children === 'string') {
    $element.textContent = children;
  } else if (Array.isArray(children)) {
    children.forEach(child => {
      window.flexDOM.add($element, child);
    });
  }

  return $element;
}

/**
 * Creates instance of FlexDOM and renders top-level component
 *
 * @param {string} rootSelector
 * @param {function} componentFn
 */
export function app(rootSelector, componentFn) {
  window.flexDOM = new FlexDOM(rootSelector);
  window.flexDOM.render(componentFn);
}
