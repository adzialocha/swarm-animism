import image1 from '../../images/spirit-image-1.jpg'
import image2 from '../../images/spirit-image-2.jpg'
import image3 from '../../images/spirit-image-3.jpg'
import image4 from '../../images/spirit-image-4.jpg'
import image5 from '../../images/spirit-image-5.jpg'
import image6 from '../../images/spirit-image-6.jpg'

const FLASH_CLASS = 'screen--flash'
const ACTIVE_CLASS = 'screen--visible'
const BACKGROUND_ID = 'background'

const animalImages = {
  image1,
  image2,
  image3,
  image4,
  image5,
  image6,
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
