import Tone from 'tone'

export default class Audio {
  setup() {
    // Start our runtime
    this.startTime = Date.now()

    // Create simple mic and analysis chain
    this.mic = new Tone.UserMedia()
    this.analyser = new Tone.Waveform(256)
    this.gain = new Tone.Volume()

    this.mic.connect(this.gain)
    this.gain.connect(this.analyser)

    this.mic.open()

    // Start a frequent check by calling the agents update function
    this.update()

    return true
  }

  close() {
    this.mic.close()
  }

  setAgent(agent) {
    this.agent = agent
    this.agent.start()
  }

  update() {
    window.requestAnimationFrame(() => {
      if (!this.agent) {
        return
      }

      const values = this.analyser.getValue()
      const runtime = Date.now() - this.startTime

      this.agent.update(values, runtime, this.gain)

      this.update()
    }, this)
  }
}
