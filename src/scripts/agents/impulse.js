// import bandpassChordDetector from '../behaviours/bandpassPolyTracker'

const defaultOptions = {
  delayTimeBase: 0.5,
  muteSensitivity: 0.001,
  triggerChord: [60, 65],
}

import {getSmoothingFunctor} from '../behaviours/bandpassPolyTracker'

import {debug} from '../utils'

export default class ImpulseAgent {
  constructor(options = {}, visuals, gainNode) {
    const Tone = require('tone')

    this.options = Object.assign({}, defaultOptions, options)

    this.visuals = visuals
    this.converter = new Tone.Frequency()
    this.meter = new Tone.Meter()

    // this.delay = new Tone.FeedbackDelay (
    //   this.options.delayTimeBase,
    //    0.3
    // ).connect(this.meter)

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
    }).toMaster()

    this.gainNode = gainNode
    this.gainNode.connect(this.meter)

    // this.isNewChordTriggered = bandpassChordDetector(
    //   this.options.triggerChord,
    //   gainNode
    // )
    this.previousChordTriggered = true
    const smoother = getSmoothingFunctor();
    this.smoothedMeter = () => smoother(Math.exp(this.meter.getLevel()))
    this.lastMeterValue = this.smoothedMeter()
  }

  start() {
  }

  stop() {
    // unused
  }

  update() {
    // const {
    //   delayTimeBase,
    // } = this.options

    // Check if chord was triggered
    // constchordTriggered = this.isNewChordTriggered()

    //console.log(this.meter.getLevel())
    const meterValue = this.smoothedMeter()
    const meterRise = meterValue - this.lastMeterValue
    const rawMeter = this.meter.getLevel();
    debug("impulse meter", rawMeter)
    debug("impulse meter rise (smoothed)", meterRise)
    const chordTriggered = (rawMeter > -10)

    this.lastMeterValue = meterValue
    // Check some requirements before we really can make sound
    if (
      chordTriggered
      && !this.previousChordTriggered
      // chordTriggered
    ) {
      this.visuals.flash()

      // this.delay.delayTime.setValueAtTime(
      //   delayTimeBase * Math.ceil(Math.random() * 8) * delayTimeBase,
      //   '+0'
      // )

      this.synth.triggerAttackRelease(0.1)
    }

    this.previousChordTriggered = chordTriggered
  }
}
