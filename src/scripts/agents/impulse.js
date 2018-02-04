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

    this.delay = new Tone.Delay (
      this.options.delayTimeBase,
       10*this.options.delayTimeBase
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
    }).toMaster()

    this.gainNode = gainNode
    this.gainNode.connect(this.delay)

    // this.isNewChordTriggered = bandpassChordDetector(
    //   this.options.triggerChord,
    //   gainNode
    // )
    this.previousChordTriggered = true
    const smoother = getSmoothingFunctor();
    this.smoothedMeter = () => smoother(Math.abs(this.meter.getValue()))*100
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
    // debug("impulse meter", rawMeter)
    debug("impulse meter rise (smoothed)", meterRise)
    const chordTriggered = (meterRise > 0.3)

    this.lastMeterValue = meterValue
    // Check some requirements before we really can make sound
    if (
      chordTriggered
      && !this.previousChordTriggered
      // chordTriggered
    ) {
      this.visuals.flash()

      this.delay.delayTime.setValueAtTime(
        this.options.delayTimeBase * Math.ceil(Math.random() * 8),
        '+0'
      )

      this.synth.triggerAttackRelease(0.1)
    }

    this.previousChordTriggered = chordTriggered
  }
}
