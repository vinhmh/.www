const AudioContext = window.AudioContext || window.webkitAudioContext;

export default class AudioIbpAnalyser {
  constructor(deviceId, canvas, permit, isInterpreting, outputStream) {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.isInterpreting = isInterpreting || false;
    this.canvas = canvas;
    this.mediaStreamSource = null;
    this.permit = permit;
    this.processor = null;
    this.stream = null;
    this.outputStream = outputStream;
    this.init(deviceId);
  }

  init = async (deviceId) => {
    if (!this.canvas) return;
    this.canvasContext = this.canvas.getContext("2d");
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    // Create an AudioNode from the stream.
    if (!this.deviceId && !this.isInterpreting) {
        console.log("stream before : " + this.stream);
        try {
          this.stream = await navigator.mediaDevices.getUserMedia({
            audio: { deviceId: { exact: deviceId } },
          });
          this.permit();
        } catch (e) {
          Logger.error(e);
          console.log("error stream " + e);
          this.permit(false, e, true);
          return;
        }
        console.log("stream after : " + this.stream);
        this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.stream);

    } else {
        console.log("AudiIbpAnalyser outputsTream : " + this.outputStream);
        this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.outputStream);
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 1.0;
        this.mediaStreamSource.connect(gainNode);
    }

    console.log("AudiIbpAnalyser mediaStreamSource : " + this.mediaStreamSource);

    // Create a new volume meter and connect it.
    this.processor = this.createAudioMeter(this.audioContext);
    this.mediaStreamSource.connect(this.analyser);
    this.mediaStreamSource.connect(this.processor);
    this.drawLoop();
  };

  stopStream() {
    console.log("stopStream stream before : " + this.stream);
    if (!this.stream) return;
    try {
      const tracks = this.stream.getTracks();
      for (const i in tracks) {
        const mst = tracks[i];
        if (mst !== null && mst !== undefined) {
          mst.stop();
        }
      }
      this.stream = null;
    } catch (e) {
      Logger.error("Can't stop tracks in stream");
    }
    console.log("stopStream stream after : " + this.stream);
  }

  stop() {
    this.stopStream();
    if (!this.processor) return;
    this.processor.shutdown();
    this.processor = null;
    cancelAnimationFrame(this.drawLoop);
  }

  createAudioMeter(audioContext, clipLevel, averaging, clipLag) {
    const processor = audioContext.createScriptProcessor(512);
    processor.onaudioprocess = this.volumeAudioProcess;
    processor.clipping = false;
    processor.lastClip = 0;
    processor.volume = 0;
    processor.clipLevel = clipLevel || 0.98;
    processor.averaging = averaging || 0.95;
    processor.clipLag = clipLag || 750;

    // this will have no effect, since we don't copy the input to the output,
    // but works around a current Chrome bug.
    processor.connect(audioContext.destination);

    processor.checkClipping = function () {
      if (!this.clipping) {
        return false;
      }
      if (this.lastClip + this.clipLag < window.performance.now()) {
        this.clipping = false;
      }
      return this.clipping;
    };

    processor.shutdown = function () {
      this.disconnect();
      this.onaudioprocess = null;
    };

    return processor;
  }

  volumeAudioProcess(event) {
    const buf = event.inputBuffer.getChannelData(0);
    const bufLength = buf.length;
    let sum = 0;
    let x;

    // Do a root-mean-square on the samples: sum up the squares...
    for (let i = 0; i < bufLength; i++) {
      x = buf[i];
      if (Math.abs(x) >= this.clipLevel) {
        this.clipping = true;
        this.lastClip = window.performance.now();
      }
      sum += x * x;
    }

    // ... then take the square root of the sum.
    const rms = Math.sqrt(sum / bufLength);

    // Now smooth this out with the averaging factor applied
    // to the previous sample - take the max here because we
    // want "fast attack, slow release."
    this.volume = Math.max(rms, this.volume * this.averaging);
  }

  /**
   * Draws a rounded rectangle using the current state of the canvas.
   * If you omit the last three params, it will draw a rectangle
   * outline with a 5 pixel border radius
   * @param {CanvasRenderingContext2D} ctx
   * @param {Number} x The top left x coordinate
   * @param {Number} y The top left y coordinate
   * @param {Number} width The width of the rectangle
   * @param {Number} height The height of the rectangle
   * @param {Number} [radius = 5] The corner radius; It can also be an object
   *                 to specify different radii for corners
   * @param {Number} [radius.tl = 0] Top left
   * @param {Number} [radius.tr = 0] Top right
   * @param {Number} [radius.br = 0] Bottom right
   * @param {Number} [radius.bl = 0] Bottom left
   * @param {Boolean} [fill = false] Whether to fill the rectangle.
   * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
   */
  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === "undefined") {
      stroke = true;
    }
    if (typeof radius === "undefined") {
      radius = 5;
    }
    if (typeof radius === "number") {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
      var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
      for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius.br,
      y + height
    );
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
  }

  drawLoop = () => {
    if (!this.processor) return;
    console.log("draw");
    // set up the next visual callback
    window.requestAnimationFrame(this.drawLoop);

    let WIDTH = this.width;
    let HEIGHT = this.height;

    let bufferLength = this.analyser.frequencyBinCount;

    var barHeight = 0;

    let x = 0;

    // this.analyser.getByteTimeDomainData(this.dataArray);
    this.analyser.getByteFrequencyData(this.dataArray);

    // clear the background
    this.canvasContext.clearRect(0, 0, this.width, this.height);
    let bar1 = null;
    let bar2 = null;
    let bar3 = null;
    let bar4 = null;

    if (this.isInterpreting) {
      let barWidth = WIDTH / 12;

      console.log("is interpreting");
      // Interpreter wave
      this.canvasContext.fillStyle = "#3af328";
      for (let i = 0; i < bufferLength; i++) {
        if (
          i > bufferLength * 0.2 &&
          i < bufferLength * 0.25 &&
          this.dataArray[i] >= 1
        ) {
          if (bar1 === null) bar1 = Math.floor(this.dataArray[i] * 1.2);
          else continue;
        }
        if (
          i > bufferLength * 0.25 &&
          i < bufferLength * 0.3 &&
          this.dataArray[i] >= 1
        ) {
          if (bar2 === null) bar2 = Math.floor(this.dataArray[i] / 1.2);
          else continue;
        }
        if (
          i > bufferLength * 0.3 &&
          i < bufferLength * 0.35 &&
          this.dataArray[i] >= 1
        ) {
          if (bar3 === null) bar3 = Math.floor(this.dataArray[i] * 1.2);
          else continue;
        }
        if (
          i > bufferLength * 0.35 &&
          i < bufferLength * 0.4 &&
          this.dataArray[i] >= 1
        ) {
          if (bar4 === null) bar4 = Math.floor(this.dataArray[i] * 1.1);
          else continue;
        }
      }
      console.log({ bar1, bar2, bar3, bar4 });
      x += barWidth + 10;
      this.canvasContext.fillRect(x, HEIGHT / 2 - bar1, barWidth, bar1 || 5);
      this.canvasContext.fillRect(x, HEIGHT / 2, barWidth, bar1 || 5);
      x += barWidth + 10;
      this.canvasContext.fillRect(x, HEIGHT / 2 - bar2, barWidth, bar2 || 5);
      this.canvasContext.fillRect(x, HEIGHT / 2, barWidth, bar2 || 5);
      x += barWidth + 10;
      this.canvasContext.fillRect(x, HEIGHT / 2 - bar3, barWidth, bar3 || 15);
      this.canvasContext.fillRect(x, HEIGHT / 2, barWidth, bar3 || 15);
      x += barWidth + 10;
      this.canvasContext.fillRect(x, HEIGHT / 2 - bar4, barWidth, bar4 || 10);
      this.canvasContext.fillRect(x, HEIGHT / 2, barWidth, bar4 || 10);
    } else {
      // Regular user wave
      let barWidth = (WIDTH / bufferLength) * 8;

      this.canvasContext.fillStyle = "#1100ff";
      for (let i = 0; i < Math.floor(bufferLength / 0.33); i++) {
        barHeight = Math.floor(this.dataArray[i] / 2.25);
        this.canvasContext.fillRect(
          x,
          HEIGHT / 2 - barHeight,
          barWidth,
          barHeight
        );
        this.canvasContext.fillRect(x, HEIGHT / 2, barWidth, barHeight);

        x += barWidth;
      }
    }

    // Oscilloscope wave
    // if (this.isInterpreting) this.canvasContext.strokeStyle = "#3af328";
    // else this.canvasContext.strokeStyle = "#1100ff";
    // this.canvasContext.lineWidth = 2;
    // const sliceWidth = (this.width) / this.dataArray.length;
    // this.canvasContext.beginPath();
    // this.canvasContext.moveTo(0, this.height / 2);
    // for (const item of this.dataArray) {
    //   const y = (item / 255.0) * this.height;
    // //   this.canvasContext.moveTo(x + 0.5, 0);
    //   this.canvasContext.lineTo(x + 0.5, y);
    //   x += sliceWidth;
    // }
    // // this.canvasContext.moveTo(x + 0.5, 0);
    // this.canvasContext.lineTo(x, this.height / 2);
    // this.canvasContext.stroke();

    // check if we're currently clipping
    // if (this.processor.checkClipping()) {
    //   this.canvasContext.fillStyle = "red";
    // } else {
    //   this.canvasContext.fillStyle = "#0abb13";
    // }

    // draw a bar based on the current volume
    // const volume = this.processor.volume * 1.4;
    // this.canvasContext.fillRect(0, 0, volume * this.width, this.height);
  };

  //   away = () => {
  //     this.analyser.getByteTimeDomainData(this.dataArray);
  //     console.log("grid time yeah");

  //     let grid = new Grid(200, 1);
  //     console.log(grid);
  //     this.canvasContext.clearRect(0, 0, this.width, this.height);
  //     for (let i = 0; i < grid.length; i++) {
  //       console.log("loop grid");
  //       let s = this.mapSound(i, grid.length, 5, this.height / 4);
  //       this.canvasContext.fillStyle = rgb(0);
  //       this.canvasContext.fillRect(
  //         grid.x[i],
  //         grid.y[i] - s / 2,
  //         grid.spacing_x - 0.5,
  //         s
  //       );
  //     }
  //   };
}
