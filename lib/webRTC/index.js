const CONFIG = {iceServers: [{urls: 'stun:stun.l.google.com:19302'}]}

export class Peer {
  constructor() {
    this.config = CONFIG
    this.dataChannelOptions = {ordered: true, maxRetransmitTime: 3000}
    this.type = null
    this.pc = new RTCPeerConnection(this.config)
    this.localSDP = null
    this.remoteSDP = null
    this.dc = null
    this.status = 'closed'
    this.iceResolve = null
    this.reject = null
    this.pc.onicecandidate = this.onIceCandidate.bind(this)
    this.pc.onconnectionstatechange = this.onConnectionStateChange.bind(this)
    this.pc.ondatachannel = this.onDataChannel.bind(this)
    this.onDisconnect = []
  }

  setIceResolve(resolve, reject) {
    if (this.iceResolve) this.reject()
    this.iceResolve = () => {
      this.localSDP = this.pc.localDescription.sdp
      resolve(this.localSDP)
      this.iceResolve = null
    }
    this.reject = reject
  }

  createOfferSdp() {
    return new Promise((resolve, reject) => {
      this.type = 'offerer'
      this.setIceResolve(resolve, reject)
      this.dc = this.pc.createDataChannel('data-channel', this.dataChannelOptions)
      this.setupDataChannel(this.dc)
      this.pc.createOffer()
        .then(sdp => this.pc.setLocalDescription(sdp))
        .then(() => {
          console.log('setLocalDescription succeeded.')
        })
        .catch(err => console.error('Error creating offer:', err))
    })
  }

  setOfferSdp(sdp) {
    return new Promise((resolve, reject) => {
      this.type = 'answerer'
      this.remoteSDP = sdp
      this.setIceResolve(resolve, reject)
      this.pc.setRemoteDescription({type: 'offer', sdp}).then(() => {
        console.log('setRemoteDescription succeeded.')
      })
      this.pc.createAnswer().then((sdp) => {
        console.log('createAnswer succeeded.')
        return this.pc.setLocalDescription(sdp)
      }).then(function() {
        console.log('setLocalDescription succeeded.')
      })
    })
  }

  setAnswerSdp(sdp) {
    return new Promise((resolve) => {
      this.remoteSDP = sdp
      this.pc.setRemoteDescription({type: 'answer', sdp}).then(() => {
        resolve()
      })
    })
  }

  setupDataChannel = (dc) => {
    dc.onerror = this.onDataChannelError
    dc.onmessage = this.onDataChannelMessage
    dc.onopen = this.onDataChannelOpen
    dc.onclose = this.onDataChannelClose
  }

  onIceCandidate({candidate}) {
    if (candidate) {
      console.debug(candidate)
      console.debug('Collecting ICE candidates')
    } else {
      console.debug('Collecting done')
      this.iceResolve()
    }
  }

  onDataChannel(evt) { // remoteからDC来た時
    this.setupDataChannel(evt.channel)
    this.dc = evt.channel
  }

  onDataChannelError(error) {
    console.debug('Data channel error:', error)
  }

  onDataChannelMessage(evt) {
    console.debug('Data channel message:', evt)
  }

  onDataChannelOpen = (evt) => {
    console.log('Data channel opened:', evt)
  }

  onDataChannelClose() {
    console.log('Data channel closed.')
  }

  onConnectionStateChange() {
    switch (this.pc.connectionState) {
    case 'connected':
      this.status = 'connected'
      break
    case 'disconnected':
    case 'failed':
      this.status = 'disconnected'
      break
    case 'closed':
      this.status = 'closed'
      break
    }
  }

  sendMessage(message) {
    if (!this.pc || this.pc.connectionState !== 'connected') {
      console.error('PeerConnection is not established.')
      return
    }
    if (this.dc) {
      this.dc.send(JSON.stringify(message))
    }
  }
  bu
}
