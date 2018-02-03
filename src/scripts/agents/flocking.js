import { a as aWeighting } from 'a-weighting'

import { randomRange } from '../utils'
import bandpassChordDetector from '../behaviours/bandpassPolyTracker'

const defaultOptions = {
  filterQ: 1,
  filterRange: 7,
  filterRolloff: -48,
  minInitialNote: 48,
  maxInitialNote: 96,
  minLFOFrequency: 0.1,
  maxLFOFrequency: 0.5,
  minVelocity: 0.001,
  maxVelocity: 0.005,
  velocityRange: 1,
  minVolume: 0.25,
  maxVolume: 0.9,
}

export default class FlockingAgent {
  constructor(options = {}, visuals, gainNode) {
    const Tone = require('tone')

    this.converter = new Tone.Frequency()

    this.options = Object.assign({}, defaultOptions, options)

    // Synthesized sound of our agent (output)
    this.synth = new Tone.Synth({
      oscillator: {
        type: 'sine',
      },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 1,
        release: 1,
      },
    })

    this.synthGainNode = new Tone.Gain()
    this.synthGainNode.toMaster()

    this.synth.connect(this.synthGainNode)

    // Choose some random parameters
    this.velocity = randomRange(
      this.options.minVelocity,
      this.options.maxVelocity
    )

    this.initialNote = randomRange(
      this.options.minInitialNote,
      this.options.maxInitialNote
    )

    // Agent states
    this.currentNote = this.initialNote
    this.currentVelocity = this.velocity

    // Filters to analyse the signal at two poles around the center
    this.filterLeft = new Tone.Filter({
      frequency: 440,
      type: 'bandpass',
      rolloff: this.options.filterRolloff,
      Q: this.options.filterQ,
      gain: 0,
    })

    this.filterRight = new Tone.Filter({
      frequency: 440,
      type: 'bandpass',
      rolloff: this.options.filterRolloff,
      Q: this.options.filterQ,
      gain: 0,
    })

    this.meterLeft = new Tone.Meter()
    this.meterRight = new Tone.Meter()

    gainNode.connect(this.filterLeft)
    gainNode.connect(this.filterRight)

    this.filterLeft.connect(this.meterLeft)
    this.filterRight.connect(this.meterRight)

    // Set the filter poles to initial positions
    this.setFilterPoles(this.initialNote)

    // LFO for controlling the synth gain
    const lfoFrequency = randomRange(
      this.options.minLFOFrequency,
      this.options.maxLFOFrequency
    )

    this.gainLFO = new Tone.LFO(
      lfoFrequency,
      this.options.minVolume,
      this.options.maxVolume
    )

    this.gainLFO.connect(this.synthGainNode.gain)

    this.bandpassChordDetector = bandpassChordDetector([60,67], gainNode)
  }

  start() {
    // The synthesizer play all the time, trigger its note
    this.synth.triggerAttack(
      this.converter.midiToFrequency(this.initialNote)
    )

    // Start the LFO
    this.gainLFO.start()
  }

  setFilterPoles(centerNote) {
    const { filterRange } = this.options

    const left = this.converter.midiToFrequency(centerNote - filterRange)
    const right = this.converter.midiToFrequency(centerNote + filterRange)

    this.filterLeft.frequency.setValueAtTime(left, '+0')
    this.filterRight.frequency.setValueAtTime(right, '+0')
  }

  update(signal, runtime, gainNode) {

    const isChordTriggered = this.bandpassChordDetector()

    if (isChordTriggered)
      this.currentNote = randomRange(
        this.options.minInitialNote,
        this.options.maxInitialNote
      )
    // Get meter and frequency values of our filter poles
    const leftMeterValue = this.meterLeft.getLevel()
    const rightMeterValue = this.meterRight.getLevel()
    const leftFilterFreq = this.filterLeft.frequency.value
    const rightFilterFreq = this.filterRight.frequency.value

    // Make all frequencies equally loud
    const weightedLeftMeterValue = aWeighting(leftFilterFreq) * leftMeterValue
    const weightedRightMeterValue = aWeighting(rightFilterFreq) * rightMeterValue

    if (!(isFinite(rightMeterValue) && isFinite(leftMeterValue))) {
      return
    }

    // Velocity is depended on distance to the target frequency
    this.currentVelocity = Math.min(
      Math.max(
        (rightMeterValue - leftMeterValue) * this.velocity,
        -this.options.velocityRange
      ),
      this.options.velocityRange
    )

    // Update the frequencies
    this.currentNote += this.currentVelocity
    this.setFilterPoles(this.currentNote)

    // Change the synth note
    const nextFrequency = this.converter.midiToFrequency(this.currentNote)
    this.synth.setNote(nextFrequency)

    // Debug output
    // console.log('=========')
    // console.log(leftMeterValue, rightMeterValue, this.currentVelocity)
    // console.log(nextFrequency)
  }
}
