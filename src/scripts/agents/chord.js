import { a as aWeighting } from 'a-weighting'
import { randomRange } from '../utils'
import { midiToFrequency, frequencyToMidi } from '../utils'

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

const chords = [
  {name:'C', notes:[60, 64, 67],next:'G'},
  {name:'G', notes:[67,71,74],next:'Am'},
  {name:'Am', notes:[69,72, 76],next:'F'},
  {name:'F', notes:[65,69,72],next:'C'}
]

import bandpassChordDetector from '../behaviours/bandpassPolyTracker'

export default class ChordAgent {
  constructor(options = {}, visuals, gainNode) {
    const Tone = require('tone')

    this.converter = new Tone.Frequency()

    this.options = Object.assign({}, defaultOptions, options)

    // Synthesized sound of our agent (output)
    this.synth =  new Tone.PolySynth(3, Tone.Synth);

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



    // Set the filter poles to initial positions
    // this.setFilterPoles(this.initialNote)

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

    this.chordDetectors = Object.keys(chords).map(chordName =>  bandpassChordDetector(chords[chordName].notes, gainNode))
    this.playingChord = null;
    this.enabled = false
  }

  start() {
    // The synthesizer play all the time, trigger its note
    // this.synth.triggerAttack(
    //   this.converter.midiToFrequency(this.initialNote)
    // )

    // Start the LFO
    this.gainLFO.start()
  }

  update(signal, runtime, gainNode, [phase1Chord,phase2Chord,phase3Chord]) {

    if (phase2Chord) {
      this.enabled = true
      console.log("chord agent enabled")
    }
    if (phase3Chord) {
      this.enabled =false
      console.log("chord agent disabled")
    }
    if (!this.enabled)
      return
    
    const chordsTriggered = chords.map(({name},i) => ({name, triggered:this.chordDetectors[i]()})).filter(t => t.triggered).map(({name}) => name)


    // console.log("chordsTriggered",chordsTriggered);
    if (chordsTriggered.length > 0) {
      const triggeredChordName = chordsTriggered[0]
      console.log(triggeredChordName)

      const nextChord = chords.find(({name}) => name === triggeredChordName).next;
      console.log("next",nextChord)
      const notes = chords.find(({name}) => name === nextChord).notes;
      console.log(notes)
      this.synth.triggerAttackRelease(notes.map(midiToFrequency), "1n", "+1n");
      // chordsTriggered => chords.find(({name}) => name === chordName).next)
    }
    //
    // this.synth.setNote(nextFrequency)

    // Debug output
    // console.log('=========')
    // console.log(leftMeterValue, rightMeterValue, this.currentVelocity)
    // console.log(nextFrequency)
  }
}
