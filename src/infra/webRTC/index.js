
let peerConnectionConfig = {iceServers: [{urls: 'stun:stun.l.google.com:19302'}]}
let dataChannelOptions = {
  ordered          : true,
  maxRetransmitTime: 3000
}

export const webRTC = {
  pc              : new RTCPeerConnection(peerConnectionConfig),
  hostDc          : null,
  remoteDcs       : [],
  localDescription: null,
  async init({onGetLocalDescription}) {
    this.pc.onicecandidate = (evt) => {
      if (evt.candidate) {
        console.log(evt.candidate)
        console.log('Collecting ICE candidates')
      } else {
        console.log('localDescription')
        console.log(this.pc.localDescription.sdp)
        this.localDescription = this.pc.localDescription.sdp
        onGetLocalDescription(this.pc.localDescription.sdp)
      }
    }
    this.pc.onconnectionstatechange = () => {
      console.log(this.pc.connectionState)
    }
    this.pc.ondatachannel = function(evt) {
      setupDataChannel(evt.channel)
      this.remoteDcs.push(evt.channel)
      console.log(this.remoteDcs)
    }
    this.hostDc = this.pc.createDataChannel('my-channel', dataChannelOptions)
    setupDataChannel(this.hostDc)

    const sessionDescription = this.pc.createOffer()
    return this.pc.setLocalDescription(await sessionDescription)
  }
}


const setupDataChannel = (dc) => {
  dc.onerror = (error) => {
    console.log('Data channel error:', error)
  }
  dc.onmessage = (evt) => {
    console.log('Data channel message:', evt.data)
  }
  dc.onopen = (evt) => {
    console.log('Data channel opened:', evt)
  }
  dc.onclose = () => {
    console.log('Data channel closed.')
  }
}