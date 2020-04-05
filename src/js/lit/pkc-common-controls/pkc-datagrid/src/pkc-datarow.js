
// Import LitElement base class and html helper function
import { LitElement, html } from 'lit-element';
import { DomHelperMixin } from '../../../pkc-common/src/domHelperMixin';
import { defer } from '../../../pkc-common/src/defer';

export class PkcDatarow extends DomHelperMixin(LitElement) {
    /**
     * Define properties. Properties defined here will be automatically 
     * observed.
     */
    static get properties() {
        return {
            definition: {
                type: Object
            },
            isheader: {
                type: Boolean
            },
            usepapercells: {
                type: Boolean
            },
            data: {
                type: Array
            }
        };
    }

    constructor() {
        super();

        this._initialized = defer();
        this._data = new Map();

        // Initialize properties
        this.isheader = false;
        this.definition = {
            columns: [
                { id: 1, label: "one", style: { "--width": "250px" } },
                { id: 2, label: "two", style: { "--width": "200px" } },
                { id: 3, label: "three", style: { "--width": "150px" } }
            ],
            headerstyle: { "--justify-content": "center", "--border-color": "rgba(0,0,0,1)" }
        };
        this.data = [
            [1, "1.1"],
            [2, "2.2"],
            [3, "3.3"]
        ];

    }

    /**
     * Define a template for the new element by implementing LitElement's
     * `render` function. `render` must return a lit-html TemplateResult.
     */
    render() {
        var _self = this;
        // console.log("........render called")
        _self.styleTag = this._defaultStyle();
        // let container = this._createElement('div', { id: 'container', class: 'container', tabindex: 0 });
        let container = this._createElement('div', { id: 'container', class: `container` });

        _self._data = new Map(_self.data);
        _self.definition.columns.forEach(el => {
            let col = this._createElement('pkc-datacell', { id: `pkcdc_${el.id}` });
            if (el.style) {
                Object.keys(el.style).forEach(key => {
                    col.style.setProperty(key, el.style[key]);
                });     
            }
            if (_self.isheader === true) {
                Object.keys(_self.definition.headerstyle).forEach(hdrkey => {
                    col.style.setProperty(hdrkey, _self.definition.headerstyle[hdrkey]);
                });
                col.setValue(el.label, _self);
            } else {
                col.setValue(_self._data.get(el.id), _self);
            }
            if (_self.usepapercells) col.paperCell = true;
            container.appendChild(col);
        });

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
        var _self = this;
        // console.log('firstUpdated executing');
    }

    updated(propMap) {
        // console.log(`updated properties: ${[...propMap.keys()]}`);
        // for (let prop of propMap.keys()) {
        //   console.log(`${prop}: ${JSON.stringify(this[prop])}`);
        // }
    }

    // #region Helpers
    _defaultStyle() {
        return this._createElement('style', {},
            `
                div.container {
                    position: relative;
                    background-color: var(--background-color, inherit);
                    display: flex;
                    flex-direction: row;
                }
            
            `
        );
    }

    // #endregion


    // Public methods

    value() {
        var _self = this;

        if (_self.useLightDOM) {
            debugger;
            return _self.shadowRoot.querySelector("slot").assignedNodes()[0];
        }
        return _self._data;
    }

    setValue(val) {
        var _self = this;

        if (_self.useLightDOM) {
            _self.innerHTML = val;
        } else {
            _self._data = val;
            _self.shadowRoom.querySelector("container").innerHTML = val;
        }
    }


}

// Register the element with the browser
customElements.define('pkc-datarow', PkcDatarow);
