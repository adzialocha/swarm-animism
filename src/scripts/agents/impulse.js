import Meyda from 'meyda'
import {difference,all} from 'ramda'
const RMS_SENSITIVITY = 0.05
const MUTE_SENSITIVITY = 0.001
const NOISEINESS_TRESHOLD = 0.12
const TRIGGER_CHROMA_KEYS = [60, 65]

const DELAY_TIME_BASE=0.500;

export default class ImpulseAgent {
  constructor(options = {}, visuals, gainNode) {
    const Tone = require('tone')

    this.visuals = visuals
    this.converter = new Tone.Frequency()
    this.meter = new Tone.Meter()

    this.filterMeters = TRIGGER_CHROMA_KEYS.map(key => {
      const filter = new Tone.Filter({
        frequency:this.converter.midiToFrequency(key),
        type: 'bandpass',
        rolloff: -48,
        Q: 20,
        gain: 0,
        });
      gainNode.connect(filter);
      const meter = new Tone.Meter();
      filter.connect(meter);
      return meter;
    })
    this.previousChordTriggered = false;

    this.overallInputMeter = new Tone.Meter();

    gainNode.connect(this.overallInputMeter);
    // this.filters.forEach(filter =>)
  //   this.synth = new Tone.PolySynth(1, Tone.Synth, {
  //     oscillator: {
  //       partials: [0, 2, 3, 4, 8],
  //     },
  //     envelope : {
  //       attack: 0.05,
  //       decay: 0.05,
  //       sustain: 0.1,
  //       release: 0.1,
  //     },
  //   }).connect(this.meter)

    
    this.delay = new Tone.Delay ( DELAY_TIME_BASE,DELAY_TIME_BASE*100).connect(this.meter)
    this.synth = new Tone.NoiseSynth({
      noise:{type:"brown"},
          envelope : {
        attack: 0.5,
        decay: 0.05,
        sustain: 1,
        release: 0.7,
      },
    }).connect(this.delay)
    this.meter.toMaster()
  }

  start() {
    Meyda.bufferSize = 512
  }

  update(signal, runtime, gainNode) {
    const features = Meyda.extract([
      'rms',
      'chroma',
    ], signal)

    const { chroma, rms } = features

    // Calculate the noiseiness of the whole signal
    const noiseiness = chroma.reduce((a, b) => a + b, 0) / chroma.length

    // Order the chroma keys so we get the strongest ones at the top
    // const strongestKeys = chroma.reduce((acc, value, index) => {
    //   acc.push({
    //     key: index,
    //     value,
    //   })

    //   return acc
    // }, []).sort((a, b) => b.value - a.value).map(a => a.key)

    // // Check if the strongest keys match the ones we need (this does not work yet)
    // const topStrongestKeys = strongestKeys.slice(0,TRIGGER_CHROMA_KEYS.length);
    // const isChromaTriggered = difference(topStrongestKeys, TRIGGER_CHROMA_KEYS).length === 0

    // console.log("isChromaTriggered",isChromaTriggered,topStrongestKeys)
    // Mute the microphone gain when we agent makes sound

    const filterMeterValues = this.filterMeters.map(meter => meter.getLevel())
    const overallInputLevel  = this.overallInputMeter.getLevel();

    const normalizedFilterMeterValues = filterMeterValues.map(level => level - overallInputLevel)
    const chordTriggered = all(level => level > -15, normalizedFilterMeterValues)  && overallInputLevel >-20

    console.log(chordTriggered, normalizedFilterMeterValues);
   
    const synthValue = Math.abs(this.meter.getValue())
    // gainNode.mute = synthValue > MUTE_SENSITIVITY

    // Check some requirements before we really can make sound
    if (
      // rms > RMS_SENSITIVITY
      chordTriggered && !this.previousChordTriggered
      // && noiseiness < NOISEINESS_TRESHOLD
      // && isChromaTriggered
    ) {
      this.visuals.flash()
      this.delay.delayTime.setValueAtTime(DELAY_TIME_BASE * Math.ceil(Math.random()*8)*DELAY_TIME_BASE,"+0")
      this.synth.triggerAttackRelease( 0.1)
    }
    this.previousChordTriggered = chordTriggered;
  }
}
