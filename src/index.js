import Component  from '@wide/modulus/lib/component'
import hotkeys    from 'hotkeys-js'
import './data-open'


/**
 * Default elements selectors to interact with
 * @type {Object<string, String>}
 */
export const DEFAULT_SELECTORS = {
  close: '[data-modal\\.close]'
}

/**
 * Default elements CSS classes
 * @type {Object<string, String>}
 */
export const DEFAULT_CLASSLIST = {
  open:   '-open',
  active: '-active'
}

/**
 * Main focusable selector
 * @type {String}
 */
export const FOCUSABLE_PRIORITY = '[data-focus]'

/**
 * Focusable element selectors
 * @type {String}
 */
export const FOCUSABLES = 'button:not([data-modal\\.close]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), button[data-modal\\.close]'


/**
 * Modal Component
 */
export default class Modal extends Component {


  /**
   * Initialize component
   * @param {Object} cfg
   * @param {Object<string, String>} cfg.classlist
   * @param {Object<string, String>} cfg.selectors
   */
  run({ classlist, selectors } = {}) {

    /**
     * Elements selectors to interact with
     * @type {Object<string, String>}
     */
    this.selectors = Object.assign({}, DEFAULT_SELECTORS, selectors)

    /**
     * Elements CSS classes
     * @type {Object<string, String>}
     */
    this.classlist = Object.assign({}, DEFAULT_CLASSLIST, classlist)

    /**
     * Wether the modal is open or not
     * @type {Boolean}
     */
    this.isOpen = false

    /**
     * Element who open the modal, will be refocused on close
     * @type {HTMLElement}
     */
    this.src = null

    /**
     * Elements who open or close the modal on click
     * @type {Array<HTMLElement>}
     */
    this.togglers = this.children(this.selectors.close)

    // trap focus when open
    document.addEventListener('focus', e => this.trapFocus(e), true)

    // close en button click or backdrop click
    for(let i = this.togglers.length; i--;) {
      this.togglers[i].addEventListener('click', e => this.close())
    }

    // close on ESC keydown
    hotkeys('esc', e => this.close())
  }


  /**
   * Open modal
   * @param {HTMLElement} src
   */
  open(src) {

    // ignore if already open
    if(this.isOpen) return;
    this.isOpen = true
    this.src = src

    // open modal
    this.el.classList.add(this.classlist.open)
    setTimeout(() => this.el.classList.add(this.classlist.active), 25)

    // spread event
    this.el.dispatchEvent(new CustomEvent('modal.open'))
    this.emit('scroll.lock', this.child('[data-modal\\.content]'))

    // set focus inside modal
    this.setInnerFocus()
  }


  /**
   * Close modal
   */
  close() {

    // ignore if already close
    if(!this.isOpen) return;
    this.isOpen = false

    // close modal
    this.el.classList.remove(this.classlist.active)
    setTimeout(() => {

      this.el.classList.remove(this.classlist.open)

      // spread event
      this.el.dispatchEvent(new CustomEvent('modal.close'))
      this.emit('scroll.unlock')

      if(this.src) {
        this.src.focus()
        this.src = null
      }
    }, 400)
  }


  /**
   * Set focus on the main focusable element or first focusable element
   */
  setInnerFocus() {
    // Get main focusable element if defined
    const focusable = this.el.querySelector(FOCUSABLE_PRIORITY)
    if(focusable) {
      focusable.focus()
    } else {
      // Or get first focusable element
      const focusables = this.el.querySelectorAll(FOCUSABLES)
      if(focusables.length) {
        focusables[0].focus()
      }
    }
  }


  /**
   * Keep focus inside modal while it's open
   * @param {Event} e
   */
  trapFocus(e) {
    if(this.isOpen && e.target !== this.el && !this.el.contains(e.target)) {
      e.preventDefault()
      this.setInnerFocus()
      return false
    }
  }


  /**
   * Clear component
   */
  destroy() {
    document.removeEventListener('focus', e => this.trapFocus(e), true)
    hotkeys.unbind('esc', e => this.close())
  }

}
