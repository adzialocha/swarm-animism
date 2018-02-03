import Meyda from 'meyda'
import { difference, all } from 'ramda'

import { midiToFrequency, frequencyToMidi } from '../utils'

const defaultOptions = {
  delayTimeBase: 0.5,
  muteSensitivity: 0.001,
  noiseinessTreshold: 0.12,
  rmsSensitivity: 0.05,
  triggerChromaKeys: [60, 65],
}

import bandpassChordDetector from '../behaviours/bandpassPolyTracker'

export default class ImpulseAgent {
  constructor(options = {}, visuals, gainNode) {
    const Tone = require('tone')

    this.options = Object.assign({}, defaultOptions, options)

    this.visuals = visuals
    this.converter = new Tone.Frequency()
    this.meter = new Tone.Meter()

    this.delay = new Tone.FeedbackDelay (
      this.options.delayTimeBase,
       0.3
    ).connect(this.meter)

    this.synth = new Tone.NoiseSynth({
      noise: {
        type: 'brown',
      },
      envelope : {
        attack: 0.5,
        decay: 0.05,
        sustain: 1,
        release: 0.7,
      },
    }).connect(this.delay)

    this.meter.toMaster()
    this.isNewChordTriggered = bandpassChordDetector(this.options.triggerChromaKeys, gainNode)
  }

  start() {
    Meyda.bufferSize = 512
  }

  update(signal, runtime, gainNode) {
    const features = Meyda.extract([
      'rms',
      'chroma',
    ], signal)

    const { chroma, rms } = features

    // Calculate the noiseiness of the whole signal
    const noiseiness = chroma.reduce((a, b) => a + b, 0) / chroma.length

    const chordTriggered = this.isNewChordTriggered()

    const { delayTimeBase } = this.options

    // Check some requirements before we really can make sound
    if (
      chordTriggered
      && !this.previousChordTriggered
      // && rms > this.options.rmsSensitibity
      // && noiseiness < this.options.noiseinessTreshold
      // && isChromaTriggered
    ) {
      this.visuals.flash()

      this.delay.delayTime.setValueAtTime(
        delayTimeBase * Math.ceil(Math.random() * 8) * delayTimeBase,
        '+0'
      )

      this.synth.triggerAttackRelease(0.1)
    }

    this.previousChordTriggered = chordTriggered

    // Debug output
    // console.log(chordTriggered, normalizedFilterMeterValues);
  }
}
