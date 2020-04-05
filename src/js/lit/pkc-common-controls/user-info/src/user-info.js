
// Import LitElement base class and html helper function
import { LitElement, html } from 'lit-element';
import { DomHelperMixin } from '../../../pkc-common/src/domHelperMixin';
import { Icon } from '@material/mwc-icon';

export class UserInfo extends DomHelperMixin(LitElement) {
    /**
     * Define properties. Properties defined here will be automatically 
     * observed.
     */
    static get properties() {
        return { 
            menuitems: {
                type: Array
            }           
        };
    }

    constructor() {
        super();

        this._userText = '';
        // Initialize properties
        this.menuitems = [];
    }

    /**
     * Define a template for the new element by implementing LitElement's
     * `render` function. `render` must return a lit-html TemplateResult.
     */
    render() {
        var _self = this;
        // console.log("........render called")
        _self.styleTag = this._defaultStyle()
        let container = this._createElement('div', { class: 'container' });

        let iconcontainer = this._createElement('div', { id: 'iconcontainer' });
        let icon = this._createElement('mwc-icon', { id: 'icon', class: 'hidden' });
        iconcontainer.append(icon);
        icon.innerText = 'person_outline';
        container.appendChild(iconcontainer);
        
        let userText = this._createElement('div', { id: 'userText', class: 'userText' });
        userText.innerHTML = this.user;

        container.appendChild(userText);

        container.appendChild(_self._render_menu());

        iconcontainer.addEventListener('click', e => { _self._showMenu(); });
        userText.addEventListener('click', e => { _self._showMenu(); });

        setTimeout(() => {
            icon.classList.remove('hidden');
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
        flex-direction: row;
        justify-content: center;
        align-content: center;
        height: var(--height, 28px); 
        min-width: var(--width, 148px);
        background-color: var(--background-color, none);
        color: var(--color, inherit);
        font-size: var(--font-size, inherit);
        position: relative;
      }
      
      div.container:hover {
        cursor: pointer;
        background-color: var(--background-color-hover, none);
        color: var(--color-hover, inherit);
      }
      
      div.subcontainer > div.userText,
      div.container > div.userText {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-content: center;
        overflow: hidden;
      }

      mwc-icon {
        --mdc-icon-size: 24px;
        color: var(--color, inherit);
      }

      mwc-icon.hidden {
        visibility: hidden;
      }

      div#iconcontainer2,
      div#iconcontainer {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-content: center;
        overflow: hidden;
        margin-right: 3px;
      }

      div#menucontainer {
        z-index: 101;
        background-color: var(--bgcolor-menu, #ccc);
        position: absolute;
        top: -1px;
        left: -1px;
        min-width: var(--width, 148px);
        min-height: var(--min-height-menu, 75px);
        border: 1px solid #777;
        color: var(--color-menu, #333);
        border-radius: 5px;
      }

      div#menucontainer.hidden {
          display: none;
      }

      div.subcontainer {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-content: center;
        height: var(--height, 28px); 
        min-width: var(--width, 78px);
        border-bottom: 1px solid #333;
        margin-left: 15px; margin-right: 15px;
      }

      div.menuitem {
          margin-left: 10px; margin-right: 10px;
          margin-top: 3px; margin-bottom: 2px;
          height: var(--height-menuitem, 30px);
          display: flex;
          flex-direction: column;
          justify-content: center;
      }

      div.menuitem:hover {
          background-color: var(--bgcolor-menuitem-hover, #aaa);
          color: var(--color-menuitem-hover, #333);
          cursor: pointer;
      }

    `);
    }

    _render_menu() {
        var _self = this;
        var menucontainer = _self._createElement('div', { id: 'menucontainer', class: 'menucontainer hidden' });
        
        let subcontainer = this._createElement('div', { class: 'subcontainer' });
        let iconcontainer = this._createElement('div', { id: 'iconcontainer2' });
        let icon = this._createElement('mwc-icon', { id: 'icon2' });
        iconcontainer.append(icon);
        icon.innerText = 'person_outline';
        subcontainer.appendChild(iconcontainer);

        let userText = this._createElement('div', { id: 'userText2', class: 'userText' });
        userText.innerHTML = this.user;
        subcontainer.appendChild(userText);

        subcontainer.addEventListener('click', e => { _self._hideMenu(); });

        var logoutitem = _self._createElement('div', { id: 'logoutitem', class: 'menuitem logoutitem' });
        logoutitem.innerHTML = 'Log out';
        logoutitem.addEventListener('click', e => {
            _self._logoutSelected();
        });

        menucontainer.appendChild(subcontainer);
        menucontainer.appendChild(logoutitem);
        // menucontainer.addEventListener('mouseout', e => { _self._hideMenu(); });

        if (_self.menuitems.length > 0) {
            // TODO: add some other menu items to the 'drop list'
        }

        return menucontainer;
    }

    _logoutSelected() {
        var _self = this;
        _self._hideMenu();
        _self.dispatchEvent(new CustomEvent('Logout', { detail: { sender: _self } }));

    }

    _hideMenu() { //console.log('hide')
        var _self = this;
        var menucontainer = _self.shadowRoot.getElementById('menucontainer');
        menucontainer.classList.add('hidden');
    }

    _showMenu() { //console.log('show')
        var _self = this;
        var menucontainer = _self.shadowRoot.getElementById('menucontainer');
        menucontainer.classList.remove('hidden');
    }

    get user() {
        var _self = this;
        return _self._userText;
    }
    set user(val) {
        var _self = this;
        let userText = _self.shadowRoot.getElementById('userText');
        userText.innerHTML = val;
        let userText2 = _self.shadowRoot.getElementById('userText2');
        userText2.innerHTML = val;
        _self._userText = val;        
    }
}

// Register the element with the browser
customElements.define('user-info', UserInfo);
