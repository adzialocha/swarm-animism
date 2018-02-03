import '../styles/index.scss'

import sample from '../files/crackles.wav'

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

function getAgent(agentName, gainNode) {
  let agent

  const animal = animals.find(item => item.agent === agentName)
  const { options } = animal

  switch (agentName) {
    case 'impulse':
      agent = new ImpulseAgent(options, visuals, gainNode)
      break
    case 'sample':
      agent = new SampleAgent(options, visuals, gainNode)
      break
    case 'chord':
      agent = new ChordAgent(options,visuals, gainNode)
      break
    default:
      agent = new FlockingAgent(options, visuals, gainNode)
      break
  }

  return agent
}

function startIOSPerformance() {
  // Fallback for stupid iOS
  const elem = document.createElement('audio')
  document.getElementById('main').appendChild(elem)
  elem.src = sample
  elem.play()
}

function startPerformance() {
  // Create an audio environment
  const audio = new Audio(true)
  audio.setup(visuals)

  // Check if we want to force an agent
  const agentParam = getQueryVariable('agent')

  let agents

  if (agentParam) {
    agents = [
      getAgent(agentParam, audio.gain),
    ]
  } else {
    agents = [
      getAgent('impulse', audio.gain),
      getAgent('flocking', audio.gain),
    ]
  }

  audio.setAgents(agents)
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
    // Show an image
    const imageName = `image${Math.floor(randomRange(1, 7))}`
    visuals.setAnimal(imageName)

    // Start the performance
    if (isIOS()) {
      startIOSPerformance()
    } else {
      startPerformance()
    }

    startElem.classList.remove('start--visible')
  })
}
