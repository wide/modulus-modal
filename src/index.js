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
     * Handlers for events
     * @type {Object<string, Object>}
     */
    this.handlers = {
      addFocusEvent: this.addFocusEvent.bind(this),
      close: this.close.bind(this),
      removeFocusEvent: this.removeFocusEvent.bind(this),
      trapFocus: this.trapFocus.bind(this)
    }

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

    // close on button click or backdrop click
    for(let i = this.togglers.length; i--;) {
      this.togglers[i].addEventListener('click', this.handlers.close)
    }

    // close on ESC keydown
    hotkeys('esc', this.handlers.close)

    // event for destroy focus 
    this.on('modal.removeFocusEvent', this.handlers.removeFocusEvent)

    // event in case it is the last open modal
    this.el.addEventListener('modal.last-opened', this.handlers.addFocusEvent)
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

    // added opening timestamp
    this.el.setAttribute('data-modal.open-time', new Date().getTime())

    // open modal
    this.el.classList.add(this.classlist.open)
    setTimeout(() => this.el.classList.add(this.classlist.active), 25)

    // spread event
    this.el.dispatchEvent(new CustomEvent('modal.open'))
    this.emit('modal.removeFocusEvent')
    this.emit('scroll.lock', this.child('[data-modal\\.content]'))

    // trap focus when open
    this.addFocusEvent()

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

    // remove opening timestamp
    this.el.removeAttribute('data-modal.open-time')

    // close modal
    this.removeFocusEvent()
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

    this.emitLastOpenedModal()
  }


  /**
   * Emit an event to the last modal that is still open so that it
   * can perform some actions necessary for its proper functioning
   */
   emitLastOpenedModal() {
    const modalsOpened = [...document.querySelectorAll('[data-modal\\.open-time]')]

    if(modalsOpened?.length) {
      const el = modalsOpened?.reduce(
        (previous, current) => previous.getAttribute('data-modal.open-time') > current.getAttribute('data-modal.open-time')
          ? previous
          : current
      )
      el?.dispatchEvent(new CustomEvent('modal.last-opened'))
    }
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
   * Add the `focus` event from the document
   */
   addFocusEvent() {
    document.addEventListener('focus', this.handlers.trapFocus, true)
  }


  /**
   * Remove the `focus` event from the document
   */
  removeFocusEvent() {
    document.removeEventListener('focus', this.handlers.trapFocus, true)
  }


  /**
   * Clear component
   */
  destroy() {
    this.removeFocusEvent()

    this.off('modal.removeFocusEvent', this.handlers.removeFocusEvent)
    this.el.removeEventListener('modal.last-opened', this.handlers.addFocusEvent)
  
    // remove listener on button click or backdrop click
    for(let i = this.togglers.length; i--;) {
      this.togglers[i].removeEventListener('click', this.handlers.close)
    }

    // unbind close on ESC keydown
    hotkeys.unbind('esc', this.handlers.close)
  }

}
