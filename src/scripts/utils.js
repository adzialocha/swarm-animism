export function randomRange(min, max) {
  return (Math.random() * (max - min)) + min
}

export function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

let toneMidiConverter = null;

function getMidiConverter() {
  if (!toneMidiConverter) {
    const Tone = require('tone')
    toneMidiConverter = new Tone.Frequency()
  }

  return toneMidiConverter
}

export function midiToFrequency(midiNote) {
  return getMidiConverter().midiToFrequency(midiNote)
}

export function frequencyToMidi(frequency) {
  return getMidiConverter().frequencyToMidi(midiNote)  
}