import '../styles/index.scss'

import * as firebase from 'firebase/app'
import 'firebase/database'

import Visuals from './visuals'
import Audio from './audio'

import ChordAgent from './agents/chord'
import FlockingAgent from './agents/flocking'
import ImpulseAgent from './agents/impulse'

import {
  getQueryVariable,
  isAudioSupported,
  isIOS,
  isUserMediaSupported,
  randomRange,
} from './utils'

import animals from '../animals.json'
import firebaseSettings from '../firebase.json'

// DOM objects
const screenElem = document.getElementById('main')
const errorElem = document.getElementById('error')
const startElem = document.getElementById('start')

// Check if we want to force an agent
const forcedAgentParam = getQueryVariable('agent')

// Basic interfaces
const visuals = new Visuals(screenElem)
let audio

function getAgent(agentName, gainNode) {
  let agent

  const animal = animals.find(item => item.agent === agentName)
  const { options } = animal

  switch (agentName) {
    case 'impulse':
      agent = new ImpulseAgent(options, visuals, audio.gain)
      break
    case 'sample':
      agent = new SampleAgent(options, visuals, audio.gain)
      break
    case 'chord':
      agent = new ChordAgent(options, visuals, audio.gain)
      break
    default:
      agent = new FlockingAgent(options, visuals, audio.gain)
      break
  }

  // Pass over config object to every agent
  agent.config = animal

  return agent
}

function initFirebase() {
  // Do the bad thing and expose credentials (whatever, we dont have time!)
  const app = firebase.initializeApp(firebaseSettings)
  const database = firebase.database()

  // Listen to changes of the agent state
  const agentNameState = database.ref('state/agentName')

  agentNameState.on('value', snapshot => {
    if (!audio) {
      return
    }

    const value = snapshot.val()
    const agentNames = (typeof value === 'string') ? [value] : value

    const agents = agentNames.map(agentName => {
      return getAgent(agentName)
    })

    audio.setAgents(agents)
  })
}

function startIOSPerformance() {
  // Fallback for stupid iOS
  const audioElem = document.createElement('audio')
  screenElem.appendChild(audioElem)

  audioElem.src = iOSFallbackSample
  audioElem.loop = true
  audioElem.play()
}

function startPerformance() {
  // Initialise remote control via Firebase
  if (!forcedAgentParam) {
    initFirebase()
  }

  // Create an audio environment
  audio = new Audio()
  audio.setup()

  // Set agent when forced
  if (forcedAgentParam) {
    audio.setAgents([getAgent(forcedAgentParam)])
  }
}

function showErrorMessage() {
  errorElem.classList.add('error--visible')
}

function init() {
  // Wait for user to click so we can kick off the WebAudio context
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
  init()
}
