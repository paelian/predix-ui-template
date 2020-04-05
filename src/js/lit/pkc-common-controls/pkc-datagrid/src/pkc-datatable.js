
// Import LitElement base class and html helper function
import { LitElement, html } from 'lit-element';
import { DomHelperMixin } from '../../../pkc-common/src/domHelperMixin';
import { defer } from '../../../pkc-common/src/defer';

export class PkcDatatable extends DomHelperMixin(LitElement) {
    /**
     * Define properties. Properties defined here will be automatically 
     * observed.
     */
    static get properties() {
        return {
            definition: {
                type: Object
            },
            data: {
                type: Array
            },
            usepapercells: {
                type: Boolean
            }
        };
    }

    constructor() {
        super();

        this._initialized = defer();
        this._data = new Map();

        this._defaultColumnStyle = {
            "--width": "200px"
        };

        // Initialize properties
        this.definition = {
            // if columns are excluded, an attempt will be made to extract the definition from the first row of data provided
            // columns: [
            //     { id: 1, label: "one", style: { "--width": "250px", "--padding-left": "10px" } },
            //     { id: 2, label: "two", style: { "--width": "200px" } },
            //     { id: 3, label: "three", style: { "--width": "150px" } }
            // ],
            headerstyle: { "--justify-content": "center", "--border-color": "rgba(0,0,0,0)", "text-decoration": "underline", "background-color": "#eee" },
            alternatingstyle: [{ "--background-color": "inherit", "--border-width": "1px" },{"--background-color": "inherit", "--border-width": "1px"}]
        };
        this.data = [
            { one: "1.1", two: "2.2", three: "3.3", four: "4.4" },
            { one: "1.2", two: "2.4", three: "3.6", four: "4.8" },
            { one: "1.3", two: "2.6", three: "3.9", four: "4.12" },
            { one: "1.4", two: "2.8", three: "3.12", four: "4.16" },
            { one: "1.1", two: "2.2", three: "3.3", four: "4.4" },
            { one: "1.2", two: "2.4", three: "3.6", four: "4.8" },
            { one: "1.3", two: "2.6", three: "3.9", four: "4.12" },
            { one: "1.4", two: "2.8", three: "3.12", four: "4.16" },
            { one: "1.1", two: "2.2", three: "3.3", four: "4.4" },
            { one: "1.2", two: "2.4", three: "3.6", four: "4.8" },
            { one: "1.3", two: "2.6", three: "3.9", four: "4.12" },
            { one: "1.4", two: "2.8", three: "3.12", four: "4.16" },
            { one: "1.1", two: "2.2", three: "3.3", four: "4.4" },
            { one: "1.2", two: "2.4", three: "3.6", four: "4.8" },
            { one: "1.3", two: "2.6", three: "3.9", four: "4.12" },
            { one: "1.4", two: "2.8", three: "3.12", four: "4.16" },
            { one: "1.1", two: "2.2", three: "3.3", four: "4.4" },
            { one: "1.2", two: "2.4", three: "3.6", four: "4.8" },
            { one: "1.3", two: "2.6", three: "3.9", four: "4.12" },
            { one: "1.4", two: "2.8", three: "3.12", four: "4.16" },
            { one: "1.1", two: "2.2", three: "3.3", four: "4.4" },
            { one: "1.2", two: "2.4", three: "3.6", four: "4.8" },
            { one: "1.3", two: "2.6", three: "3.9", four: "4.12" },
            { one: "1.4", two: "2.8", three: "3.12", four: "4.16" },
        ];

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
        let container = this._createElement('div', { id: 'container', class: `container` });

        let _cols = []; 
        if (!_self.definition.columns && _self.data.length > 0) {
            Object.keys(_self.data[0]).forEach((key, i) => {
                let _col = { id: i, label: key, style: _self._defaultColumnStyle };
                _cols.push(_col);
            });
        } else {
            _cols = JSON.parse(JSON.stringify(_self.definition.columns));
        }
        let headerrow = _self._drawRow('hdr', _cols, _self.data[0], null, true);
        container.appendChild(headerrow);
        _self.data.forEach((datarow, i) => {
            let row = _self._drawRow(i, JSON.parse(JSON.stringify(_cols)), datarow, (_self.definition.alternatingstyle) ? _self.definition.alternatingstyle[(i % 2 > 0) ? 1 : 0] : null);
            container.appendChild(row);
        });

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
                    width: var(--table-width, 650px);
                    max-width: var(--table-width, 650px);
                    height: var(--table-height, 500px);
                    max-height: var(--table-height, 500px);
                    position: relative;
                    background-color: var(--background-color, #eee);
                    display: flex;
                    flex-direction: column;
                    overflow: auto;
                }

                pkc-datarow {
                    z-index: 0;
                }
                pkc-datarow.header {
                    position: -webkit-sticky; /* Safari */
                    position: sticky;
                    top: 0;
                    z-index: 101;
                }

            `
        );
    }

    _drawRow(id, cols, datarow, colstyleoverride = null, isheader = false) {
        var _self = this

        let row = _self._createElement('pkc-datarow', { id: `pkcdr_${id}`, class: `${isheader ? 'header' : ''}` });
        let _data = [];
        for(let col of cols) {
            if (colstyleoverride !== null) {
                col.style = Object.assign({}, col.style, colstyleoverride);
            }
            _data.push([col.id, datarow[col.label]]);
        }
        row.definition = Object.assign(JSON.parse(JSON.stringify(_self.definition)), { columns: cols });
        if (row.definition.alternatingstyle) delete row.definition.alternatingstyle;
        if (isheader) row.isheader = true;
        if (_self.usepapercells) row.usepapercells = true;
        row.data = _data;

        return row;
    }
    // #endregion


    // Public methods



}

// Register the element with the browser
customElements.define('pkc-datatable', PkcDatatable);
