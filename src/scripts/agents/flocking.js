import Tone from 'tone'

const INITIAL_NOTE = 80
const FILTER_RANGE = 1
const VELOCITY = 0.05

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
      frequency: converter.midiToFrequency(INITIAL_NOTE - FILTER_RANGE),
      type: 'bandpass',
      rolloff: -24,
      Q: 1,
      gain: 0,
    })

    this.filterRight = new Tone.Filter({
      frequency: converter.midiToFrequency(INITIAL_NOTE + FILTER_RANGE),
      type: 'bandpass',
      rolloff: -24,
      Q: 1,
      gain: 0,
    })

    this.lastMeterValue = 0
    this.currentNote = INITIAL_NOTE
    this.velocity = VELOCITY

    this.meterLeft = new Tone.Meter()
    this.meterRight = new Tone.Meter()

    gainNode.connect(this.filterLeft)
    gainNode.connect(this.filterRight)

    this.filterLeft.connect(this.meterLeft)
    this.filterRight.connect(this.meterRight)
  }

  start() {
    this.synth.triggerAttack(converter.midiToFrequency(this.currentNote))
  }

  update(signal, runtime, gainNode) {
    const leftMeterValue = this.meterLeft.getLevel()
    const rightMeterValue = this.meterRight.getLevel()

    if (leftMeterValue < rightMeterValue) {
      this.velocity = VELOCITY
    } else {
      this.velocity = -VELOCITY
    }

    const nextFrequency = converter.midiToFrequency(this.currentNote)

    // console.log('=========')
    // console.log(leftMeterValue, rightMeterValue, this.velocity)
    // console.log(this.filterLeft.frequency.value, nextFrequency, this.filterRight.frequency.value)

    this.currentNote += this.velocity

    const left = converter.midiToFrequency(this.currentNote - FILTER_RANGE)
    const right = converter.midiToFrequency(this.currentNote + FILTER_RANGE)

    this.filterLeft.frequency.setValueAtTime(left, '+0')
    this.filterRight.frequency.setValueAtTime(right, '+0')

    this.synth.setNote(nextFrequency)
  }
}
