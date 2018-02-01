import '../styles/index.scss'

import Tone from 'tone'

import Visuals from './visuals'
import Audio from './audio'

import FlockingAgent from './agents/flocking'
import ImpulseAgent from './agents/impulse'

const SCREEN_ID = 'main'
const ERROR_ID = 'error'
const START_ID = 'start'

// DOM objects
const screenElem = document.getElementById(SCREEN_ID)
const errorElem = document.getElementById(ERROR_ID)
const startElem = document.getElementById(START_ID)

// Basic interfaces
const visuals = new Visuals(screenElem)
const audio = new Audio()

function startPerformance() {
  const options = {
    initialNote: Math.random() * 48 + 48,
    playNoteOffset: 7 * (Math.floor(Math.random() * 3) - 1),
  }

  const agent = new FlockingAgent(options, audio.gain)

  audio.setAgent(agent)
}

function showErrorMessage() {
  errorElem.classList.add('error--visible')
}

// Start sound environment
if (!Tone.UserMedia.supported) {
  showErrorMessage()
} else {
  startElem.addEventListener('click', () => {
    audio.setup(visuals)
    startElem.classList.add('start--clicked')
    startPerformance()
  })
}
