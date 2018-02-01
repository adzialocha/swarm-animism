import Tone from 'tone'

import { a as aWeighting } from 'a-weighting'

const defaultOptions = {
  filterQ: 0.7,
  filterRange: 7,
  filterRolloff: -48,
  initialNote: 72,
  playNoteOffset: 4,
  velocity: 0.03,
}

const converter = new Tone.Frequency()

export default class FlockingAgent {
  constructor(options, gainNode) {
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
    }).toMaster()

    // Agent states
    this.currentNote = this.options.initialNote
    this.currentVelocity = this.options.velocity

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
    this.setFilterPoles(this.options.initialNote)
  }

  start() {
    // The synthesizer play all the time, trigger its note
    this.synth.triggerAttack(
      converter.midiToFrequency(this.options.initialNote)
    )
  }

  setFilterPoles(centerNote) {
    const { filterRange } = this.options

    const left = converter.midiToFrequency(centerNote - filterRange)
    const right = converter.midiToFrequency(centerNote + filterRange)

    this.filterLeft.frequency.setValueAtTime(left, '+0')
    this.filterRight.frequency.setValueAtTime(right, '+0')
  }

  update(signal, runtime, gainNode) {
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
      Math.max((rightMeterValue - leftMeterValue) * this.options.velocity, -3), 3
    )

    // Update the frequencies
    this.currentNote += this.currentVelocity
    this.setFilterPoles(this.currentNote)

    // Debug output
    console.log(leftMeterValue, rightMeterValue, this.currentVelocity)
    console.log(leftMeterValue - rightMeterValue)

    // Change the synth note
    const nextFrequency = converter.midiToFrequency(this.currentNote)
    this.synth.setNote(nextFrequency)
  }
}
