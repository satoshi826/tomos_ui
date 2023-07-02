
export class Animation {
  constructor({callback, interval = null} = {}) {

    this.callback = callback
    this.interval = interval
    this.unix = 0
    this.delta = 0
    this.drawTime = 0
    this.startTime = null
    this.elapsed = 0

    const recordTime = () => {
      const nowTime = performance.now()
      this.delta = nowTime - this.unix
      this.unix = nowTime
      this.elapsed = nowTime - this.startTime
    }

    const handler = interval
      ? setTimeout
      : requestAnimationFrame

    let tmpTime
    this.animeCallback = () => {
      tmpTime = performance.now()
      recordTime()
      callback({unix: this.unix, delta: this.delta, drawTime: this.drawTime, elapsed: this.elapsed})
      this.drawTime = performance.now() - tmpTime
      handler(this.animeCallback, this.interval)
    }
  }

  start = () => {
    this.startTime = performance.now()
    this.animeCallback()
  }
}