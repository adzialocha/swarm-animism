import '../styles/index.scss'

import Visuals from './visuals'
import Audio from './audio'

import ChromaAgent from './agents/chroma'
import FlockingAgent from './agents/flocking'
import ImpulseAgent from './agents/impulse'
import SampleAgent from './agents/sample'

import {
  isAudioSupported,
  isIOS,
  isUserMediaSupported,
  randomItem,
} from './utils'

import animals from '../animals.json'

const IOS_AGENT_NAME = 'sample'

// DOM objects
const screenElem = document.getElementById('main')
const errorElem = document.getElementById('error')
const startElem = document.getElementById('start')

// Basic interfaces
const visuals = new Visuals(screenElem)

function startPerformance() {
  // Create an audio environment
  const audio = new Audio()
  audio.setup(visuals)

  // Pick a random animal
  const iOSAnimal = animals.find(item => item.agent === IOS_AGENT_NAME)
  const animal = isIOS() ? iOSAnimal : randomItem(animals)
  const { options } = animal

  // Show the animal
  visuals.setAnimal(animal.name)

  let agent

  switch (animal.agent) {
    case 'impulse':
      agent = new ImpulseAgent(options, visuals, audio.gain)
      break
    case 'chroma':
      agent = new ChromaAgent(options, visuals, audio.gain)
      break
    case 'sample':
      agent = new SampleAgent(options, visuals, audio.gain)
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
if (!isAudioSupported() || !isUserMediaSupported()) {
  showErrorMessage()
} else {
  startElem.classList.add('start--visible')

  startElem.addEventListener('click', () => {
    startPerformance()

    startElem.classList.remove('start--visible')
  })
}
