import {
  midiToFrequency,
  randomRange,
} from '../utils'

import bandpassChordDetector from '../behaviours/bandpassPolyTracker'

const CHORDS = [
  { name: 'C', notes: [60, 64, 67], next: 'G' },
  { name: 'G', notes: [67, 71, 74], next: 'Am' },
  { name: 'Am', notes: [69, 72, 76], next: 'F' },
  { name: 'F', notes: [65, 69, 72], next: 'C' },
]

const defaultOptions = {
  minLFOFrequency: 0.1,
  maxLFOFrequency: 0.5,
  minVolume: 0.25,
  maxVolume: 0.9,
}

export default class ChordAgent {
  constructor(options = {}, visuals, gainNode) {
    const Tone = require('tone')

    this.converter = new Tone.Frequency()

    this.options = Object.assign({}, defaultOptions, options)

    // Synthesized sound of our agent (output)
    this.synth =  new Tone.PolySynth(3, Tone.Synth)

    this.synth.set({
      oscillator: {
        type: 'sine',
      },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.7,
        release: 1,
      },
    })

    this.synthGainNode = new Tone.Gain()
    this.synthGainNode.toMaster()

    this.synth.connect(this.synthGainNode)

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

    this.chordDetectors = Object.keys(CHORDS).map(chordName =>  {
      return bandpassChordDetector(CHORDS[chordName].notes, gainNode)
    })

    this.playingChord = null
  }

  start() {
    // Start the LFO
    this.gainLFO.start()
  }

  update(signal, runtime, gainNode) {
    const chordsTriggered = CHORDS
      .map(({ name }, i) => {
        return ({
          name,
          triggered: this.chordDetectors[i](),
        })
      })
      .filter(t => t.triggered)
      .map(({ name }) => name)

    // console.log('chordsTriggered', chordsTriggered)

    if (chordsTriggered.length > 0) {
      const triggeredChordName = chordsTriggered[0]
      const nextChord = CHORDS.find(({ name }) => name === triggeredChordName).next
      const notes = CHORDS.find(({ name }) => name === nextChord).notes

      this.synth.triggerAttackRelease(notes.map(midiToFrequency), '1n', '+1n')

      // console.log(triggeredChordName)
      // console.log('next', nextChord)
      // console.log(notes)
    }
  }
}
