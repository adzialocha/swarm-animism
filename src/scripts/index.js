import '../styles/index.scss'

import Visuals from './visuals'
import Audio from './audio'

import FlockingAgent from './agents/flocking'
import ImpulseAgent from './agents/impulse'
import ChordAgent from './agents/chord'

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

  let predefinedAnimal

  if (window.location.href.includes('impulse')) {
    predefinedAnimal = animals[0]
  } else if (window.location.href.includes('flocking')) {
    predefinedAnimal = animals[1]
  }

  // Pick a random animal
  const animal = predefinedAnimal || randomItem(animals)
  const { options } = animal

  // Show the animal
  visuals.setAnimal(animal.name)

  let agent
  let agentName

  switch (animal.agent) {
    case 'impulse':
      agent = new ImpulseAgent(options, visuals, audio.gain)
      break
    case 'chord':
      agent = new ChordAgent(options,visuals,audio.gain)
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

const isAudioSupported = window.AudioContext || window.webkitAudioContext
const isUserMediaSupported = window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia

// Check if WebAudio API is supported on this device
if (!isAudioSupported || !isUserMediaSupported) {
  showErrorMessage()
} else {
  startElem.classList.add('start--visible')

  startElem.addEventListener('click', () => {
    startPerformance()

    startElem.classList.remove('start--visible')
  })
}
