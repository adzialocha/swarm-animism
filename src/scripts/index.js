import '../styles/index.scss'

import Tone from 'tone'

import Visuals from './visuals'
import Audio from './audio'

import FlockingAgent from './agents/flocking'
import ImpulseAgent from './agents/impulse'

import { randomItem } from './utils'

import animals from '../animals.json'

const SCREEN_ID = 'main'
const ERROR_ID = 'error'
const START_ID = 'start'

// DOM objects
const screenElem = document.getElementById(SCREEN_ID)
const errorElem = document.getElementById(ERROR_ID)
const startElem = document.getElementById(START_ID)

// Basic interfaces
const visuals = new Visuals(screenElem)

function startPerformance() {
  // Create an audio environment
  const audio = new Audio()
  audio.setup(visuals)

  // Pick a random animal
  const animal = randomItem(animals)
  const { options } = animal

  // Show the animal
  visuals.setAnimal(animal.name)

  let agent

  switch (animal.agent) {
    case 'impulse':
      agent = new ImpulseAgent(options, visuals, audio.gain)
      break
    default:
      agent = new FlockingAgent(options, visuals, audio.gain)
      break
  }

  audio.setAgent(agent)
}

function showErrorMessage() {
  errorElem.classList.add('error--visible')
}

// Check if WebAudio API is supported on this device
if (!Tone.UserMedia.supported) {
  showErrorMessage()
} else {
  startElem.classList.add('start--visible')

  startElem.addEventListener('click', () => {
    startPerformance()

    startElem.classList.remove('start--visible')
  })
}
