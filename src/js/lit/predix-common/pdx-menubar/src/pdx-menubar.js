// Import LitElement base class and html helper function
import { LitElement, html } from 'lit-element';
import { DomHelperMixin } from '../../../pkc-common/src/domHelperMixin';
import { defer } from '../../../pkc-common/src/defer';
import { Icon } from '@material/mwc-icon';

export class PdxMenubar extends DomHelperMixin(LitElement) {

    static get properties() {
        return {
            rightbuttons: {
                type: Array
            },
            caption: {
                type: String
            },
            showmenubutton: {
                type: String
            }
        };
    }

    constructor() {
        super();

        this._initialized = defer();


        // Initialize properties
        this.caption = "";
        this.showmenubutton = "true";
        this.rightbuttons = [
            // {
            //     "id": 1,
            //     "label": "option 1",
            //     "icon": "bookmark_border"
            // },
            // {
            //     "id": 2,
            //     "label": "option 2",
            //     "icon": null
            // },
            // {
            //     "id": 3,
            //     "label": "option 3",
            //     "icon": "arrow_drop_down"
            // }
        ]
    }

    render() {
        var _self = this;
        // console.log("........render called")
        _self.styleTag = this._defaultStyle();
        let container = this._createElement('div', { id: 'container', class: 'container' });

        _self._drawContents(container);

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
            :host {
                width: var(--width, 100px);
                min-width: var(--min-width, 30px);
                height: 100%;
            }

            div.container {
                width: 100%;
                height: 100%;
                background-color: var(--background-color, #ccc);
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                color: var(--color, #333);
                overflow: hidden;
                align-items: center;
            }

            mwc-icon {
                --mdc-icon-size: 17px;
                color: var(--color, #000);
            }

            div.rightButtonMenu {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                padding-right: 5px;
            }

            div.button {
                display: flex; flex-direction: column;
                justify-content: center;
                align-items: center;
                height: var(--button-height, 20px);
                padding-left: 2px; padding-right: 2px;
            }

            div.button:hover {
                background-color: var(--button-hover-bgcolor, #999);
                color: var(--button-hover-color, #333);
                cursor: pointer;
                border-radius: 50%;
            }

            div.leftcontent {
                flex: 1 1 auto;
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                padding-left: 5px;
            }

            div.leftcontenttext {
                flex: 1 1 auto;
                margin-top: 2px; margin-left: 2px;
            }

            `);

        return rtn;
    }

    _drawContents(container) {
        var _self = this;

        let leftcontent = _self._createElement("div", { class: "leftcontent" });
        if (_self.showmenubutton === "true") {
            let _menubutton = _self._createElement("div", { id: `icon__0`, class: 'button menuButton' });
            let _icon = _self._createElement('mwc-icon', );
            _menubutton.appendChild(_icon);
            _icon.innerText = "menu";
            leftcontent.appendChild(_menubutton);    

            _menubutton.addEventListener('click', e => {
                _self._button_selected({ id: 0, label: "menuoption", icon: "menu" });
            });

        }
        let leftcontenttext = _self._createElement("div", { class: "leftcontenttext" });
        leftcontenttext.textContent = _self.caption;
        leftcontent.appendChild(leftcontenttext);

        let rb_menu = _self._createElement("div", { class: "rightButtonMenu" });
        _self.rightbuttons.forEach(item => {
            if (item.icon !== null && typeof item.icon === "string" && item.icon.length > 0) {
                let _entryIcon = _self._createElement("div", { id: `icon__${item.icon}`, class: 'button rightButton' });
                _entryIcon.title = item.label;
                let icon = _self._createElement('mwc-icon', );
                _entryIcon.appendChild(icon);
                icon.innerText = item.icon;
                rb_menu.appendChild(_entryIcon);

                _entryIcon.addEventListener('click', e => {
                    _self._button_selected(item);
                });
            }


        });

        container.appendChild(leftcontent);
        container.appendChild(rb_menu);
    }
    // #endregion

    // Private events
    _button_selected(itemSelected) {
        var _self = this;
        _self.dispatchEvent(new CustomEvent('ItemSelected', { detail: { sender: _self, value: itemSelected } }));
    }

    // Pubilc methods


    // Public properties

}

// Register the element with the browser
customElements.define('pdx-menubar', PdxMenubar);
