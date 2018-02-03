let toneMidiConverter = null;

function getMidiConverter() {
  if (!toneMidiConverter) {
    const Tone = require('tone')
    toneMidiConverter = new Tone.Frequency()
  }

  return toneMidiConverter
}


export function randomRange(min, max) {
  return (Math.random() * (max - min)) + min
}

export function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function midiToFrequency(midiNote) {
  return getMidiConverter().midiToFrequency(midiNote)
}

export function frequencyToMidi(frequency) {
  return getMidiConverter().frequencyToMidi(midiNote)
}

export function isAudioSupported() {
  return window.AudioContext || window.webkitAudioContext
}

export function isUserMediaSupported() {
  return window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia
}

export function isIOS() {
  return /iPad|iPhone|iPod/.test(window.navigator.userAgent)
}
