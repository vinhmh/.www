const AudioContext = window.AudioContext || window.webkitAudioContext

export default class AudioMeter {
  constructor(deviceId, canvas, permit) {
    this.audioContext = new AudioContext()
    this.canvas = canvas
    this.mediaStreamSource = null
    this.permit = permit
    this.processor = null
    this.stream = null
    this.init(deviceId)
  }

  init = async (deviceId) => {
    if (!this.canvas) return
    this.canvasContext = this.canvas.getContext('2d')
    this.width = this.canvas.width
    this.height = this.canvas.height

    this.stopStream()
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: deviceId } } })
      this.permit()
    } catch (e) {
      Logger.error(e)
      this.permit(false, e, true)
      return
    }

    // Create an AudioNode from the stream.
    this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.stream)
    //
    // // Create a new volume meter and connect it.
    this.processor = this.createAudioMeter(this.audioContext)
    this.mediaStreamSource.connect(this.processor)
    this.drawLoop()
  }

  stopStream() {
    if (!this.stream) return
    try {
      const tracks = this.stream.getTracks()
      for (const i in tracks) {
        const mst = tracks[i]
        if (mst !== null && mst !== undefined) {
          mst.stop()
        }
      }
      this.stream = null
    } catch (e) {
      Logger.error("Can't stop tracks in stream")
    }
  }

  stop() {
    this.stopStream()
    if (!this.processor) return
    this.processor.shutdown()
    this.processor = null
  }

  createAudioMeter(audioContext, clipLevel, averaging, clipLag) {
    const processor = audioContext.createScriptProcessor(512)
    processor.onaudioprocess = this.volumeAudioProcess
    processor.clipping = false
    processor.lastClip = 0
    processor.volume = 0
    processor.clipLevel = clipLevel || 0.98
    processor.averaging = averaging || 0.95
    processor.clipLag = clipLag || 750

    // this will have no effect, since we don't copy the input to the output,
    // but works around a current Chrome bug.
    processor.connect(audioContext.destination)

    processor.checkClipping = function () {
      if (!this.clipping) {
        return false
      }
      if ((this.lastClip + this.clipLag) < window.performance.now()) {
        this.clipping = false
      }
      return this.clipping
    }

    processor.shutdown = function () {
      this.disconnect()
      this.onaudioprocess = null
    }

    return processor
  }

  volumeAudioProcess(event) {
    const buf = event.inputBuffer.getChannelData(0)
    const bufLength = buf.length
    let sum = 0
    let x

    // Do a root-mean-square on the samples: sum up the squares...
    for (let i = 0; i < bufLength; i++) {
      x = buf[i]
      if (Math.abs(x) >= this.clipLevel) {
        this.clipping = true
        this.lastClip = window.performance.now()
      }
      sum += x * x
    }

    // ... then take the square root of the sum.
    const rms = Math.sqrt(sum / bufLength)

    // Now smooth this out with the averaging factor applied
    // to the previous sample - take the max here because we
    // want "fast attack, slow release."
    this.volume = Math.max(rms, this.volume * this.averaging)
  }

  drawLoop = () => {
    if (!this.processor) return
    // clear the background
    this.canvasContext.clearRect(0, 0, this.width, this.height)

    // check if we're currently clipping
    if (this.processor.checkClipping()) {
      this.canvasContext.fillStyle = 'red'
    } else {
      this.canvasContext.fillStyle = '#0abb13'
    }

    // draw a bar based on the current volume
    const volume = this.processor.volume * 1.4
    this.canvasContext.fillRect(0, 0, volume * this.width, this.height)

    // set up the next visual callback
    window.requestAnimationFrame(this.drawLoop)
  }
}
