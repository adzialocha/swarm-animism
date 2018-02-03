import '../styles/index.scss'

import Visuals from './visuals'
import Audio from './audio'

import ChordAgent from './agents/chord'
import FlockingAgent from './agents/flocking'
import ImpulseAgent from './agents/impulse'
import SampleAgent from './agents/sample'

import {
  getQueryVariable,
  isAudioSupported,
  isIOS,
  isUserMediaSupported,
  randomItem,
  randomRange,
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
  const useMicrophone = !isIOS()
  const audio = new Audio(useMicrophone)

  audio.setup(visuals)

  // Pick a random animal
  const iOSAnimal = animals.find(item => item.agent === IOS_AGENT_NAME)
  let animal = isIOS() ? iOSAnimal : randomItem(animals)
  const agentParam = getQueryVariable('agent')

  if (agentParam) {
    animal = animals.find(item => item.agent === agentParam)
  }

  const { options } = animal

  // Show the animal
  const imageName = `image${Math.floor(randomRange(1, 7))}`
  visuals.setAnimal(imageName)

  // Debug info
  // console.log(`image=${imageName}`)
  // console.log(`agent=${animal.agent}`)

  let agent

  switch (animal.agent) {
    case 'impulse':
      agent = new ImpulseAgent(options, visuals, audio.gain)
      break
    case 'sample':
      agent = new SampleAgent(options, visuals, audio.gain)
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

// Check if WebAudio API is supported on this device
if (
  !isAudioSupported() ||
  (
    !isIOS() &&
    !isUserMediaSupported()
  )
) {
  showErrorMessage()
} else {
  startElem.classList.add('start--visible')

  startElem.addEventListener('click', () => {
    startPerformance()

    startElem.classList.remove('start--visible')
  })
}
