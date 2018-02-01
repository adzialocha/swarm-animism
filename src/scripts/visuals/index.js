import test from '../../images/test.png';

const FLASH_CLASS = 'screen--flash'
const ACTIVE_CLASS = 'screen--visible'
const BACKGROUND_ID = 'background'

const animalImages = {
  test,
}

export default class Visuals {
  constructor(elem, color) {
    this.elem = elem
    this.backgroundElem = document.getElementById(BACKGROUND_ID)
    this.timeout = null
  }

  setToColor(color) {
    this.elem.style.backgroundColor = 'rgba(' + color.join(',') + ', 1)'
  }

  setAnimal(animalName) {
    this.elem.classList.add(ACTIVE_CLASS)
    this.backgroundElem.style.backgroundImage = `url(${animalImages[animalName]})`
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
