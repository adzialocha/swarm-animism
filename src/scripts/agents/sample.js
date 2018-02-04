import sample from '../../files/crackles.wav'

import { randomRange } from '../utils'

const defaultOptions = {
  minVolume: 0.25,
  maxVolume: 0.9,
  minLFOFrequency: 0.1,
  maxLFOFrequency: 1,
}

export default class SampleAgent {
  constructor(options = {}, visuals, gainNode) {
    const Tone = require('tone')

    this.options = Object.assign({}, defaultOptions, options)

    this.visuals = visuals

    // Sampler
    this.synth = new Tone.Sampler({
      'C3': sample,
    }, () => {
      this.synth.triggerAttack(60)
    })

    // Control volume of sampler
    this.synthGainNode = new Tone.Gain()

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

    // Connect all nodes
    this.synth.connect(this.synthGainNode)
    this.gainLFO.connect(this.synthGainNode.gain)
    this.synthGainNode.toMaster()
  }

  start() {
    // unused
  }

  update(signal) {
    // unused
  }
}
