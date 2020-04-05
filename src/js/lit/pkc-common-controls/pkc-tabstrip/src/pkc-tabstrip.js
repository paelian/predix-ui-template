//  Control:      pkc-tabstrip
//  Description:  A tabstrip, usable either as a navigation tool (default mode) or a replaceable content control (requires a bit of setup)
//
//  Usage:
//
//    1. Navigation
//      - ensure the following CSS is set up (or unset):
//          --pkc-tabstrip-height unset (defaults to --pkc-tabstrip-header-height)
//          --pkc-tabstrip-border unset (defaults to 0 width)
//      - bind a listener to tabSelected; you are responsible for handling the event as required
//
//    2. Replaceable content
//      - ensure the following CSS is set up:
//          --pkc-tabstrip-height set to some height. This will give left-over size to the replaceable content container
//          --pkc-tabstrip-border set to some width (i.e. 1px solid #ccc). This will visually indicate the size of the control.
//      - bind a listener to tabSelected and retrieve your content
//      - sample jquery to replace content like so (adapt your own technique):
//          $('pkc-tabstrip#tester').html('<div style="color:green">hi there world</div>')


// Import LitElement base class and html helper function
import { LitElement, html } from 'lit-element';
import { Icon } from '@material/mwc-icon';
import { DomHelperMixin } from '../../../pkc-common/src/domHelperMixin';

export class PkcTabstrip extends DomHelperMixin(LitElement) {
  /**
   * Define properties. Properties defined here will be automatically 
   * observed.
   */
  static get properties() {
    return {
      // width: {
      //   type: Number
      //   // hasChanged: function (value, oldValue) { console.log('width hasChanged called'); return false; } //<-- looks like all props are observed (cause render() to fire on change) by default
      //   //      add hasChanged and return false to force no-render-update??
      // },
      tabs: {
        type: Array
      },
      events: {
        type: Array
      }
    };
  }

  constructor() {
    super();

    // Initialize properties
    this.styleTag = this._defaultStyle();
    this.tabs = [{ id: 1, label: 'the quick brown fox', icon: 'home' }, { id: 2, label: 'jumped over the lazy dog' }];
    this.events = [
      [ 'onTabSelect', function () { return null; } ]
    ];
  }

  /**
   * Define a template for the new element by implementing LitElement's
   * `render` function. `render` must return a lit-html TemplateResult.
   */
  render() {
    var _self = this;
    let container = this._createElement('div', { id: 'tabstrip-container' });
    container.innerHTML = null;

    let headerContainer = this._createElement('div', { id: 'tabstrip-header-container' });

    for (let tab of this.tabs) {
      // Create the tab container
      let tabHeader = this._createElement('div', { id: `hdr_${tab.id}`, class: 'tabSelector' });

      // Create an icon for the tab, if one is specified
      let _icon = (tab.icon && typeof tab.icon === "string" && tab.icon.length > 0) ? `<mwc-icon>${tab.icon}</mwc-icon>` : "<mwc-icon></mwc-icon>";

      // Lay out the tab contents and attach to the tab header container
      tabHeader.innerHTML = `<div class="tabSelector_icon">${_icon}</div><div class="tabSelector_label">${tab.label}</div>`;

      // Bind the click event for the tab
      tabHeader.addEventListener('click', e => {
        _self.selectTab(tab.id);
      });

      // Add the tab to the parent container
      headerContainer.appendChild(tabHeader);
    }

    let contentContainer = this._createElement('div', { id: 'tabstrip-content-container' });
    contentContainer.innerHTML = `<slot></slot>`;

    container.appendChild(headerContainer);
    container.appendChild(contentContainer);
    return html`
      ${this.styleTag}
      ${container}
    `;
  }

  /**
   * Implement firstUpdated to perform one-time work on first update:
   */
  firstUpdated() {
    // console.log('firstUpdated executing');
    // let container = this.shadowRoot.getElementById('container');
    // container.innerHTML = null;

    // container.appendChild((new SvgCanvas()).svg);
  }

  updated(propMap) {
    // console.log(`updated properties: ${[...propMap.keys()]}`);
    // for (let prop of propMap.keys()) {
    //   console.log(`${prop}: ${JSON.stringify(this[prop])}`);
    // }
  }

  // Helpers
  _defaultStyle() {
    return this._createElement('style', {},
      `

      div#tabstrip-container {
        width: var( --pkc-tabstrip-width, 100%);
        min-height: var( --pkc-tabstrip-height, --pkc-tabstrip-header-height);
        display: flex; flex-direction: column;
        justify-content: flex-start;
        border: var(--pkc-tabstrip-border, 0px solid #ccc);
      }

      div#tabstrip-header-container {
        width: 100%;
        font-family: var(--pkc-header-font-family , helvetica);
        font-size: var(--pkc-header-font-size, 1em);
        color: var(--pkc-header-font-color, #999);
        background-color: var(--pkc-header-bgcolor, #ccc);
        height: var(--pkc-tabstrip-header-height, 30px);
        display: flex;
        justify-content: flex-start;
        align-items: center;
      }

      div#tabstrip-content-container {
        flex: 1 1 auto;
      }

      div.tabSelector {
        min-width: var(--pkc-tabstrip-header-min-width, 0px);
        height: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
      }

      div.tabSelector:hover {
        cursor: pointer;
        background-color: var(--pkc-tabstrip-bgcolor-hover, #ccc);
        color: var(--pkc-tabstrip-color-hover, #fff)
      }

      div.tabSelector.selected {
        background-color: var(--pkc-tabstrip-selected-bgcolor, #fff);
        color: var(--pkc-tabstrip-selected-color, #333);
      }

      div.tabSelector.selected:hover {
        cursor: inherit;
        bacground-color: inherit;
      }

      div.tabSelector_icon {
        padding-right: 5px;
        padding-left: 5px;
        height: 100%;
        display: flex;
        align-items: center;
      }

      div.tabSelector_label {
        flex: 1 1 auto;
        height: 100%;
        display: flex;
        align-items: center;
        margin-right: 10px;
      }

      mwc-icon {
        --mdc-icon-size: 1em;
      }


    `);
  }

  // Public interface
  selectTab(tabId) {
    var _self = this;

    if (!Array.isArray(_self.tabs)) return;

    var tab = _self.tabs.find(elem => elem.id == tabId);
    if (!tab) return;

    let _tabs = _self.shadowRoot.querySelectorAll('div[id^=\'hdr_\'].selected');
    _tabs.forEach(elem => elem.classList.remove('selected'));
    let _tab = _self.shadowRoot.getElementById(`hdr_${tabId}`);
    _tab.classList.add('selected');

    // let test_content = _self.shadowRoot.querySelector('slot').assignedNodes()[1];
    // if (test_content) {
    // }

    this.dispatchEvent(new CustomEvent('tabSelected', { detail: { tab: tab } }));

  }

  get selectedTab() {

  }
}

// Register the element with the browser
customElements.define('pkc-tabstrip', PkcTabstrip);
