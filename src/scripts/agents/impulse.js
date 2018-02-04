import bandpassChordDetector from '../behaviours/bandpassPolyTracker'

const defaultOptions = {
  delayTimeBase: 0.5,
  muteSensitivity: 0.001,
  triggerChord: [60, 65],
}

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

    this.isNewChordTriggered = bandpassChordDetector(
      this.options.triggerChord,
      gainNode
    )
  }

  start() {
  }

  stop() {
    // unused
  }

  update(signal) {
    const {
      delayTimeBase,
    } = this.options

    // Check if chord was triggered
    const chordTriggered = this.isNewChordTriggered()

    // Check some requirements before we really can make sound
    if (
      chordTriggered
      && !this.previousChordTriggered
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
