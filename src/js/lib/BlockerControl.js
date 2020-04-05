import { EmitterBase } from './emitterBase';

'use strict';

// depends on ../jquery/plugins/jquery.blockui.js
// depends on ./bower_components/pxa-common-libs/EmitterBase.html

export class BlockerControl extends EmitterBase {
    constructor(elementToBlock = null, objSettings = {}) {
        super();

        this.theBlocker = null;
        this.blocker_fadeInOpacity = 0.7;
        this.blockerCss = {
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            zIndex: 1001,
            border: 'none',
            backgroundColor: '#777',
            opacity: 0,
            display: 'flex',
            flexDiraction: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        };

        let caption = 'Please wait...';
        let defaultSettings = {
            blockTarget: null,
            message: `<div id="PageProcessWorker_BlockerMessage">${caption}</div>`,
            css: {
                border: 'none',
                padding: '15px',
                backgroundColor: '#000',
                '-webkit-border-radius': '10px',
                '-moz-border-radius': '10px',
                color: '#fff',
                width: '250px',
                textAlign: 'center'
            }
        };
        this.__settings = Object.assign(defaultSettings, objSettings);

        this._isopen = false;

        let _blockedElement = !elementToBlock ? document.getElementsByTagName('body')[0] : elementToBlock;
        this.blockedElement = (typeof _blockedElement === 'string') ?
            document.getElementById(_blockedElement) ||
            document.getElementsByClassName(_blockedElement)[0] ||
            document.getElementsByTagName(_blockedElement)[0] ||
            document.getElementsByName(_blockedElement)[0] : _blockedElement;
    }

    // Private methods
    _blockElement() {
        var _self = this;
        _self.theBlocker = document.createElement('div');
        Object.keys(_self.blockerCss).forEach(el => {
            _self.theBlocker.style[el] = _self.blockerCss[el];
        });

        // let blockerMessage = document.createElement('div');
        let blockerMessage = _self._createElementFromHTML(_self.__settings.message);
        Object.keys(_self.__settings.css).forEach(el => {
            blockerMessage.style[el] = _self.__settings.css[el];
        });
        _self.theBlocker.appendChild(blockerMessage);
        _self.blockedElement.appendChild(_self.theBlocker);

        var s = _self.theBlocker.style;
        var fadeIn = () => {
            let _op = Number.parseFloat(s.opacity);
            if ((_op += .1) < _self.blocker_fadeInOpacity) {
                s.opacity = _op;
                setTimeout(fadeIn, 40);
            }
            else {
                _self._e_block();
            }
        };
        fadeIn();
    }
    _unblockElement() {
        var _self = this;

        // var s = _self.theBlocker.style;
        // var fade = () => {
        //     if ((s.opacity -= .1) >= 0) {
        //         setTimeout(fade, 40);
        //     }
        //     else {
        //         if (_self && _self.blockedElement && _self.theBlocker) {
        //             _self.blockedElement.removeChild(_self.theBlocker);
        //         }
        //         _self._e_unblock();
        //     }
        // };
        // fade();
        _self.blockedElement.removeChild(_self.theBlocker);
        _self._e_unblock();
    }

    _e_block() {
        var _self = this;
        _self.emit('BlockerActivated');
    }
    _e_unblock() {
        var _self = this;
        _self.emit('BlockerDeactivated');
    }
    _createElementFromHTML(htmlString) {
        var div = document.createElement('div');
        div.innerHTML = htmlString.trim();

        // Change this to div.childNodes to support multiple top-level nodes
        return div.firstChild;
    }

    // Public methods
    show() {
        var _self = this;
        try {
            _self._isopen = true;
            _self._blockElement();
            return null;
        } catch (e) {
            return e;
        }
    }

    hide() {
        var _self = this;
        try {
            _self._isopen = false;
            _self._unblockElement();
            return null;
        } catch (e) {
            return e;
        }
    }

    get isOpen() {
        var _self = this;
        return _self._isopen;
    }
}

