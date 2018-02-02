import {midiToFrequency,frequencyToMidi} from '../utils'
import {all,difference} from 'ramda'

export default function createBandpassNoteTracker(midiNotes,inputNode) {
    const Tone = require('tone')
    const filterMeters = midiNotes.map(key => {
      const filter = new Tone.Filter({
        frequency:midiToFrequency(key),
        type: 'bandpass',
        rolloff: -48,
        Q: 20,
        gain: 0,
      }) 
  
      const meter = new Tone.Meter()
  
      inputNode.connect(filter)
      filter.connect(meter)
  
      return meter
    })
    const overallInputMeter = new Tone.Meter();
    inputNode.connect(overallInputMeter);
    let previousChordTriggered = false;
  
    function updateFunction() {
      const filterMeterValues = filterMeters.map(meter => meter.getLevel())
      const overallInputLevel  = overallInputMeter.getLevel()
      const normalizedFilterMeterValues = filterMeterValues.map(level => {
        return level - overallInputLevel
      })
  
      const chordTriggered = (
        all(level => level > -15, normalizedFilterMeterValues) &&
        overallInputLevel > -20
      )
  
      const newChordTriggered = !previousChordTriggered && chordTriggered
      previousChordTriggered = chordTriggered
      return newChordTriggered
    }
    return updateFunction
  }