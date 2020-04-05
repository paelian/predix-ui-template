// Import LitElement base class and html helper function
import { LitElement, html } from 'lit-element';
import { DomHelperMixin } from '../../../pkc-common/src/domHelperMixin';
import { defer } from '../../../pkc-common/src/defer';
import { default as Muuri } from 'muuri/src/index';
import { relativeTimeThreshold } from 'moment';

export class MuuriGrid extends DomHelperMixin(LitElement) {

    static get properties() {
        return {
            containers: {
                type: Object
            }
        };
    }

    constructor() {
        super();

        this._initialized = defer();

        this._grid = null;
        this._gridDragEnabled = false;

        // Initialize properties
        this.containers = null;
    }

    render() {
        var _self = this;
        // console.log("........render called")
        _self.styleTag = this._defaultStyle();
        let container = this._createElement('div', { id: 'grid', class: 'container muuri-grid' });

        container.innerHTML = _self._createContainer();

        setTimeout(() => {
            let promises = [
            ];
            Promise.all(promises).then(() => {
                this._initialized.resolve();

                this._grid = new Muuri(container, {
                    dragEnabled: true,
                    dragStartPredicate: (item, e) => { return _self._gridDragEnabled && e.srcEvent.path[0].classList.contains('drag-handle'); },
                    //dragSortPredicate:  (item, e) => { console.log("sort predicate", item, e); return false; },
                    // dragAxis: 'y'
                });

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

        let computedStyles = '';

        [...Object.keys(_self.containers)].forEach((containerKey, i) => {
            let _container = _self.containers[containerKey];
            let _width = (_container && _container.width) ? _container.width : 100;
            let _height = (_container && _container.height) ? _container.height : 100;
            let template = `
                div.item.${containerKey} {
                    width: ${_width};
                    height: ${_height};
                    max-width: ${_width};
                    max-height: ${_height};
                    overflow: hidden;
                }
            `;
            computedStyles += template;
        });

        let rtn = this._createElement('style', {},
            `
                div.container {
                    width: 100%;
                    height: 100%;
                }

                .muuri-grid {
                    position: relative;
                }

                .item {
                    display: block;
                    position: absolute;
                    width: 100px;
                    height: 100px;
                    margin: 5px;
                    z-index: 1;
                    border: var(--panel-border, 1px solid #707070);
                }

                .item.muuri-item-dragging {
                    z-index: 3;
                }

                .item.muuri-item-releasing {
                    z-index: 2;
                }

                .item.muuri-item-hidden {
                    z-index: 0;
                }

                .item-content {
                    position: relative;
                    width: 100%;
                    height: 100%;

                    display: flex;
                    flex-direction: column;
                }

                .item1 {
                    width: 600px;
                    height: 400px;
                }

                .item2{
                    width: 300px;
                    height: 200px;
                }

                div.drag-handle {
                    height: 15px;
                    background-color: var(--drag-handle-color, #707070);
                    cursor: grab;
                }

                div.drag-handle.disabled {
                    height: 0px;
                }

                div.drag-container {
                    flex: 1 1 auto;
                }      

                div.borderShadow
                {
                    -webkit-box-shadow: 3px 3px 5px rgba(8, 8, 8, 0.5);
                    -moz-box-shadow: 3px 3px 5px rgba(8, 8, 8, 0.5);
                    box-shadow: 3px 3px 5px rgba(8, 8, 8, 0.5);
                }

        ` + computedStyles);

        return rtn;
    }

    _createContainer(options = null) {
        var _self = this;

        let _options = Object.assign({}, options);

        let rtn = '';
        [...Object.keys(_self.containers)].forEach((containerKey, i) => {
            rtn += `
            <div class="item ${containerKey}">
                <div class="item-content">
                    <div id='dragHandle' class='drag-handle disabled'>&nbsp;</div>
                    <div class='drag-container map-container'>
                        <slot name="${containerKey}"></slot>
                    </div>
                </div>
            </div> 
            `;
        });
        return rtn;
    }

    // #endregion

    // Pubilc methods


    // Public properties
    get ready() { // <-- returns promise that is resolved after control is initialized
        var _self = this;
        return _self._initialized;
    }

    get enableDrag() {
        var _self = this;
        return _self._gridDragEnabled;
    }

    set enableDrag(flag = true) {
        var _self = this;
        _self._gridDragEnabled = flag;

        let _handleObj = _self.shadowRoot.querySelectorAll('div.drag-handle');
        [..._handleObj].forEach(handle => {
            if (flag) {
                handle.classList.remove('disabled');
                handle.parentElement.classList.add('borderShadow');
            } else {
                handle.classList.add('disabled');
                handle.parentElement.classList.remove('borderShadow');
            }
        });

        setTimeout(() => {
            let evt = flag ? 'DragEnabled' : 'DragDisabled';
            _self.sizeContainer();
            _self.dispatchEvent(new CustomEvent(evt, { detail: { sender: _self } }));
        }, 50);
    }

    get gridHeight() {
        var _self = this;
        let gridcontainer = _self.shadowRoot.querySelector('div#grid');

        return gridcontainer;
    }

    sizeContainer() {
        var _self = this;

        _self._initialized.then(() => {
            let gridcontainer = _self.shadowRoot.querySelector('div#grid');
            gridcontainer.style.height = 'calc(100% - 10px)';
            _self._grid.refreshItems().layout();
        });

    }
}

// Register the element with the browser
customElements.define('muuri-grid', MuuriGrid);
