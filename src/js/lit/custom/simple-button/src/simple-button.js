// Import LitElement base class and html helper function
import { LitElement, html } from 'lit-element';
import { DomHelperMixin } from '../../../pkc-common/src/domHelperMixin';
import { defer } from '../../../pkc-common/src/defer';
import { relativeTimeThreshold } from 'moment';

export class SimpleButton extends DomHelperMixin(LitElement) {

    static get properties() {
        return {
        };
    }

    constructor() {
        super();

        this._initialized = defer();


        // Initialize properties
    }

    render() {
        var _self = this;
        // console.log("........render called")
        _self.styleTag = this._defaultStyle();
        let container = this._createElement('div', { id: 'container', class: 'container' });

        container.innerHTML = "hi there world"; //_self._createContainer();

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

    // createRenderRoot() {
    //     this.attachShadow({mode: "open"});
    //     return this;
    // }

    updated(propMap) {
        // console.log(`updated properties: ${[...propMap.keys()]}`);
        // for (let prop of propMap.keys()) {
        //   console.log(`${prop}: ${JSON.stringify(this[prop])}`);
        // }
    }


    // #region Helpers

    _defaultStyle() {
        var _self = this;

        let rtn = this._createElement('style', {},
            `
                div.container {
                    width: 100%;
                    height: 100%;
                }

        `);

        return rtn;
    }

    // #endregion

    // Pubilc methods

    // Public properties
    get ready() { // <-- returns promise that is resolved after control is initialized
        var _self = this;
        return _self._initialized;
    }

}

// Register the element with the browser
customElements.define('simple-button', SimpleButton);
