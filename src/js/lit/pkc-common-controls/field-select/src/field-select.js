
// Import LitElement base class and html helper function
import { LitElement, html } from 'lit-element';
import { DomHelperMixin } from '../../../pkc-common/src/domHelperMixin';
import { defer } from '../../../pkc-common/src/defer';
import '../../pkc-select/src/pkc-select.js';

export class FieldSelect extends DomHelperMixin(LitElement) {
  /**
   * Define properties. Properties defined here will be automatically 
   * observed.
   */
  static get properties() {
    return {
      text: {
        type: String
      },
      items: {
        type: Array
      },
      showlabel: {
        type: String
      },
      orientation: {
        type: String
      },
      defaultSelection: {
        type: String
      },
      enabled: {
        type: String
      }
    };
  }

  constructor() {
    super();

    this._initialized = defer();

    // Initialize properties
    this.text = 'Select';
    this.items = [];
    this.showlabel = 'true';
    this.orientation = 'vertical';
    this.defaultSelection = "";
    this.enabled = "true";
  }

  /**
   * Define a template for the new element by implementing LitElement's
   * `render` function. `render` must return a lit-html TemplateResult.
   */
  render() {
    var _self = this;
    // console.log("........render called")
    _self.styleTag = _self._defaultStyle()
    let container = _self._createElement('div', { id: 'container', class: `container ${_self.orientation}` });
    let disabledBlocker = _self._createElement('div', { id: 'disabledBlocker', class: `disabledBlocker hidden` });

    let label = _self._createElement('div', { id: 'label', class: 'fieldLabel' });
    label.innerText = _self.text;
    if (_self.showlabel.toLowerCase() !== 'true') label.classList.add('hidden');
    container.appendChild(label);

    let selectContainer = _self._createElement('div', { id: 'selectContainer', class: 'fieldSelectContainer' });
    let select = _self._createElement('pkc-select', { id: 'select', class: 'fieldSelect' });
    select.items = _self.items;

    selectContainer.appendChild(select);
    container.appendChild(selectContainer);

    setTimeout(() => { 
      let promises = [
      ];
      Promise.all(promises).then(() => {
        this._initialized.resolve();

        select.ready.then(() => {
          if (_self.defaultSelection.length > 0) {
            let item = _self.items.find(el => el.value === _self.defaultSelection);
            if (item !== null) {
              select.setValue(item.value, true);
            }
          }
        });

        if (_self.enabled.toLowerCase() === "false") {           
          _self.disableControl();
        }

      });
    }, 100);

    return html`
      ${this.styleTag}
      ${container}
      ${disabledBlocker}
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
        :host {
          position: relative;
        }

        div.container {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            z-index: 0;
        }

        div.container.horizontal {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: baseline;
        }

        div.disabledBlocker {
          position: absolute; top: 0; left: 0;
          z-index: 1;
          background-color: var(--disabled-blocker-color, #fff);
          opacity: 0.5;
        }

        div.disabledBlocker.hidden {
          height: 0px;
          visibility: hidden;
        }

        div.fieldLabel {
            height: 15px;            
            padding-bottom: 3px;
        }

        div.container.horizontal div.fieldLabel {
          padding-bottom: 0px;
        }

        div.fieldLabel.hidden {
            height: 0px;
            visibility: hidden;
        }

        div.fieldSelectContainer {
            flex: 1 1 auto;
            margin-top: 2px;
        }

        div.container.horizontal div.fieldSelectContainer {
          margin-top: 0px;
          margin-left: 5px;
        }
    `);
  }

  // Public methods
  initValue(val) {
    var _self = this;
    let select = _self.shadowRoot.getElementById('select');
    select.setValue(val, true);
  }

  setValue(val) {
    var _self = this;
    let select = _self.shadowRoot.getElementById('select');
    select.ready.then(() => {
      select.setValue(val);
    });
  }

  get value() {
    var _self = this;
    let select = _self.shadowRoot.getElementById('select');
    return select.value();
  }

  disableControl() {
    var _self = this;

    let _blocker = _self.shadowRoot.querySelector('div#disabledBlocker');
    let _container = _self.shadowRoot.querySelector('div#container');
    let _label = _self.shadowRoot.querySelector('div#label');
    _blocker.classList.remove('hidden');
    _blocker.style.height = `${(_self.orientation === "horizontal") ? _container.offsetHeight : _container.offsetHeight + _label.offsetHeight }px`;
    _blocker.style.width = `${(_self.orientation !== "horizontal") ? _container.offsetWidth : _container.offsetWidth + _label.offsetWidth}px`;

  }

  enableControl() {
    var _self = this;

    let _blocker = _self.shadowRoot.querySelector('div#disabledBlocker');
    _blocker.classList.add('hidden');
  }

  get ready() {
    var _self = this;
    return _self._initialized;
  }

}

// Register the element with the browser
customElements.define('field-select', FieldSelect);
