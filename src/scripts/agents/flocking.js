import Tone from 'tone'

const INITIAL_NOTE = 80
const NOTE_FILTER_RANGE = 1

const INITIAL_VELOCITY = 0.1
const ACCELERATION = 0.001
const SMOOTHING = 0.9

const converter = new Tone.Frequency()

export default class FlockingAgent {
  constructor(gainNode) {
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

    this.filterLeft = new Tone.Filter({
      frequency: converter.midiToFrequency(INITIAL_NOTE - NOTE_FILTER_RANGE),
      type: 'bandpass',
      rolloff: -24,
      Q: 1,
      gain: 0,
    })

    this.filterRight = new Tone.Filter({
      frequency: converter.midiToFrequency(INITIAL_NOTE + NOTE_FILTER_RANGE),
      type: 'bandpass',
      rolloff: -24,
      Q: 1,
      gain: 0,
    })

    this.lastMeterValue = 0
    this.currentNote = INITIAL_NOTE
    this.velocity = INITIAL_VELOCITY

    this.meterLeft = new Tone.Meter()
    this.meterRight = new Tone.Meter()

    gainNode.connect(this.filterLeft)
    gainNode.connect(this.filterRight)

    this.filterLeft.connect(this.meterLeft)
    this.filterRight.connect(this.meterRight)
  }

  onAnalysis(values) {
    // console.log(values)
  }

  start() {
    this.synth.triggerAttack(converter.midiToFrequency(this.currentNote))
  }

  update(signal, runtime, gainNode) {
    const leftMeterValue = this.meterLeft.getValue()
    const rightMeterValue = this.meterRight.getValue()

    // const smoothedMeterValue = (
    //   SMOOTHING * this.meterLeft.getValue() + (1 - SMOOTHING) * currentMeterValue
    // )

    // const smoothedMeterValue = (
    //   SMOOTHING * this.meterRight.getValue() + (1 - SMOOTHING) * currentMeterValue
    // )

    if (leftMeterValue > rightMeterValue) {
      this.velocity = INITIAL_VELOCITY
    } else {
      this.velocity = -INITIAL_VELOCITY
    }

    const nextFrequency = converter.midiToFrequency(this.currentNote)

    console.log('=========')
    console.log(leftMeterValue, rightMeterValue, this.velocity)
    console.log(this.filterLeft.frequency.value, nextFrequency, this.filterRight.frequency.value)

    this.currentNote += this.velocity

    this.filterLeft.frequency.setValueAtTime(converter.midiToFrequency(this.currentNote - NOTE_FILTER_RANGE), '+0')
    this.filterRight.frequency.setValueAtTime(converter.midiToFrequency(this.currentNote + NOTE_FILTER_RANGE), '+0')

    this.synth.setNote(nextFrequency)
  }
}
