// Import LitElement base class and html helper function
import { LitElement, html } from 'lit-element';
import { DomHelperMixin } from '../../../pkc-common/src/domHelperMixin';
import { defer } from '../../../pkc-common/src/defer';
import { Icon } from '@material/mwc-icon';

export class PdxMenunav extends DomHelperMixin(LitElement) {

    static get properties() {
        return {
            items: {
                type: Array
            },

            // enforcing icons is intended for potential use in responsive/menu collapsed situations; as such, this should also prevent nested-spaced menu items from indenting
            enforceicons: {
                type: Boolean
            }
        };
    }

    constructor() {
        super();

        this._initialized = defer();

        this._state = "closed";

        // Initialize properties
        this.enforceicons = true;
        this.items = [
            {
                "id": 1,
                "label": "option 1",
                "icon": "bookmark_border",
                "event": e => { console.log('event triggered', e) }
            },
            {
                "id": 2,
                "label": "option 2",
                "icon": null
            },
            {
                "id": 3,
                "label": "option 3",
                "icon": "arrow_drop_down"
            },
            {
                "id": 4,
                "label": "option 4",
                "icon": "more_horiz",
                "nestlevel": 1
            }
        ]
    }

    render() {
        var _self = this;
        // console.log("........render called")
        _self.styleTag = this._defaultStyle();
        let container = this._createElement('div', { id: 'container', class: 'container' });

        _self._drawMenu(container);

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
        var shadowCss = `
        -webkit-border-radius:4px;
        -moz-border-radius:4px;
        -webkit-box-shadow: 3px 3px 5px rgba(8,8,8,0.5);
        -moz-box-shadow: 3px 3px 5px rgba(8,8,8,0.5);
        box-shadow: 3px 3px 5px rgba(8,8,8,0.5);
    `;
        let rtn = _self._createElement('style', {},
            `
            :host {
                position: absolute;
                top: 0px; left: 0px;
                z-index: 101;
                height: 100%;
            }

            div.container {
                width: 0px;
                height: 100%;
                background-color: var(--background-color, #ccc);
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                color: var(--color, #333);
                overflow: hidden;

                ${shadowCss}

                transition: width .25s ease-out;
                transition-delay: .1s;
            }

            div.entry {
                display: flex;
                height: var(--menu-item-height, 20px);
                flex-direction: row;
                justify-content: flex-start;
                align-items: center;

                opacity: 0;
                transition: opacity .1s ease-out;
                transition-delay: 0s;
            }

            div.container.open {
                width: var(--width, 100px);
                transition: width .25s ease-in;
                transition-delay: 0s;
            }

            div.container.open div.entry {
                opacity: 1;
                transition: opacity .1s ease-in;
                transition-delay: .25s;
            }

            div.entry:hover {
                background-color: var(--menu-item-hover-bgcolor, #999);
                color: var(--menu-item-hover-color, #333);
                cursor: pointer;
            }

            mwc-icon {
                --mdc-icon-size: 17px;
                color: var(--color, #000);
            }

            div.entryIcon {
                display: flex; flex-direction: column;
                justify-content: center;
                align-items: center;
                height: var(--menu-item-height, 20px);
            }

            div.entryText {
                margin-top: 2px; margin-left: 2px;
            }

            div.spacer {
                width: 10px;
                height: var(--menu-item-height, 20px);
            }

            div.padding-left, div.padding-right {
                width: 5px;
                height: var(--menu-item-height, 20px);
            }

            `);

        return rtn;
    }

    _drawMenu(container) {
        var _self = this;

        _self.items.forEach(item => {
            let _entry = _self._createElement("div", { id: `menu_entry__${item.id}`, class: "entry" });
            let _paddingleft = _self._createElement("div", { class: "padding-left" });
            _entry.appendChild(_paddingleft);
            if (!_self.enforceicons && item.nestlevel !== null && Number.isInteger(item.nestlevel) && item.nestlevel > 0) {
                for(let i = 0; i < item.nestlevel; i++) {
                    let _spacer = _self._createElement("div", { class: "spacer" });
                    _entry.appendChild(_spacer);
                }
            }
            if (item.icon !== null && typeof item.icon === "string" && item.icon.length > 0) {
                let _entryIcon = _self._createElement("div", { id: `icon__${item.icon}`, class: 'entryIcon' });
                let icon = _self._createElement('mwc-icon', );
                _entryIcon.appendChild(icon);
                icon.innerText = item.icon;
                _entry.appendChild(_entryIcon);
            } else {
                if (_self.enforceicons) {
                    let _entryIcon = _self._createElement("div", { id: `icon__${item.icon}`, class: 'entryIcon' });
                    let icon = _self._createElement('mwc-icon', );
                    _entryIcon.appendChild(icon);
                    icon.innerText = "indeterminate_check_box";
                    _entry.appendChild(_entryIcon);
    
                }
            }
            let _menutext = _self._createElement("div", { class: "entryText" });
            _menutext.textContent = item.label;
            _entry.appendChild(_menutext)
            container.appendChild(_entry);

            _entry.addEventListener("click", e => {
                if (item.event && typeof item.event === 'function') {
                    item.event(item);
                }
                _self._menuitem_selected(item);
            });

        });
    }
    // #endregion

    // Private events
    _menuitem_selected(itemSelected) {
        var _self = this;
        _self.dispatchEvent(new CustomEvent('ItemSelected', { detail: { sender: _self, value: itemSelected } }));
    }

    // Pubilc methods
    open() {
        var _self = this;
        _self._state = "open";
        _self.shadowRoot.querySelector("div.container").classList.add("open");
    }

    close() {
        var _self = this;
        _self._state = "closed";
        _self.shadowRoot.querySelector("div.container").classList.remove("open");
    }

    // Public properties
    get state() {
        var _self = this;
        return _self._state;
    }
}

// Register the element with the browser
customElements.define('pdx-menunav', PdxMenunav);
