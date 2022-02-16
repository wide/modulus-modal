# Modulus Modal

Enhanced modal component, to be used with `@wide/modulus`.


## Install

```
npm install @wide/modulus-modal --save
```


## Usage

Register this component using `Modulus`:
```js
import modulus from '@wide/modulus'
import Modal from '@wide/modulus-modal'

modulus.component('modal', Modal)
```

Import base `scss` styles:
```scss
@use '@wide/modulus-modal';
```

And use the provided `twig` template:
```twig
{% embed '@wide::modulus-modal' with { id: 'modalOne' } %}
  {% block content %}
    HEY!
  {% endblock %}
{% embed %}
```

Or build your own `html`:
```html
<div class="modal" role="dialog" id="modalOne" is="modal">
  <div class="modal_body">
    <button class="modal_close" data-modal.close></button>
    <div class="modal_content" data-modal.content>
      HEY!
    </div>
  </div>
  <div class="modal_backdrop" data-modal.close></div>
</div>
```


## Open modal

To open the modal from a button:
```html
<button data-modal="modalOne">Open Modal One</button>
```

To open the modal programmatically:
```js
// By component's type

import { seek } from '@wide/modulus'

seek('modal').open()
```
Or :
```js
// By component's id

document.getElementById('modalOne').__component.open()
```


## Default focused element

To choose which element will be focused when opening, add `data-focus` attribute:
```html
<button class="btn-primary" data-focus>Confirm</button>
```

By default, if there is no `data-focus` attribute defined, the first element of type above will be focused.

 - `button` (excluding close button)
 - `a` (with `[href]` attribute)
 - `input`
 - `select`
 - `textarea`
 - Element with `[tabindex]` attribute (with value different of `[tabindex="-1"]`)
 - Close button


## Libraries

This package uses :
- [`hotkeys-js`](https://github.com/jaywcjlove/hotkeys)


## Authors

- **Aymeric Assier** - [github.com/myeti](https://github.com/myeti)
- **Julien Martins Da Costa** - [github.com/jdacosta](https://github.com/jdacosta)


## License

This project is licensed under the MIT License - see the [licence](licence) file for details
