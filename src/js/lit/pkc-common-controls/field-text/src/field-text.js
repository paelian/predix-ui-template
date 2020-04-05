
// Import LitElement base class and html helper function
import { LitElement, html } from 'lit-element';
import { DomHelperMixin } from '../../../pkc-common/src/domHelperMixin';
import { defer } from '../../../pkc-common/src/defer';
import '../../pkc-select/src/pkc-select.js';

export class FieldText extends DomHelperMixin(LitElement) {
  /**
   * Define properties. Properties defined here will be automatically 
   * observed.
   */
  static get properties() {
    return {
      text: {
        type: String
      },
      showlabel: {
        type: String
      },
      placeholder: {
        type: String
      },
      triggercodes: {
        type: Array
      },
      showbutton: {
        type: String
      },
      buttonicon: {
        type: String
      },
      updatedeadbandms: {
        type: Number
      }
    };
  }

  constructor() {
    super();

    this._initialized = defer();
    this._evtqueue = new Map();

    // Initialize properties
    this.text = 'Text label';
    this.showlabel = 'true';
    this.placeholder = '';
    this.triggercodes = [13, 27]; // enter,esc
    this.showbutton = 'false';
    this.buttonicon = 'search';
    this.updatedeadbandms = 0;
  }

  /**
   * Define a template for the new element by implementing LitElement's
   * `render` function. `render` must return a lit-html TemplateResult.
   */
  render() {
    var _self = this;
    // console.log("........render called")
    _self.styleTag = _self._defaultStyle()
    let container = _self._createElement('div', { id: 'container', class: 'container' });

    let label = _self._createElement('div', { id: 'label', class: `fieldLabel ${_self.showlabel === 'true' ? '' : 'hidden'}` });
    label.innerText = _self.text;
    container.appendChild(label);

    let textContainer = _self._createElement('div', { id: 'container', class: 'fieldTextContainer' });
    let input = _self._createElement('input', { id: 'textInput', type: 'text', class: 'fieldText', placeholder: _self.placeholder });
    let isValidKeyCode = null;
    input.addEventListener('keyup', e => {
      let currentValue = input.value;
      let _check = (typeof isValidKeyCode !== 'function') ? (key, shiftKey, ctrlKey) => { return true; } : isValidKeyCode;
      let lastval = input.getAttribute('lastValue');
      if (!lastval || lastval !== currentValue) {
        for (let i = 0; i < currentValue.length; i++) {
          if (!_check(currentValue.charCodeAt(i))) {
            currentValue = lastval;
            input.value = currentValue;
            return;
          }
        }
      }
      let evntdata = JSON.parse(JSON.stringify({ currentValue, lastValue: lastval }));
      input.setAttribute('lastValue', currentValue);
      if (lastval !== currentValue) {
        _self.dispatchEvent(new CustomEvent('TextChanged', { bubbles: true, composed: true, detail: { sender: _self, value: evntdata } }));
      }

      let key = (e.charCode && e.charCode !== 0) ? e.charCode : e.keyCode;
      if (_self.triggercodes.includes(key)) {
        _self.dispatchEvent(new CustomEvent('TriggerKey', { bubbles: true, composed: true, detail: { sender: _self, value: Object.assign(evntdata, { key }) } }));
      } else {
        if (_self.updatedeadbandms > 0) {
          if (currentValue === _self.value) {
            _self._evtqueue.set('TriggerKey', () => { _self.dispatchEvent(new CustomEvent('TriggerKey', { bubbles: true, composed: true, detail: { sender: _self, value: Object.assign(evntdata, { key: 13 }) } })); });
            setTimeout(() => _self._processEventQueue(), _self.updatedeadbandms);
          }
        }
      }
    });
    let fieldButton = _self._createElement('div', { id: 'fieldButton', class: 'fieldButton' });
    let selector = _self._createElement('mwc-icon', { id: 'icon_selector' });
    selector.innerText = _self.buttonicon;
    fieldButton.addEventListener('click', e => {
      _self.dispatchEvent(new CustomEvent('FieldTextButtonClicked', { bubbles: true, composed: true, detail: { sender: _self, value: _self.value } }));
    });
    fieldButton.appendChild(selector);

    textContainer.appendChild(input);
    if (_self.showbutton === 'true') {
      textContainer.appendChild(fieldButton);
    }
    container.appendChild(textContainer);

    setTimeout(() => {
      let promises = [
      ];
      Promise.all(promises).then(() => {

        this._initialized.resolve();
      });
    }, 100);

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
        div.container {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
        }

        div.fieldLabel {
            height: 15px;            
            padding-bottom: 3px;
        }

        div.fieldLabel.hidden {
          height: 0px;
          padding-bottom: 0px;
          visibility: hidden;
        }

        div.fieldTextContainer {
            flex: 1 1 auto;
            margin-top: 2px;
            border: var(--border, 1px solid #ccc);
            padding: 2px 3px;
            width: calc(var(--width, 200px) - 7px);
            height: calc(var(--height, 30px) - 5px);
            display: flex;
            flex-direction: row;
            justify-content: space-around;
          }

        div.fieldButton {
          height: calc(var(--height, 30px) - 5px);
          width: calc(var(--height, 30px) - 5px); /* yes, keep the width the same as the height - we want a square aspect for the button */
        }

        div.fieldButton:hover {
          cursor: pointer;
        }

        input#textInput {
          border: none;
          min-width: 0px;
          width: var(--text-width, calc(100% - calc(var(--height, 30px) - 5px))); height: 100%;
        }

        input#textInput::placeholder {
          color: var(--placeholder-color, #ccc);
        }

        mwc-icon {
          --mdc-icon-size: calc(var(--height, 30px) - 5px);
        }
    `);
  }

  _processEventQueue() {
    var _self = this;
    [..._self._evtqueue.keys()].forEach(key => {
      _self._evtqueue.get(key)();
      _self._evtqueue.delete(key);
    });
  }

  // Public methods
  get ready() { // <-- returns promise that is resolved after control is initialized
    var _self = this;
    return _self._initialized;
  }

  setValue(val) {
    var _self = this;
    _self.ready.then(() => {
      let input = _self.shadowRoot.getElementById('textInput');
      input.value = val;
    });
  }

  get value() {
    var _self = this;
    let input = _self.shadowRoot.getElementById('textInput');
    return input.value;
  }
}

// Register the element with the browser
customElements.define('field-text', FieldText);
