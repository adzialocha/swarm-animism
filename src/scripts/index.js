import '../styles/index.scss'
import iOSFallbackSample from '../files/crackles.wav'

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

import firebaseSettings from '../firebase.json'

let dbAgentNames = []
let agentCollection = {}

// DOM objects
const controlElem = document.getElementById('control')
const controlButtonElems = document.getElementsByClassName('control__button')
const errorElem = document.getElementById('error')
const screenElem = document.getElementById('main')
const startElem = document.getElementById('start')

// Check if we want to force an agent
const forcedAgentParam = getQueryVariable('agent')
const hasControl = getQueryVariable('control')

// Basic interfaces
const visuals = new Visuals(screenElem)
let audio

function setControlButton(agentName, status, disabled = undefined) {
  for (let i = 0; i < controlButtonElems.length; i += 1) {
    const button = controlButtonElems[i]

    if (agentName == button.dataset.agent) {
      if (status) {
        button.classList.add('control__button--active')
      } else {
        button.classList.remove('control__button--active')
      }
    } else if (typeof disabled !== 'undefined') {
      button.disabled = disabled
    }
  }
}

function getAgent(agentName) {
  let agent = agentCollection[agentName]
  agent.name = agentName

  return agent
}

function getAgents(agentNames) {
  return agentNames.map(agentName => {
    return getAgent(agentName)
  })
}

function initFirebase() {
  // Do the bad thing and expose credentials (whatever, we dont have time!)
  const app = firebase.initializeApp(firebaseSettings)
  const database = firebase.database()

  // Add client to list
  database.ref('clients').push({
    timestamp: Date.now(),
    userAgent: window.navigator.userAgent,
  })

  // Listen to changes of the agent state
  const agentNameState = database.ref('state/agentNames')

  setControlButton(null, null, true)

  agentNameState.on('value', snapshot => {
    if (!audio) {
      return
    }

    setControlButton(null, null, false)

    // Update value
    dbAgentNames = snapshot.val() || []

    const existingAgentNames = audio.agents ? audio.agents.map(agent => {
      return agent.name
    }) : []

    // Add these new agents
    const newAgents = dbAgentNames.reduce((acc, newAgentName) => {
      if (!existingAgentNames.includes(newAgentName)) {
        acc.push(newAgentName)
        setControlButton(newAgentName, true)
      }
      return acc
    }, [])

    // Remove these agents
    const removeAgents = existingAgentNames.reduce((acc, agentName) => {
      if (!dbAgentNames.includes(agentName)) {
        acc.push(agentName)
        setControlButton(agentName, false)
      }
      return acc
    }, [])

    audio.removeAgents(getAgents(removeAgents))
    audio.addAgents(getAgents(newAgents))
  })
}

function initControl() {
  const database = firebase.database()
  const ref = database.ref('state/agentNames')

  controlElem.classList.add('control--visible')

  for (let i = 0; i < controlButtonElems.length; i += 1) {
    const button = controlButtonElems[i]

    button.addEventListener('click', event => {
      event.preventDefault()
      const { agent } = button.dataset

      if (dbAgentNames.includes(agent)) {
        dbAgentNames.splice(dbAgentNames.findIndex(i => i === agent), 1)
      } else {
        dbAgentNames.push(agent)
      }

      setControlButton(null, null, true)
      ref.set(dbAgentNames)
    })
  }
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
  // Create an audio environment
  audio = new Audio()
  audio.setup()

  agentCollection = {
    // impulse: new ImpulseAgent({}, visuals, audio.gain),
    // chord: new ChordAgent({}, visuals, audio.gain),
    flocking: new FlockingAgent({}, visuals, audio.gain),
  }

  // Initialise remote control via Firebase
  if (!forcedAgentParam) {
    initFirebase()

    // Show control when requested
    if (hasControl) {
      initControl()
    }
  }

  // Set agent when forced
  if (forcedAgentParam) {
    audio.addAgents([getAgent(forcedAgentParam)])
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
