
// Import LitElement base class and html helper function
import { LitElement, html } from 'lit-element';
import { DomHelperMixin } from '../../../pkc-common/src/domHelperMixin';
import { defer } from '../../../pkc-common/src/defer';

export class PkcDatacell extends DomHelperMixin(LitElement) {
    /**
     * Define properties. Properties defined here will be automatically 
     * observed.
     */
    static get properties() {
        return {
            useLightDOM: {
                type: Boolean
            },
            vlignMiddle: {
                type: Boolean
            },
            paperCell: {
                type: Boolean
            }
        };
    }

    constructor() {
        super();

        this._initialized = defer();

        this._data = null;
        this._parent = null;

        // Initialize properties
        this.useLightDOM = false;
        this.valignMiddle = true;
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
        let container = this._createElement('div', { id: 'container', class: `container ${_self.valignMiddle ? 'valign-middle' : ''} ${_self.paperCell ? 'paper-cell' : 'standard-cell'}` });
        if (_self.useLightDOM) {
            container.appendChild(this._createElement('slot'));
        }

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
                    width: calc(var(--width, 200px) - calc(var(--padding-left, 3px) + var(--padding-right, 3px)));
                    min-width: calc(var(--min-width, 50px) - calc(var(--padding-left, 3px) + var(--padding-right, 3px)));
                    height: var(--height, 30px);
                    position: relative;
                    padding-left: var(--padding-left, 3px);
                    padding-right: var(--padding-right, 3px);
                    background-color: var(--background-color, inherit);

                    justify-content: var(--justify-content, start);

                }

                div.container.valign-middle {
                    display: flex;
                    align-items: center;
                }

                div.container.standard-cell {
                    box-shadow: 
                        var(--border-width, 2px) 0 0 0 var(--border-color, #ccc), 
                        0 var(--border-width, 2px) 0 0 var(--border-color, #ccc), 
                        var(--border-width, 2px) var(--border-width, 2px) 0 0 var(--border-color, #ccc),   /* Just to fix the corner */
                        var(--border-width, 2px) 0 0 0 var(--border-color, #ccc) inset, 
                        0 var(--border-width, 2px) 0 0 var(--border-color, #ccc) inset;

                }

                div.container.paper-cell {
                    box-shadow: 
                        0 0 0 0 var(--border-color, #ccc), 
                        0 var(--border-width, 2px) 0 0 var(--border-color, #ccc), 
                        0 0 0 0 var(--border-color, #ccc),   /* Just to fix the corner */
                        0 0 0 0 var(--border-color, #ccc) inset, 
                        0 var(--border-width, 2px) 0 0 var(--border-color, #ccc) inset;

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

    setValue(val, parent = null) {
        var _self = this;

        _self._initialized.then(() => {
            if (_self.useLightDOM) {
                _self.innerHTML = val;
            } else {
                _self._data = val;
                _self.shadowRoot.querySelector("#container").innerHTML = val;
            }
            if (parent !== null) {
                _self._parent = parent;
            }
        });
    }


}

// Register the element with the browser
customElements.define('pkc-datacell', PkcDatacell);
