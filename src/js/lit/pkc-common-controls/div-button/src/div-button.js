
// Import LitElement base class and html helper function
import { LitElement, html } from 'lit-element';
import { DomHelperMixin } from '../../../pkc-common/src/domHelperMixin';
import { Icon } from '@material/mwc-icon';

export class DivButton extends DomHelperMixin(LitElement) {
  /**
   * Define properties. Properties defined here will be automatically 
   * observed.
   */
  static get properties() {
    return {
      text: {
          type: String
      },
      dropshadow: {
          type: String
      },
      icon: {
        type: String
      }
    };
  }

  constructor() {
    super();

    // Initialize properties
    this.text = 'button';
    this.dropshadow = 'true';
    this.icon = '';
  }

  /**
   * Define a template for the new element by implementing LitElement's
   * `render` function. `render` must return a lit-html TemplateResult.
   */
  render() {
    var _self = this;
    // console.log("........render called")
    _self.styleTag = this._defaultStyle()
    let divButton = this._createElement('div', { class: 'divButton' });
    
    let iconcontainer = this._createElement('div', { id: 'iconcontainer' });
    let icon = this._createElement('mwc-icon', { id: 'icon', class: 'hidden' });
    iconcontainer.append(icon);
    if (this.icon.length > 0) {
      icon.innerText = this.icon;
      divButton.appendChild(iconcontainer);
    }
    
    let buttonText = this._createElement('div', { class: 'buttonText' });
    buttonText.innerHTML = this.text;

    divButton.addEventListener('click', (e) => { _self.dispatchEvent(new CustomEvent('Clicked', { detail: { buttonText: _self.text } })); });
    
    divButton.appendChild(buttonText);

    setTimeout(() => {
      if (this.icon.length > 0) {
        icon.classList.remove('hidden');
      }
    }, 100);

    return html`
      ${this.styleTag}
      ${divButton}
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
    var shadowCss = `
        -webkit-border-radius:4px;
        -moz-border-radius:4px;
        -webkit-box-shadow: 3px 3px 5px rgba(8,8,8,0.5);
        -moz-box-shadow: 3px 3px 5px rgba(8,8,8,0.5);
        box-shadow: 3px 3px 5px rgba(8,8,8,0.5);
    `;
    return this._createElement('style', {},
      `
      div.divButton {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-content: center;
        height: var(--height, 28px); 
        width: var(--width, 78px);
        border: var(--border, 1px solid #333);
        border-radius: var(--border-radius, 4px);
        background-color: var(--background-color, #ccc);
        overflow: hidden;
        color: var(--color, #000);
        font-size: var(--font-size, inherit);
        ${(this.dropshadow.toLowerCase() === 'true') ? shadowCss : ''}
      }
      
      div.divButton:hover {
        cursor: pointer;
        background-color: var(--background-color-hover, #ccc);
        color: var(--color-hover, #000);
      }
      
      div.divButton > div.buttonText {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-content: center;
        overflow: hidden;
      }

      mwc-icon {
        --mdc-icon-size: 14px;
        color: var(--color, #000);
        margin-right: 2px;
        margin-bottom: 2px;
      }

      mwc-icon.hidden {
        visibility: hidden;
      }

      div#iconcontainer {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-content: center;
        overflow: hidden;
      }


    `);
  }

}

// Register the element with the browser
customElements.define('div-button', DivButton);
