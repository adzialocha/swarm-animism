const UPDATE_RATE = 20
const HP_FREQUENCY = 300
const LP_FREQUENCY = 4000

export default class Audio {
  setup() {
    const Tone = require('tone')

    this.agents = []

    // Start our runtime
    this.startTime = Date.now()

    // Create audio nodes
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
  }

  update() {
    setTimeout(() => {
      const values = this.analyser.getValue()

      this.agents.forEach(agent => {
        agent.update(values)
      })

      this.update()
    }, UPDATE_RATE)
  }
}
