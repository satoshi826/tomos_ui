
export class Peer {
  constructor(config) {
    this.config = config ?? {iceServers: [{urls: 'stun:stun.l.google.com:19302'}]}
    this.dataChannelOptions = {ordered: true, maxRetransmitTime: 3000}
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
  }

  setIceResolve(resolve, reject, type) {
    if (this.iceResolve) this.reject()
    this.iceResolve = () => {
      this[`${type}SDP`] = this.pc[`${type}Description`].sdp
      resolve(this.pc[`${type}Description`].sdp)
      this.iceResolve = null
    }
    this.reject = reject
  }

  init() {
    return new Promise((resolve, reject) => {
      this.setIceResolve(resolve, reject, 'local')
      this.dc = this.pc.createDataChannel('test-data-channel', this.dataChannelOptions)
      this.setupDataChannel(this.dc)
      this.pc.createOffer()
        .then(sdp => this.pc.setLocalDescription(sdp))
        .then(() => {
          console.log('setLocalDescription() succeeded.')
        })
        .catch(err => console.error('Error creating offer:', err))
    })
  }

  setOfferSdp(sdp) {
    return new Promise((resolve, reject) => {
      this.setIceResolve(resolve, reject, 'remote')
      this.pc.setRemoteDescription({type: 'offer', sdp}).then(() => {
        console.log('setRemoteDescription() succeeded.')
      })
      this.pc.createAnswer().then((sdp) => {
        console.log('createAnswer() succeeded.')
        return this.pc.setLocalDescription(sdp)
      }).then(function() {
        console.log('setLocalDescription() succeeded.')
      })
    })
  }

  setAnswerSdp(sdp) {
    // return new Promise((resolve, reject) => {
    //   this.setResolve(resolve, reject)
    //   this.pc.setRemoteDescription({type: 'offer', sdp}).then(() => {
    //     console.log('setRemoteDescription() succeeded.')
    //     this.RemoteSDP = this.pc.remoteDescription.sdp
    //   })
    //   this.pc.createAnswer().then((sdp) => {
    //     console.log('createAnswer() succeeded.')
    //     return this.pc.setLocalDescription(sdp)
    //   }).then(function() {
    //     console.log('setLocalDescription() succeeded.')
    //   })
    // })
  }

  setupDataChannel = (dc) => {
    dc.onerror = this.onDataChannelError
    dc.onmessage = this.onDataChannelMessage
    dc.onopen = this.onDataChannelOpen
    dc.onclose = this.onDataChannelClose
  }

  onIceCandidate({candidate}) {
    if (candidate) {
      console.log(candidate)
      console.log('Collecting ICE candidates')
    } else {
      this.iceResolve()
    }
  }

  onDataChannel(evt) { // remoteからDC来た時
    this.setupDataChannel(evt.channel)
    this.dc = evt.channel
  }

  onDataChannelError(error) {
    console.log('Data channel error:', error)
  }

  onDataChannelMessage(evt) {
    console.log('Data channel message:', evt.data)
    let msg = evt.data
    console.log(msg)
  }

  onDataChannelOpen(evt) {
    console.log('Data channel opened:', evt)
    this.sendMessage()
  }

  onDataChannelClose() {
    console.log('Data channel closed.')
  }

  onConnectionStateChange(evt) {
    const pc = evt.target
    switch (pc.connectionState) {
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

  sendMessage() {
    if (!this.pc || this.pc.connectionState !== 'connected') {
      alert('PeerConnection is not established.')
      return
    }

    if (this.dataChannel) {
      this.dataChannel.send('hoge')
    }
  }

}
