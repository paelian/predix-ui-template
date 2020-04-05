
// Import LitElement base class and html helper function
import { LitElement, html } from 'lit-element';
import { DomHelperMixin } from '../../../pkc-common/src/domHelperMixin';
import { defer } from '../../../pkc-common/src/defer';
import { Icon } from '@material/mwc-icon';

export class PkcSwimlane extends DomHelperMixin(LitElement) {
    /**
     * Define properties. Properties defined here will be automatically 
     * observed.
     */
    static get properties() {
        return {
        };
    }

    constructor() {
        super();

        this._initialized = defer();
        this._header = 'this is a test';

        // Initialize properties

    }

    /**
     * Define a template for the new element by implementing LitElement's
     * `render` function. `render` must return a lit-html TemplateResult.
     */
    render() {
        var _self = this;
        // console.log("........render called")
        _self.styleTag = this._defaultStyle()
        let container = this._createElement('div', { id: 'container', class: 'container' });
        let header = this._render_header();
        let content = this._render_content();
        container.appendChild(header);
        container.appendChild(content);


        setTimeout(() => {

            let promises = [];
            this.updateComplete.then(() => {

                //   promises.push(new Promise((resolve, reject) => {
                //   }));
            });
            Promise.all(promises).then(() => {
                this._initialized.resolve();

                setTimeout(() => { // <-- add a bit of a delay to try to stop the text from jumping during first reander (again, TODO: there is probably a better way to do this)
                    let icon_containers = _self.shadowRoot.getElementById('header').getElementsByClassName('icon_container');
                    [...icon_containers].forEach(el => { el.classList.remove('hidden'); });
                    let headerText = _self.shadowRoot.getElementById('headerText');
                    headerText.classList.remove('hidden');

                    let header = _self.shadowRoot.getElementById('header');
                    header.addEventListener('click', e => {
                        (_self.isOpen) ? _self._close() : _self._open();
                    });
                    _self._open();
                }, 100);
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
                    width: var(--width, 100%);
                    min-width: var(--min-width, 200px);
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    border: 0px solid #777;
                    border-radius: 3px;                    
                }

                div.header {
                    height: var(--height, 30px);
                    background-color: var(--bgcolor, #777);
                    color: var(--color, #fff);
                    border-radius: 3px 3px 0px 0px;
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-content: center;
                    cursor: pointer;
                }
                
                div.content {
                    margin: 10px;
                }

                div.content.hidden {
                    display: none;
                }

                mwc-icon {

                }

                div.icon_container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-content: center;
                }
                                    
                div.icon_container.hidden {
                    visibility: hidden;
                }

                div.icon_container.closed {
                    display: none;
                }

                div#headerText {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-content: center;
                }

                div#headerText.hidden {
                    visibility: hidden;
                }
            `
        );
    }

    _render_header() {
        var _self = this;
        let header = _self._createElement('div', { id: 'header', class: 'header' });
        let icon_container_closed = _self._createElement('div', { id: 'icon_container_closed', class: 'icon_container hidden' });
        let icon_close = _self._createElement('mwc-icon', { id: 'icon_close' });
        icon_close.innerText = "arrow_right";
        icon_container_closed.appendChild(icon_close);
        header.appendChild(icon_container_closed);

        let icon_container_opened = _self._createElement('div', { id: 'icon_container_opened', class: 'icon_container hidden closed' });
        let icon_open = _self._createElement('mwc-icon', { id: 'icon_open' });
        icon_open.innerText = "arrow_drop_down";
        icon_container_opened.appendChild(icon_open);
        header.appendChild(icon_container_opened);

        let headerText = _self._createElement('div', { id: 'headerText', class: 'headerText hidden' });
        headerText.innerText = _self.header;
        header.appendChild(headerText);

        return header;
    }

    _render_content() {
        var _self = this;
        let content = this._createElement('div', { id: 'content', class: 'content hidden' });
        let slot = this._createElement('slot', {});
        content.appendChild(slot);

        return content;
    }

    _open() {
        var _self = this;
        let header = _self.shadowRoot.getElementById('header');
        let content = _self.shadowRoot.getElementById('content');
        let icon_container_opened = _self.shadowRoot.getElementById('icon_container_opened');
        let icon_container_closed = _self.shadowRoot.getElementById('icon_container_closed');
        return new Promise((resolve, reject) => {
            icon_container_closed.classList.add('closed');
            icon_container_opened.classList.remove('closed');
            content.classList.remove('hidden');
            _self.dispatchEvent(new CustomEvent('Opened', { detail: { sender: _self } }));
            resolve(true);
        });

    }

    _close(animate = true) {
        var _self = this;
        let header = _self.shadowRoot.getElementById('header');
        let content = _self.shadowRoot.getElementById('content');
        let icon_container_opened = _self.shadowRoot.getElementById('icon_container_opened');
        let icon_container_closed = _self.shadowRoot.getElementById('icon_container_closed');
        return new Promise((resolve, reject) => {
            icon_container_closed.classList.remove('closed');
            icon_container_opened.classList.add('closed');
            content.classList.add('hidden');
            _self.dispatchEvent(new CustomEvent('Closed', { detail: { sender: _self } }));
            resolve(true);
        });

    }

    // #endregion


    // Public methods

    get isOpen() {
        var _self = this;

        let icon_container_closed = _self.shadowRoot.getElementById('icon_container_closed'); 
        let icon_container_opened = _self.shadowRoot.getElementById('icon_container_opened'); 
        return [...icon_container_closed.classList].includes('closed') && ![...icon_container_opened.classList].includes('closed');
    }

    get header() {
        var _self = this;
        return _self._header;
    }

    set header(val) {
        var _self = this;
        _self._header = val;
        let headerText = _self.shadowRoot.getElementById('headerText');
        headerText.innerText = (!val) ? '' : val;
    }

}

// Register the element with the browser
customElements.define('pkc-swimlane', PkcSwimlane);
