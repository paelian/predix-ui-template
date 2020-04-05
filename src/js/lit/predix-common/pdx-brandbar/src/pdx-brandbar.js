// Import LitElement base class and html helper function
import { LitElement, html } from 'lit-element';
import { DomHelperMixin } from '../../../pkc-common/src/domHelperMixin';
import { defer } from '../../../pkc-common/src/defer';
import gelogo from './svg/gelogo.svg';
import predixlogo from './svg/predixlogo.svg';

export class PdxBrandbar extends DomHelperMixin(LitElement) {

    static get properties() {
        return {
            title: {
                type: String
            },
            logo: {
                type: String
            }
        };
    }

    constructor() {
        super();

        this._initialized = defer();


        // Initialize properties
        this.title = "-- application name here --";
        this.logo = "";
    }

    render() {
        var _self = this;
        // console.log("........render called")
        _self.styleTag = this._defaultStyle();
        let container = this._createElement('div', { id: 'brandcontainer', class: 'container' });

        let logocontainer = this._createElement('div', { id: 'logocontainer', class: 'subcontainer left' });
        logocontainer.innerHTML = `
            <div class='logo ${_self.logo.length === 0 ? 'gelogo' : ''}' ${(_self.logo.length === 0) ? '' : 'style="background-image:url(' + _self.logo + ')"'} ></div><div>${_self.title}</div>
        `;

        let poweredbycontainer = this._createElement('div', { id: 'poweredbycontainer', class: 'subcontainer right' });
        poweredbycontainer.innerHTML = `
            <div>Powered by</div><div class='predixlogo'></div>
        `;

        container.appendChild(logocontainer);
        container.appendChild(poweredbycontainer);

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

        let rtn = _self._createElement('style', {},
            `
                div.container {
                    width: 100%;
                    height: 30px;
                    background-color: #012939;
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                    color: #96a8b2;
                    overflow: hidden;
                }

                div.subcontainer {
                    display: flex;
                    flex-direction: row;
                    height: 100%;
                    align-items: center;
                }

                div.subcontainer.left {
                    margin-left: 10px;
                }

                div.subcontainer.right {
                    margin-right: 10px;
                    font-size: 12px;
                }

                div.logo {
                    background-size: contain;
                    width: var(--logo-width, 20px); height: var(--logo-height, 20px);
                    margin-right: 10px;
                    background-repeat: no-repeat;
                }
                div.gelogo {
                    background-image:url(${_self._svglogo()});
                }

                div.predixlogo {
                    background-image:url(${_self._svglogo('predixlogo')});
                    background-size: contain;
                    width: 60px; height: 10px;
                    margin-left: 5px;
                }

            `);

        return rtn;
    }


    // #endregion

    // Private events
    _svglogo(name = 'gelogo', base64Url = true) {
        let rtn = gelogo;
        switch (name) {
            case 'predixlogo':
                rtn = predixlogo;
                break;
            default:
        }
        return (base64Url) ? `data:image/svg+xml;base64,${btoa(rtn)}` : rtn;
    }

    // Pubilc methods


    // Public properties

}

// Register the element with the browser
customElements.define('pdx-brandbar', PdxBrandbar);
