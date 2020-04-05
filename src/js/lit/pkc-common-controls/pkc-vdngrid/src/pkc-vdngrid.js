// Import LitElement base class and html helper function
import { LitElement, html } from 'lit-element';
import { DomHelperMixin } from '../../../pkc-common/src/domHelperMixin';
import { defer } from '../../../pkc-common/src/defer';
import { Icon } from '@material/mwc-icon';

export class PkcVdngrid extends DomHelperMixin(LitElement) {

    static get properties() {
        return {
            pagesize: {
                type: Number
            },
            items: {
                type: Array
            },
            title: {
                type: String
            },
            definitions: {
                type: Array
            },
            autodefinecolumns: {
                type: String
            },
            autocolumntemplate: {
                type: String
            },
            autoexcludekeys: {
                type: Array
            },
            downloadcsvfilename: {
                type: String
            },
            showdownloadbutton: {
                type: String
            },
            showsearch: {
                type: String
            }
        };
    }

    constructor() {
        super();

        this._initialized = defer();

        this._sorteditems = [];

        // Initialize properties
        this.pagesize = 50;
        this.items = [];
        this.definitions = [];
        this.autodefinecolumns = 'true';
        this.autoexcludekeys = [];
        this.downloadcsvfilename = 'grid_data';
        this.showdownloadbutton = 'true';
        this.autocolumntemplate = '<vaadin-grid-sort-column width="12em" path="${key}" header="${key.toUpperCase().replace(/_/g,\' \')}"></vaadin-grid-sort-column>';
        this.showsearch = 'false';
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
                let pager = _self.shadowRoot.querySelector('pkc-pager');
                pager.numItems = _self.items.length;
                pager.addEventListener("PageChanged", e => {
                    _self._bind_data();
                });

                let gridTools = _self.shadowRoot.querySelector('pdx-menubar#gridTools');
                gridTools.showmenubutton = false;
                gridTools.addEventListener('ItemSelected', e => {
                    switch (e.detail.value.label) {
                        default: // "Download CSV"
                            _self._evtdispatch_DownloadSelected();
                            csvlib.exportCSVFile(_self._get_grid_CSVData(), _self.downloadcsvfilename);

                    }
                });

                let searchbox = _self.shadowRoot.querySelector('field-text#search');
                searchbox.addEventListener('FieldTextButtonClicked', e => {
                    _self._evtdispatch_SearchFilterChanged();
                });
                searchbox.addEventListener('TriggerKey', e => {
                    switch (e.detail.value.key) {
                        case 27: // esc
                            e.detail.sender.setValue('');
                            break;
                        default: 
                            _self._evtdispatch_SearchFilterChanged({sender: _self, value: searchbox.value});
                            break;
                    }
                });
        

                _self.shadowRoot.querySelectorAll("vaadin-grid-sort-column").forEach(el => el.addEventListener("direction-changed", e => {
                    console.log("column sort triggered", e);
                    let grid = _self.shadowRoot.querySelector('vaadin-grid');
                    _self._sorteditems = ext.ArrayMultisort.from(JSON.parse(JSON.stringify(_self.items)));
                    if (Array.isArray(grid._sorters) && grid._sorters.length > 0) {
                        let sortphrases = [];
                        grid._sorters.forEach(sorter => {
                            sortphrases.push(`${sorter.path}${(sorter.direction === 'desc') ? '-' : ''}`);
                        });
                        _self._sorteditems.sortBy(...sortphrases);
                    }
                    _self._bind_data();
                }));

                _self._sorteditems = ext.ArrayMultisort.from(JSON.parse(JSON.stringify(_self.items)));
                _self._bind_data();

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
                    width: var(--width, 100%);
                    height: var(--height, 100%);
                    position: relative;      
                }

                div.contents {
                }

                ${_self._style_vdngrid()}

                div.headerbar {
                    height: 30px;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
            
                div.headerbar div.grid-header {
                    font-weight: bold;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
            
                div.headerbar div.toolbar {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                }
            
                div.toolbar.hidden {
                    visibility: hidden;
                }

                vaadin-grid {
                    height: calc(100% - 40px);                    
                }
        
                div.recordCount {
                    margin-left: 10px;
                }
                
                div.pagerContainer {
                    height: 40px;
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                    background-color: #fff;
                }

                pdx-menubar {
                    --background-color: #fff;
                }
            
                field-text#search {
                    --height: 25px;
                    --border: none;
                    margin-left: 5px;
                }
        `);

        return rtn;
    }

    _style_vdngrid() {
        let rtn = `
        

        `;

        return rtn;
    }

    _drawContents(container) {
        var _self = this;

        let header = `
        <div class="headerbar">
            <div class="grid-header">${_self.title}</div>
            <div class="toolbar ${(_self.showdownloadbutton.toLowerCase() === 'true') ? '' : 'hidden'}">
                <field-text id="search" placeholder="Search..." updatedeadbandms=1500 showbutton="true" showlabel="false" class="${(_self.showsearch.toLowerCase() === 'true') ? '' : 'hidden'}"></field-text>
                <pdx-menubar id="gridTools"
                    rightbuttons='[{"id":1,"label":"Download CSV","icon":"archive"}]'></pdx-menubar>
            </div>
        </div>        
        `;

        let grid = _self._createElement('vaadin-grid', { id: 'grid', class: '', theme: 'row-dividers' });
        grid.setAttribute("multi-sort", true);
        grid.setAttribute("column-reordering-allowed", true);
        grid.pageSize = _self.pagesize;
        grid.addEventListener("active-item-changed", e => {
            let item = e.detail.value;
            grid.selectedItems = item ? [item] : [];
            _self._evtdispatch_ItemSelected({ sender: grid, value: item });
        });

        if (_self.autodefinecolumns === 'true' && _self.items.length > 0) {
            Object.keys(_self.items[0]).forEach(key => {
                if (!_self.autoexcludekeys.includes(key)) {
                    let col = eval("`" + _self.autocolumntemplate + "`");
                    grid.innerHTML = grid.innerHTML + col;
                }
            });
        }

        let pagerContainer = _self._createElement('div', { class: 'pagerContainer' });
        let recordCountLabel = _self._createElement('div', { class: 'recordCount' });
        recordCountLabel.innerHTML = `${_self.items.length} record${_self.length === 1 ? '' : 's'}.`;
        let pager = _self._createElement('pkc-pager', { id: 'pager', grid: 'grid', pagesize: _self.pagesize });
        pagerContainer.appendChild(recordCountLabel);
        pagerContainer.appendChild(pager);

        container.innerHTML = header;
        container.appendChild(grid);
        container.appendChild(pagerContainer);
    }

    _get_grid_headermap() {
        var _self = this;

        let grid = _self.shadowRoot.querySelector("vaadin-grid");
        let cols = grid._getColumns().filter(el => el.localName === "vaadin-grid-sort-column").map(el => {
            return {
                id: el.attributes.path.value,
                label: el.attributes.header.value
            };
        });
        let headermap = {};
        cols.forEach(col => {
            headermap[col.id] = col.label;
        });
        return headermap;
    }

    _get_grid_CSVData() {
        var _self = this;
        let grid = _self.shadowRoot.querySelector("vaadin-grid");
        let headers = _self._get_grid_headermap();
        let rtn = [headers];
        _self._sorteditems.forEach(el => {
            let _item = {};
            Object.keys(headers).forEach(hdr => {
                _item[hdr] = (el[hdr] === null) ? "" : el[hdr].toString();
            });
            rtn.push(_item);
        });
        return rtn;
    }

    // #endregion

    // Private events
    _evtdispatch_DownloadSelected(detail = null) {
        var _self = this;
        let _detail = (detail === null) ? { sender: _self } : detail;
        _self.dispatchEvent(new CustomEvent('DownloadSelected', { detail: _detail }));
    }
    _evtdispatch_ItemSelected(detail = null) {
        var _self = this;
        let _detail = (detail === null) ? { sender: _self, value: _self.selectedItems } : detail;
        _self.dispatchEvent(new CustomEvent('ItemSelected', { detail: _detail }));
    }
    _evtdispatch_SearchFilterChanged(detail = null) {
        var _self = this;
        let _detail = (detail === null) ? { sender: _self, value: _self.value } : detail;
        _self.dispatchEvent(new CustomEvent('SearchFilterChanged', { detail: _detail }));
    }

    _bind_data() {
        var _self = this;
        let grid = _self.shadowRoot.querySelector("vaadin-grid");
        let pager = _self.shadowRoot.querySelector('pkc-pager');

        let page = pager.value;
        grid.items = _self._sorteditems.slice(page.start, page.end + 1); // slice is end exclusive, need to increment end by 1 to include it
    }
    
    // Pubilc methods
    clearSelection() {
        var _self = this;
        let grid = _self.shadowRoot.querySelector('vaadin-grid');
        grid.selectedItems = [];
    }

    setItems(list, resetFilter = false) {
        var _self = this;
        let filter = _self.filter;
        _self.items = list;
        if (filter.length > 0) {
            _self.ready.then(() => {
                _self.filter = filter;
            });
        }

    }

    // Public properties
    get ready() { // <-- returns promise that is resolved after control is initialized
        var _self = this;
        return _self._initialized;
    }

    get selectedItems() {
        var _self = this;
        let grid = _self.shadowRoot.querySelector('vaadin-grid');
        return grid.selectedItems;
    }

    get filter() {
        var _self = this;
        let searchbox = _self.shadowRoot.querySelector('field-text#search');
        return searchbox.value;
    }

    set filter(val) {
        var _self = this;
        let searchbox = _self.shadowRoot.querySelector('field-text#search');
        searchbox.setValue(val);
    }

}

// Register the element with the browser
customElements.define('pkc-vdngrid', PkcVdngrid);
