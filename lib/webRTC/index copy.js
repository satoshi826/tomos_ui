
class Peer {
  constructor(config) {
    this.config = config ?? {iceServers: [{urls: 'stun:stun.l.google.com:19302'}]}
    this.dataChannelOptions = {ordered: true, maxRetransmitTime: 3000}
    this.pc = new RTCPeerConnection(this.config)
    this.dc = null
    this.status = 'closed'
    this.pc.onicecandidate = this.onIceCandidate.bind(this)
    this.pc.onconnectionstatechange = this.onConnectionStateChange.bind(this)
    this.pc.ondatachannel = this.onDataChannel.bind(this)
  }

  startPeerConnection() {
    this.dc = this.pc.createDataChannel('test-data-channel', this.dataChannelOptions)
    this.setupDataChannel(this.dc)

    this.peerConnection.createOffer()
      .then(sessionDescription => this.peerConnection.setLocalDescription(sessionDescription))
      .then(() => {
        console.log('setLocalDescription() succeeded.')
        document.getElementById('status').value = 'offer created'
      })
      .catch(err => console.error('Error creating offer:', err))
  }

  setupDataChannel(dc) {
    dc.onerror = this.onDataChannelError.bind(this)
    dc.onmessage = this.onDataChannelMessage.bind(this)
    dc.onopen = this.onDataChannelOpen.bind(this)
    dc.onclose = this.onDataChannelClose.bind(this)
  }

  onDataChannel(evt) {
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
  }

  onDataChannelClose() {
    console.log('Data channel closed.')
  }

  onConnectionStateChange(evt) {
    const pc = evt.target
    switch (pc.connectionState) {
    case 'connected':
      document.getElementById('status').value = 'connected'
      break
    case 'disconnected':
    case 'failed':
      document.getElementById('status').value = 'disconnected'
      break
    case 'closed':
      document.getElementById('status').value = 'closed'
      break
    }
  }

  setRemoteSdp() {
    const sdptext = document.getElementById('remoteSDP').value
    const sessionDescription = {type: 'answer', sdp: sdptext}

    if (this.peerConnection) {
      this.peerConnection.setRemoteDescription(sessionDescription)
        .then(() => console.log('setRemoteDescription() succeeded.'))
        .catch(err => console.error('Error setting remote description:', err))
    } else {
      const offer = {type: 'offer', sdp: sdptext}

      this.peerConnection = this.createPeerConnection()
      this.peerConnection.setRemoteDescription(offer)
        .then(() => console.log('setRemoteDescription() succeeded.'))
        .catch(err => console.error('Error setting remote description:', err))

      this.peerConnection.createAnswer()
        .then(sessionDescription => this.peerConnection.setLocalDescription(sessionDescription))
        .then(() => {
          console.log('setLocalDescription() succeeded.')
          document.getElementById('status').value = 'answer created'
        })
        .catch(err => console.error('Error creating answer:', err))
    }
  }

  sendMessage() {
    if (!this.peerConnection || this.peerConnection.connectionState !== 'connected') {
      alert('PeerConnection is not established.')
      return
    }

    const msg = document.getElementById('message').value
    document.getElementById('message').value = ''
    document.getElementById('history').value = 'me> ' + msg + '\n' + document.getElementById('history').value

    if (this.dataChannel) {
      this.dataChannel.send(msg)
    }
  }

}
