// Import LitElement base class and html helper function
import { LitElement, html } from 'lit-element';
import { DomHelperMixin } from '../../../pkc-common/src/domHelperMixin';
import { defer } from '../../../pkc-common/src/defer';
import { Icon } from '@material/mwc-icon';

export class PkcPager extends DomHelperMixin(LitElement) {

    static get properties() {
        return {
            pagesize: {
                type: Number
            },
            grid: { // this is needed to determine numItems automatically; control matching this id should support the "items" collection (array)
                type: String
            }
        };
    }

    constructor() {
        super();

        this._initialized = defer();

        this._currentPage = 1;
        this._numItems = 0;
        this._triggercodes = [13];// [13, 27]; // enter,esc

        // Initialize properties
        this.pagesize = 50;
        this.grid = "";

    }

    render() {
        var _self = this;
        // console.log("........render called")
        _self.styleTag = this._defaultStyle();
        let container = this._createElement('div', { id: 'container', class: 'container' });
        let contents = this._drawContents();
        container.innerHTML = contents;
        setTimeout(() => {
            let promises = [
            ];
            Promise.all(promises).then(() => {
                this._wireupEvents();

                this._initprops();

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
                    width: var(--width, 225px);
                    height: var(--height, 100%);
                    position: relative;      
                    font-size: 0.9em;       
                }

                div.contents {
                }

                ${_self._style_dashPager()}
        `);

        return rtn;
    }

    _style_dashPager() {
        let rtn = `
        
        .fa-angle-left:before {
            content: "\f104";
        }

        .fa-angle-right:before {
            content: "\f105";
        }

        .fa-angle-double-left:before {
            content: "\f100";
        }

        .fa-angle-double-right:before {
            content: "\f101";
        }

        button {
            -webkit-appearance: button;
            -webkit-writing-mode: horizontal-tb !important;
            text-rendering: auto;
            color: buttontext;
            letter-spacing: normal;
            word-spacing: normal;
            text-transform: none;
            text-indent: 0px;
            text-shadow: none;
            display: inline-block;
            text-align: center;
            align-items: flex-start;
            cursor: default;
            background-color: rgb(239, 239, 239);
            box-sizing: border-box;
            margin: 0em;
            font: 400 13.3333px Arial;
            padding: 1px 6px;
            border-width: 2px;
            border-style: outset;
            border-color: rgb(118, 118, 118);
            border-image: initial;
            border-radius: 2px;                    
        }

        input {
            -webkit-writing-mode: horizontal-tb !important;
            text-rendering: auto;
            letter-spacing: normal;
            word-spacing: normal;
            text-transform: none;
            text-indent: 0px;
            text-shadow: none;
            -webkit-rtl-ordering: logical;
            cursor: text;
            font: 400 13.3333px Arial;
        }

        input:valid {
            outline: none black;
        }

        input[type="text"] {
            height: 38px;
            padding: 0px 5px;
            background-color: #fff;
            border-radius: 4px;
            box-shadow: none;
            box-sizing: border-box;
            -webkit-appearance: none;
        }

        .button, button, input[type="submit"], input[type="reset"], input[type="button"] {
            display: inline-block;
            height: 38px;
            padding: 0 30px;
            color: #555;
            text-align: center;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: .1rem;
            text-transform: uppercase;
            text-decoration: none;
            white-space: nowrap;
            background-color: transparent;
            border-radius: 4px;
            border: 1px solid #bbb;
            cursor: pointer;
            box-sizing: border-box;
        }

        button, .button {
            margin-bottom: 0rem;
        }

        .svg-inline--fa {
            display: inline-block;
            font-size: inherit;
            height: 1em;
            overflow: visible;
            vertical-align: -0.125em;
        }

        svg:not(:root).svg-inline--fa {
            width: 0.875em;
        }

        svg:not(:root).svg-inline--fa {
            overflow: visible;
        }

        .previous-next-container button.previous-page, .previous-next-container button.next-page, .previous-next-container button.first-page, .previous-next-container button.last-page {
            transition-duration: 400ms;
            padding: 5px;
            border: none;
            display: inline-block;
        }        

        .previous-next-container .page-number {
            font-family: monospace;
            display: inline-block;
        }

        .previous-next-container input.current-page {
            display: inline-block;
            border-bottom: solid lightgrey 1px !important;
            color: black;
            border: none;
            width: 40px;
            text-align: center;
            font-family: monospace;
            font-size: 10pt;
            margin: 0.5em;
        }

        .previous-next-container .page-number {
            display: inline-block;
            font-family: monospace;
        }   

        .previous-next-container .page-number .last-page {
            min-width: 30px;
            display: inline-block;
            text-align: center;
            margin: 0.5em;
        }

        `;

        return rtn;
    }

    _drawContents() {
        var _self = this;

        let rtn = `
        <div class="previous-next-container"><button class="first-page"><svg aria-hidden="true" focusable="false"
                    data-prefix="fas" data-icon="angle-double-left" class="svg-inline--fa fa-angle-double-left fa-w-14 "
                    role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path fill="currentColor"
                        d="M223.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L319.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L393.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34zm-192 34l136 136c9.4 9.4 24.6 9.4 33.9 0l22.6-22.6c9.4-9.4 9.4-24.6 0-33.9L127.9 256l96.4-96.4c9.4-9.4 9.4-24.6 0-33.9L201.7 103c-9.4-9.4-24.6-9.4-33.9 0l-136 136c-9.5 9.4-9.5 24.6-.1 34z">
                    </path>
                </svg></button><button class="previous-page"><svg aria-hidden="true" focusable="false" data-prefix="fas"
                    data-icon="angle-left" class="svg-inline--fa fa-angle-left fa-w-8 " role="img"
                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512">
                    <path fill="currentColor"
                        d="M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z">
                    </path>
                </svg></button>
            <div class="page-number"><input type="text" class="current-page" placeholder="1" value=""> / <div class="last-page">1</div>
            </div><button class="next-page"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="angle-right"
                    class="svg-inline--fa fa-angle-right fa-w-8 " role="img" xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 256 512">
                    <path fill="currentColor"
                        d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z">
                    </path>
                </svg></button><button class="last-page"><svg aria-hidden="true" focusable="false" data-prefix="fas"
                    data-icon="angle-double-right" class="svg-inline--fa fa-angle-double-right fa-w-14 " role="img"
                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path fill="currentColor"
                        d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34zm192-34l-136-136c-9.4-9.4-24.6-9.4-33.9 0l-22.6 22.6c-9.4 9.4-9.4 24.6 0 33.9l96.4 96.4-96.4 96.4c-9.4 9.4-9.4 24.6 0 33.9l22.6 22.6c9.4 9.4 24.6 9.4 33.9 0l136-136c9.4-9.2 9.4-24.4 0-33.8z">
                    </path>
                </svg></button>
        </div>
        `;

        return rtn;
    }

    _wireupEvents() {
        var _self = this;
        let firstpage = _self.shadowRoot.querySelector('button.first-page'); firstpage.addEventListener("click", e => { _self._first(e); });
        let lastpage = _self.shadowRoot.querySelector('button.last-page'); lastpage.addEventListener("click", e => { _self._last(e); });
        let prevpage = _self.shadowRoot.querySelector('button.previous-page'); prevpage.addEventListener("click", e => { _self._prev(e); });
        let nextpage = _self.shadowRoot.querySelector('button.next-page'); nextpage.addEventListener("click", e => { _self._next(e); });
        let cpinput = _self.shadowRoot.querySelector('input.current-page'); cpinput.addEventListener('keyup', e => {
            let currentValue = cpinput.value;
      
            let key = (e.charCode && e.charCode !== 0) ? e.charCode : e.keyCode;
            if (_self._triggercodes.includes(key)) {
                _self.currentPage = currentValue;
            //   _self.dispatchEvent(new CustomEvent('TriggerKey', { bubbles: true, composed: true, detail: { sender: _self, value: Object.assign(evntdata, { key }) } }));
            }      
        });
    }

    // #endregion

    // Private events
    _evtdispatch_PageChanged(detail = null) {
        var _self = this;
        let _detail = (detail === null) ? { sender: _self, value: _self.value } : detail;
        _self.dispatchEvent(new CustomEvent('PageChanged', { detail: _detail }));
    }

    _first() {
        var _self = this;
        _self._currentPage = 1;
        let cpinput = _self.shadowRoot.querySelector('input.current-page');
        cpinput.placeholder = _self._currentPage.toString();

        _self._evtdispatch_PageChanged();
    }
    _last() {
        var _self = this;
        _self._currentPage = _self.pages;
        let cpinput = _self.shadowRoot.querySelector('input.current-page');
        cpinput.placeholder = _self._currentPage.toString();

        _self._evtdispatch_PageChanged();
    }
    _prev() {
        var _self = this;
        _self._currentPage = (_self._currentPage <= 2) ? 1 : _self._currentPage - 1;
        let cpinput = _self.shadowRoot.querySelector('input.current-page');
        cpinput.placeholder = _self._currentPage.toString();

        _self._evtdispatch_PageChanged();
    }
    _next() {
        var _self = this; console.log("clicked next")
        _self._currentPage = (_self._currentPage >= _self.pages - 1) ? _self.pages : _self._currentPage + 1;
        let cpinput = _self.shadowRoot.querySelector('input.current-page');
        cpinput.placeholder = _self._currentPage.toString();

        _self._evtdispatch_PageChanged();
    }

    _initprops() {
        var _self = this;
        if (_self.grid.length > 0) {
            let grid = document.querySelector(`#${_self.grid}`);
            if (grid !== null && grid["items"] && Array.isArray(grid["items"])) {
                _self._numItems = grid["items"].length;
            }
        }
        let _lpdiv = _self.shadowRoot.querySelector('div.last-page'); _lpdiv.innerHTML = _self.pages;

    }

    // Pubilc methods


    // Public properties
    get ready() { // <-- returns promise that is resolved after control is initialized
        var _self = this;
        return _self._initialized;
    }

    get currentPage() {
        var _self = this;
        return _self._currentPage;
    }

    set currentPage(val) {
        var _self = this; 
        let cpinput = _self.shadowRoot.querySelector('input.current-page');
        let _val = val; 
        if (typeof val === "string") {
            if (!Number.isNaN(parseInt(val))) {
                _val = parseInt(val);
                _val = (_val < 1) ? 1 : (_val > _self.pages) ? _self.pages : _val;    
            } else {
                cpinput.value = "";
                return;
            }
        } 

        _self._currentPage = _val;
        cpinput.setAttribute('placeholder', _val);
        cpinput.value = "";

        _self._evtdispatch_PageChanged();
    }

    get pages() {
        var _self = this;
        return (_self.numItems === 0) ? 1 : Math.floor(_self.numItems / _self.pagesize) + 1 * (_self.numItems % _self.pagesize > 0);
    }

    get value() {
        var _self = this;
        let _start = (_self.currentPage - 1) * _self.pagesize;
        let _end = (_self.currentPage === _self.pages) ? _self.numItems : _self.pagesize * _self._currentPage;
        return { start: _start, end: _end - 1, currentPage: _self.currentPage, pagesize: _self.pagesize };
    }

    get numItems() {
        var _self = this;
        return _self._numItems;
    }

    set numItems(val) {
        var _self = this;
        _self._numItems = val;
        _self._initprops();
    }

}

// Register the element with the browser
customElements.define('pkc-pager', PkcPager);
