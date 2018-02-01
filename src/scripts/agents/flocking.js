import Tone from 'tone'

import {a as aWeighting} from "a-weighting"

console.log("a-weighting",aWeighting);

const INITIAL_NOTE = Math.random()*48+48
const FILTER_RANGE = 7
const VELOCITY = 0.03

const PLAY_NOTE_OFFSET = 7*(Math.floor(Math.random()*3)-1);
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
      rolloff: -48,
      Q: 0.7,
      gain: 0,
    })

    this.filterRight = new Tone.Filter({
      frequency: converter.midiToFrequency(INITIAL_NOTE + FILTER_RANGE),
      type: 'bandpass',
      rolloff: -48,
      Q: 0.7,
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
    const leftFilterFreq = this.filterLeft.frequency.value
    const rightFilterFreq = this.filterRight.frequency.value

    const weightedLeftMeterValue = aWeighting(leftFilterFreq) * leftMeterValue;
    const weightedRightMeterValue = aWeighting(rightFilterFreq) * rightMeterValue;

    if  (!(isFinite(rightMeterValue) && isFinite(leftMeterValue)))
      return;
    this.velocity = Math.min(Math.max((rightMeterValue - leftMeterValue) *VELOCITY,-3),3);
    // if (leftMeterValue < rightMeterValue) {
    //   this.velocity = VELOCITY
    // } else {
    //   this.velocity = -VELOCITY
    // }


    console.log(leftMeterValue, rightMeterValue, this.velocity)
 
    console.log(leftMeterValue-rightMeterValue);

    
    this.currentNote += this.velocity
    const nextFrequency = converter.midiToFrequency(this.currentNote)

    // console.log('=========')
    
    
   
    const left = converter.midiToFrequency(this.currentNote - FILTER_RANGE)
    const right = converter.midiToFrequency(this.currentNote + FILTER_RANGE)

    this.filterLeft.frequency.setValueAtTime(left, '+0')
    this.filterRight.frequency.setValueAtTime(right, '+0')

    this.synth.setNote(nextFrequency)
  }
}
