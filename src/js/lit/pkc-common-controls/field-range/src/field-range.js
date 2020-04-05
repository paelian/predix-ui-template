
// Import LitElement base class and html helper function
import { LitElement, html } from 'lit-element';
import { DomHelperMixin } from '../../../pkc-common/src/domHelperMixin';
import { defer } from '../../../pkc-common/src/defer';

export class FieldRange extends DomHelperMixin(LitElement) {
  /**
   * Define properties. Properties defined here will be automatically 
   * observed.
   */
  static get properties() {
    return {
      text: {
        type: String
      },
      min: {
        type: Number
      },
      max: {
        type: Number
      },
      step: {
        type: Number
      },
      showlabel: {
        type: Boolean
      },
      showvalue: {
        type: Boolean
      },
      inlinelabel: {
        type: Boolean
      },
      initialValue: {
        type: Number
      },
      labelasvalue: {
        type: Boolean
      }
    };
  }

  constructor() {
    super();

    this._initialized = defer();

    // Initialize properties
    this.text = 'Select';
    this.min = 0; this.max = 100; this.step = 10; this.initialValue = 0;
    this.showlabel = true;
    this.showvalue = true;
    this.labelasvalue = false;
    this.inlinelabel = false;
  }

  /**
   * Define a template for the new element by implementing LitElement's
   * `render` function. `render` must return a lit-html TemplateResult.
   */
  render() {
    var _self = this;
    // console.log("........render called")
    _self.styleTag = _self._defaultStyle()
    let container = _self._createElement('div', { id: 'container', class: `container ${this.inlinelabel ? 'hlabel' : ''}` });

    let label = _self._createElement('div', { id: 'label', class: 'fieldLabel' });
    label.innerHTML = (!_self.labelasvalue) ? _self.text: '';

    if (!_self.showlabel) label.classList.add('hidden');
    container.appendChild(label);

    let selectContainer = _self._createElement('div', { id: 'container', class: 'fieldRangeContainer' });
    let select = _self._createElement('input', { id: 'select', type: 'range', class: 'fieldRange', min: _self.min, max: _self.max, step: _self.step });
    select.value = this.initialValue;
    let valueContainer = _self._createElement('div', { id: 'valueContainer', class: 'valueContainer' });
    valueContainer.textContent = select.value;

    select.addEventListener('input', () => {
      _self._evtdispatch_InputChanged();
    });

    select.addEventListener('change', () => {
      _self._evtdispatch_RangeChanged();
    });

    selectContainer.appendChild(select);

    if (!_self.showvalue) valueContainer.classList.add('hidden');
    selectContainer.appendChild(valueContainer);
    container.appendChild(selectContainer);

    setTimeout(() => { 
      let promises = [
      ];
      Promise.all(promises).then(() => {
        this._initialized.resolve();

        if (_self.labelasvalue) {
          label.innerHTML = _self.value;
        }
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
            min-width: 160px;
            width: var(--width, 160px);
        }

        div.container.hlabel {
          flex-direction: row;
          align-items: center;
        }

        div.fieldLabel {
            height: 15px;            
            padding-bottom: 3px;
            text-align: var(--field-label-text-align, left);
        }

        div.container.hlabel div.fieldLabel {
          padding-bottom: 0px;
          min-width: var(--label-width, 50px);
          font-size: var(--label-font-size, 1em);
        }

        div.fieldLabel.hidden {
            height: 0px;
            visibility: hidden;
        }

        div.fieldRangeContainer {
            flex: 1 1 auto;
            margin-top: 2px;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }

        div.valueContainer {
          height: 30px;
          width: 25px;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
        }

        div.valueContainer.hidden {
          visibility: hidden;
          height: 0px; width: 0px;
        }
    `);
  }

  _evtdispatch_RangeChanged(detail = null) {
    var _self = this;
    let _detail = (detail === null) ? { sender: _self, value: _self.value } : detail;
    let valueContainer = _self.shadowRoot.querySelector('div#valueContainer');
    valueContainer.textContent = _self.value;
    if (_self.labelasvalue) {
      let label = _self.shadowRoot.querySelector('#label');
      label.innerHTML = _self.value;
    }
    _self.dispatchEvent(new CustomEvent('Changed', { detail: _detail }));
  }

  _evtdispatch_InputChanged(detail = null) {
    var _self = this;
    let _detail = (detail === null) ? { sender: _self, value: _self.value } : detail;
    let valueContainer = _self.shadowRoot.querySelector('div#valueContainer');
    valueContainer.textContent = _self.value;
    if (_self.labelasvalue) {
      let label = _self.shadowRoot.querySelector('#label');
      label.innerHTML = _self.value;
    }
    _self.dispatchEvent(new CustomEvent('NewInput', { detail: _detail }));
  }

  // Public methods
  initValue(val) {
    var _self = this;
    let select = _self.shadowRoot.getElementById('select');
    let valueContainer = _self.shadowRoot.querySelector('div#valueContainer');
    valueContainer.textContent = _self.value;
    select.setValue(val, true);
  }

  setValue(val) {
    var _self = this;
    let select = _self.shadowRoot.getElementById('select');
    select.value = val;
    _self._evtdispatch_RangeChanged();
  }

  get value() {
    var _self = this;
    let select = _self.shadowRoot.getElementById('select');
    return select.value;
  }

  get ready() {
    var _self = this;
    return _self._initialized;
  }

}

// Register the element with the browser
customElements.define('field-range', FieldRange);
