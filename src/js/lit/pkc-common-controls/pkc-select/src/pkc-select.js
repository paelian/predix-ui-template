
// Import LitElement base class and html helper function
import { LitElement, html } from 'lit-element';
import { DomHelperMixin } from '../../../pkc-common/src/domHelperMixin';
import { defer } from '../../../pkc-common/src/defer';

export class PkcSelect extends DomHelperMixin(LitElement) {
    /**
     * Define properties. Properties defined here will be automatically 
     * observed.
     */
    static get properties() {
        return {
            selected: {
                type: Object
            },
            items: {
                type: Array
            },
            placeholder: {
                type: String
            }
        };
    }

    constructor() {
        super();

        this._initialized = defer();

        // Initialize properties
        this.items = [
            { key: 1, value: 'one' },
            { key: 2, value: 'two' },
            { key: 3, value: 'three' },
            { key: 4, value: 'four' },
        ];
        this.placeholder = '';
    }

    /**
     * Define a template for the new element by implementing LitElement's
     * `render` function. `render` must return a lit-html TemplateResult.
     */
    render() {
        var _self = this;
        // console.log("........render called")
        _self.styleTag = this._defaultStyle()
        let container = this._createElement('div', { id: 'container', class: 'container', tabindex: 0 });
        container.appendChild(_self._render_textInput());
        container.appendChild(_self._render_listContainer());

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
        let container = _self.shadowRoot.getElementById('container', { tabindex: 0 });
        let textInput = _self.shadowRoot.getElementById('textInput');
        let listContainer = _self.shadowRoot.getElementById('listContainer');
        textInput.addEventListener('click', e => {
            _self._showList.bind(_self)();
            listContainer.focus();
        });
        textInput.addEventListener('keydown', e => {
            let key = (e.charCode && e.charCode !== 0) ? e.charCode : e.keyCode;
            let arrowKey = { up: key === 38, down: key === 40, left: key === 37, right: key === 39 };
            let triggerCodes = [];
            if (triggerCodes.includes(key) || arrowKey.down) {
                _self._showList();
                setTimeout(() => { listContainer.focus() }, 100);
            }
            if (key === 27) {
                _self._hideList();
                textInput.blur();
            }
        });
        textInput.addEventListener('focus', e => {
            _self._list_clearSelection();
        });
        listContainer.addEventListener('keydown', e => {
            let key = (e.charCode && e.charCode !== 0) ? e.charCode : e.keyCode;
            let arrowKey = { up: key === 38, down: key === 40, left: key === 37, right: key === 39 };
            let triggerCodes = [13];
            if (triggerCodes.includes(key)) {
                // TODO: set value of selected item
                let selectedItem = _self._getHighlightedOption();
                if (selectedItem) {
                    _self.setValue(selectedItem.value);
                    textInput.focus();
                    // setTimeout(_self._hideList(), 100);
                }
            } else {
                if (arrowKey.up || arrowKey.down) {
                    _self._highlightNextOption(arrowKey.down ? 'next' : 'prev');
                } else {
                    if (key === 27) {
                        listContainer.blur();
                        setTimeout(() => { _self._hideList() }, 100);
                    }
                }
            }
        });
        // listContainer.addEventListener('focus', e => { 
        //     if (!_self.isOpen) {
        //         listContainer.blur();
        //         return;
        //     }
        //     if (!([...listContainer.getElementsByTagName('li')].find(el => (new Set([...el.classList])).has('selected')))) {
        //         _self._highlightNextOption();
        //     }
        // });
        container.addEventListener('focus', e => {
            textInput.focus();
        });
        listContainer.addEventListener('blur', e => {
            _self._hideList();
        });


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
                    width: var(--width, 200px);
                    min-width: var(--min-width, 200px);
                    height: var(--height, 30px);
                    position: relative;
                }

                div.textInputContainer {
                    border: var(--border-input-container, 1px solid #ccc);
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                    background-color: #fff;
                    height: 100%;
                }

                input#textInput {
                    border: none;
                    margin-left: 5px;
                    width: calc(var(--width, 200px) - 20px);
                    cursor: pointer;
                }

                mwc-icon#icon_selector:hover {
                    cursor: pointer;
                }

                mwc-icon.hidden {
                    visibility: hidden;
                }

                div.listContainer {
                    position: absolute;
                    top: calc(--height + 2px);
                    left: 0px; z-index: 101;
                    width: calc(var(--width, 200px) - 2px);
                    max-height: var(--max-height-list, 250px);
                    overflow-y: auto;
                    background-color: #fff;
                    height: 0px;
                }

                div.listContainer.visible {
                    height: auto;
                    border-left: 1px solid #ccc; 
                    border-bottom: 1px solid #ccc; 
                    border-right: 1px solid #ccc;                
                }

                div.listContainer ul {
                    list-style-type: none;
                    margin: 0;
                    padding: 2px;
                }

                div.listContainer ul li {
                    cursor: pointer;
                    color: #666;        
                }

                div.listContainer ul li:hover {
                    background-color: #ccc;
                }

                div.listContainer ul li.selected {
                    cursor: default;
                    background-color: #396B9E;
                    color: #fff;
                }
            
            `
        );
    }

    _render_textInput(isValidKeyCode) {
        var _self = this;
        let rtn = _self._createElement('div', { id: 'textInputContainer', class: 'textInputContainer' });
        let input = _self._createElement('input', { id: 'textInput', type: 'text', placeholder: _self.placeholder, tabindex: 1, readonly: true });
        // input.addEventListener('paste', e => { e.preventDefault(); });

        let selector = _self._createElement('mwc-icon', { id: 'icon_selector', class: 'hidden' });
        selector.addEventListener('click', () => {
            let listContainer = _self.shadowRoot.getElementById('listContainer');
            _self._showList.bind(_self)(); 
            listContainer.focus();
        });

        selector.innerText = "arrow_drop_down";
        selector.style = "--mdc-icon-size:16px;";

        rtn.appendChild(input);
        rtn.appendChild(selector);

        // hide icon for a bit to avoid ugly innertext from appearing before mwc-icon has a chance to initialize (there is probably a better way to do this)
        setTimeout(() => { _self.shadowRoot.getElementById('icon_selector').classList.remove('hidden') }, 500);

        return rtn;
    }

    _render_listContainer() {
        var _self = this;
        let rtn = _self._createElement('div', { id: 'listContainer', class: 'listContainer', tabindex: 2 });

        let ul = _self._createElement('ul', { id: 'ul_options' });
        _self.items.forEach(el => {
            let record = _self._createElement('li', { id: `li_${el.key}`, key: el.key });
            record.innerText = el.value;

            record.addEventListener('click', e => { _self._listItem_OnSelect.bind(_self, e, el)(); });

            ul.appendChild(record);
        });

        rtn.appendChild(ul);
        return rtn;
    }

    _showList() {
        var _self = this;
        let list = _self.shadowRoot.getElementById('listContainer');
        list.classList.add('visible');
    }

    _hideList() {
        var _self = this;
        let list = _self.shadowRoot.getElementById('listContainer');
        list.classList.remove('visible');
    }

    _toggleList() {
        var _self = this;
        let list = _self.shadowRoot.getElementById('listContainer');
        if (_self.isOpen) {
            _self._hideList();
        } else {
            _self._showList();
        }
    }

    _bindList(textFilter) {
        var _self = this;

        let list = this.shadowRoot.getElementById('ul_options');
        let filteredList = (textFilter) ? _self.items.filter(el => (el.value.toLowerCase().indexOf(textFilter.toLowerCase()) > -1)) : _self.items;
        list.innerHTML = "";
        filteredList.forEach(el => {
            let record = _self._createElement('li', { id: `li_${el.key}`, key: el.key });
            record.innerText = el.value;
            record.addEventListener('click', e => { _self._listItem_OnSelect.bind(_self, e, el)(); });
            list.appendChild(record);
        });
    }

    _listItem_OnSelect(e, item, hideListAfterSelect = true, suppressChangeEvent = false) {
        var _self = this;
        let textInput = _self.shadowRoot.getElementById('textInput');
        textInput.value = item.value;
        _self._list_clearSelection();
        _self.shadowRoot.getElementById(`li_${item.key}`).classList.add('selected');
        let currentValue = _self.value();
        if (!suppressChangeEvent) _self.dispatchEvent(new CustomEvent('Changed', { bubbles: true, composed: true, detail: { sender: _self, value: _self.value() } }));
        if (hideListAfterSelect) setTimeout(_self._hideList.bind(_self), 100); // <-- delay hiding the list, immediate call fails to hide the list (not sure why)
    }

    _list_clearSelection() {
        var _self = this;
        [..._self.shadowRoot.getElementById('ul_options').getElementsByTagName('li')].forEach(el => {
            if ((new Set([...el.classList])).has('selected')) {
                el.classList.remove('selected');
            }
        });
    }

    _highlightNextOption(dir = 'next') {
        var _self = this;
        let listContainer = _self.shadowRoot.getElementById('listContainer');
        let oldOption = [...listContainer.getElementsByTagName('li')].find(el => (new Set([...el.classList])).has('selected'));
        let options = listContainer.getElementsByTagName('li');
        let newOption = (options.length > 0) ? options[0] : null;
        if (oldOption && options.length > 0) {
            // locate old option in the options sequence
            let index = [...options].findIndex(e => e.id === oldOption.id);
            let at_bounds = (dir === 'next') ? index == (options.length - 1) : index == 0;
            if (at_bounds) {
                newOption = (dir === 'next') ? options[0] : options[options.length - 1];
            } else {
                newOption = (dir === 'next') ? options[index + 1] : options[index - 1];
            }
        }
        _self._list_clearSelection();
        newOption.classList.add('selected');
    }

    _getHighlightedOption() {
        var _self = this;
        let listContainer = _self.shadowRoot.getElementById('listContainer');
        let selectedOption = [...listContainer.getElementsByTagName('li')].find(el => (new Set([...el.classList])).has('selected'));
        if (!selectedOption) return null;
        return _self.items.find(el => el.key.toString().toLowerCase() === selectedOption.id.replace('li_', ''));
    }
    // #endregion


    // Public methods

    value() {
        var _self = this;
        let textInput = _self.shadowRoot.getElementById('textInput');
        let textFilter = textInput.value; if (textFilter.length == 0) return null;
        let filteredList = _self.items.find(el => el.value.toLowerCase().indexOf(textFilter.toLowerCase()) > -1);
        return filteredList;
    }

    setValue(val, suppressChangeEvent = false) {
        var _self = this;
        let textInput = _self.shadowRoot.getElementById('textInput');
        if (!textInput) return;
        if (!val) {
            textInput.value = '';
            _self._list_clearSelection();
            return;
        }
        if (typeof val === "string") {
            let item = _self.items.find(el => el.value.toLowerCase().indexOf(val.toLowerCase()) > -1);
            if (item) {
                _self._listItem_OnSelect(null, item, null, suppressChangeEvent);
            }
        } else {
            if (typeof val === 'object' && val && val.value) {
                _self.setValue(val.value, suppressChangeEvent);
            }
        }
    }

    get isOpen() {
        var _self = this;
        let listContainer = _self.shadowRoot.getElementById('listContainer');
        return (new Set([...listContainer.classList])).has('visible');
    }

    get ready() {
        var _self = this;
        return _self._initialized;
    }
}

// Register the element with the browser
customElements.define('pkc-select', PkcSelect);
