const FLASH_CLASS = 'screen--flash'

export default class Visuals {
  constructor(elem, color) {
    this.elem = elem
    this.timeout = null
  }

  setToColor(color) {
    this.elem.style.backgroundColor = 'rgba(' + color.join(',') + ', 1)'
  }

  flash(duration = 100) {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    this.elem.classList.add(FLASH_CLASS)

    this.timeout = setTimeout(() => {
      this.elem.classList.remove(FLASH_CLASS)
    }, duration)
  }
}
