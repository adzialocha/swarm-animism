import {midiToFrequency,frequencyToMidi} from '../utils'
import {all,difference} from 'ramda'

const SMOOTHING = 0

export function getSmoothingFunctor(smoothing = 0.9, startValue = null) {
    let smoothedValue = startValue;

    return (newValue) => {
        if (!isFinite(newValue) || isNaN(newValue))
            return smoothedValue
        if (smoothedValue === null)
            smoothedValue = newValue
        else
            smoothedValue = smoothing * smoothedValue + (1-smoothing) * newValue;
        return smoothedValue
    }
}



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
    }).map(meter => { 
        const smoother = getSmoothingFunctor(SMOOTHING);
        return () => smoother(meter.getLevel())
    })
    const overallInputMeter = new Tone.Meter();
    const inputMeterSmoother = getSmoothingFunctor(SMOOTHING)
    const smoothedOverallInputMeter = () => inputMeterSmoother(overallInputMeter.getLevel())
    
    inputNode.connect(overallInputMeter);
    let previousChordTriggered = false;
  

    // const smooth = (previousValue, value, smoothing = 0.9) => previousValue * smoothing + (1-smoothing) * value;


    function updateFunction() {
      const filterMeterValues = filterMeters.map(meter => meter())
      const overallInputLevel  = smoothedOverallInputMeter()
      if (overallInputLevel === null)
        return false
      const normalizedFilterMeterValues = filterMeterValues.map(level => {
        return level - overallInputLevel
      })
    //   console.log(normalizedFilterMeterValues, overallInputLevel)
      const chordTriggered = (
        all(level => level > -20, normalizedFilterMeterValues) &&
        overallInputLevel > -10
      )
  
      const newChordTriggered = !previousChordTriggered && chordTriggered
      previousChordTriggered = chordTriggered
      return newChordTriggered
    }
    return updateFunction
  }