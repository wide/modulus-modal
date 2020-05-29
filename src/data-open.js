import observe from '@wide/dom-observer'
import { seek } from '@wide/modulus'
import Modal from './index'

/**
 * Observer openers outside of modal
 */
observe('[data-modal]', {
  bind: el => {
    el.addEventListener('click', e => {
      const target = seek(el.dataset.modal)
      if(target instanceof Modal) target.open()
    })
  }
})