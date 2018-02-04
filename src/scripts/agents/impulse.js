import Tone from 'tone'

import Meyda from 'meyda'

import bandpassChordDetector from '../behaviours/bandpassPolyTracker'

const defaultOptions = {
  delayTimeBase: 0.5,
  muteSensitivity: 0.001,
  noiseinessTreshold: 0.12,
  rmsSensitibity: 0.05,
  triggerChord: [60, 65],
}

export default class ImpulseAgent {
  constructor(options = {}, visuals, gainNode) {
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

    this.isNewChordTriggered = bandpassChordDetector(
      this.options.triggerChord,
      gainNode
    )
  }

  start() {
    Meyda.bufferSize = 512
  }

  stop() {
    // unused
  }

  update(signal) {
    const features = Meyda.extract([
      'rms',
      'chroma',
    ], signal)

    const { chroma, rms } = features

    const {
      delayTimeBase,
      noiseinessTreshold,
      rmsSensitibity,
    } = this.options

    // Calculate the noiseiness of the whole signal
    const noiseiness = chroma.reduce((a, b) => a + b, 0) / chroma.length

    // Check if chord was triggered
    const chordTriggered = this.isNewChordTriggered()

    // Check some requirements before we really can make sound
    if (
      chordTriggered
      && !this.previousChordTriggered
      // && noiseiness < noiseinessTreshold
      // && rms > rmsSensitibity
    ) {
      this.visuals.flash()

      this.delay.delayTime.setValueAtTime(
        delayTimeBase * Math.ceil(Math.random() * 8) * delayTimeBase,
        '+0'
      )

      this.synth.triggerAttackRelease(0.1)
    }

    this.previousChordTriggered = chordTriggered
  }
}
