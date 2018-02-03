const UPDATE_RATE = 20
const HP_FREQUENCY = 300
const LP_FREQUENCY = 4000

import bandpassChordDetector from '../behaviours/bandpassPolyTracker'

const PRESET_CHORDS = {
  'phase1': [61, 63, 73, 85],
  'phase2': [62, 64, 74, 86],
  'phase3': [63, 65, 75, 87],
}

export default class Audio {
  setup(useMic) {
    const Tone = require('tone')

    this.agents = []

    // Start our runtime
    this.startTime = Date.now()

    if (useMic) {
      // Create simple mic, gain and analysis chain
      this.mic = new Tone.UserMedia()
      this.analyser = new Tone.Waveform(512)
      this.gain = new Tone.Volume()

      // Make the frequency band a little bit more narrow
      const highpass = new Tone.Filter({
        frequency: HP_FREQUENCY,
        type: 'highpass',
        rolloff: -12,
        Q: 0.5,
      })

      const lowpass = new Tone.Filter({
        frequency: LP_FREQUENCY,
        type: 'lowpass',
        rolloff: -12,
        Q: 0.5,
      })

      // Use gain to control volume of microphone
      this.mic.connect(highpass)
      highpass.connect(lowpass)
      lowpass.connect(this.gain)
      this.gain.connect(this.analyser)

      // Listen ...
      this.mic.open()

      this.detectors = []
    }

    // Start a frequent check by calling the agents update function
    this.update()

    return true
  }

  close() {
    this.mic.close()
  }

  setAgents(agents) {
    this.agents = agents
    this.agents.forEach(agent => {
      agent.start()
    })

    Object.keys(PRESET_CHORDS).forEach(key => {
      this.detectors.push(
        bandpassChordDetector(PRESET_CHORDS[key], this.gain)
      )
    })
  }

  update() {
    setTimeout(() => {
      const runtime = Date.now() - this.startTime
      const values = this.analyser.getValue()

      // Debug
      const chordState = this.detectors.map(d => d())
      console.log(chordState.join(','))

      this.agents.forEach((agent, index) => {
        // if (this.mic) {
          const values = this.analyser.getValue()
          agent.update(values, runtime, this.gain, chordState)
        // } else {
        //   agent.update([], runtime, null, null)
        // }
      })

      this.update()
    }, UPDATE_RATE)
  }
}
