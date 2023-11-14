/* eslint-disable no-unsafe-optional-chaining */
import {Peer} from '../../../lib/webRTC'
import {partition, oForEach, oForEachV, oMap, isExpiration, override} from '../../../lib/util'
import {infra4} from '..'
import {getAddUsers} from '../../core/user'

let peerCount = 0
const DEFAULT_INTERVAL = 5000
const MAX_PEER = 10

export class PeerManager {
  constructor({myUserId} = {}) {
    this.peerMap = {}
    this.myUserId = myUserId
    this.messageHandler = {}
    this.signalingInterval = DEFAULT_INTERVAL
    this.signalingLoopId = null
    this.signalingLoop()
  }

  addMessageHandler(type, func) {
    this.messageHandler[type] ??= []
    this.messageHandler[type].push(func)
  }

  dispatch({type, from, value}) {
    this.messageHandler[type]?.forEach(f => f({from, value}))
  }

  getUsers() {
    const users = oMap(getAddUsers(), ([id, v]) => ({id, ...v}))
    return users?.filter(u => isExpiration(u.update, 300)
    && u.id !== this.myUserId
    )
  }

  async getOffers() {
    const notif = await infra4({ttl: 1, series: true, diff: true}).notification.pull({sub: this.myUserId}) // updateでフィルタする
    return notif.filter(({type, time}) => type === 'offerSDP' && isExpiration(time, 300))
  }

  async getAnswers() {
    const notif = await infra4({ttl: 1, series: true, diff: true}).notification.pull({sub: this.myUserId})
    return notif.filter(({type, time}) => type === 'answerSDP' && isExpiration(time, 300))
  }

  async sendOffer({id, sdp, key}) {
    return infra4({throttle: 1, parallel: true}).user.sendOffer({ // peerの状態で分岐入れたい
      sub: id, sdp, pub: this.myUserId, key
    })
  }

  async sendAnswer({id, sdp, key}) {
    return infra4({throttle: 1, parallel: true}).user.sendAnswer({
      sub: id, sdp, pub: this.myUserId, key
    })
  }

  async dcSendForId() {
    throw 'override me'
  }

  async dcSendForAll({type, value}) {
    oForEachV(this.peerMap, ({peer, status}) => {
      if (status === 'connected') {
        peer.sendMessage(`${type}_${JSON.stringify(value)}`)
        // console.log(peer, value)
      }
    })
  }

  getImOfferer(userId) {
    return userId && userId > this.myUserId
  }

  deletePeer(id) {
    if(this.peerMap[id] && this.peerMap[id].status !== 'closed') {
      console.log('deletePeer', id)
      this.peerMap[id].status = 'closed'
      this.peerMap[id].peer = null
      delete this.peerMap[id]
      console.log(this.peerMap)
    }

  }

  createPeer(id) {
    console.log('createPeer!!!!!!!!!!')
    peerCount++
    console.log({peerCount})
    const peer = new Peer()
    override(peer, 'onDataChannelOpen', (prevF, ...args) => {
      prevF(...args)
      this.peerMap[id].status = 'connected'
    })
    override(peer, 'onDataChannelClose', (prevF, ...args) => {
      prevF(...args)
      this.deletePeer(id)
    })
    override(peer, 'onDataChannelError', (prevF, ...args) => {
      prevF(...args)
      this.deletePeer(id)
    })
    override(peer, 'onDataChannelMessage', (prevF, ...args) => {
      prevF(args)
      const [type, value] = args?.[0]?.data?.slice(1, -1).split('_') ?? [null, null]
      this.dispatch({type, from: id, value: JSON.parse(value)})
    })
    override(peer.pc, 'onconnectionstatechange', (prevF, ...args) => {
      console.log(args[0].target.connectionState)
      if (['closed', 'failed', 'disconnected'].includes(args[0].target.connectionState)) {
        this.deletePeer(id)
      }
      prevF(args)
    })
    return peer
  }

  signalingLoop() {
    this.signaling()
    console.log(this.peerMap)
    console.log(this.signalingInterval)
    this.signalingLoopId = setTimeout(() => this.signalingLoop(), this.signalingInterval)
  }

  stopSignalingLoop() {
    clearTimeout(this.signalingLoopId)
  }

  resetInterval() {
    this.signalingInterval = DEFAULT_INTERVAL
  }

  async signaling() {
    if(!this.myUserId) return null
    const users = this.getUsers()

    let activeLoop = false
    oForEachV(this.peerMap, ({status, key}) => {
      if (['offer_sent', 'offer_waiting'].includes(status) && isExpiration(key, 15)) {
        activeLoop = true
      }
    })
    if (activeLoop) {
      if(this.signalingInterval === DEFAULT_INTERVAL) {
        this.signalingInterval = 1000
      }
    }else if (this.signalingInterval !== DEFAULT_INTERVAL) {
      this.resetInterval()
    }


    const [answererUsers, offererUsers] = partition(users, u => this.getImOfferer(u.id))
    answererUsers.forEach(async u => {
      if (!this.peerMap[u.id] ||
          (!this.peerMap?.[u.id].status === 'connected' && isExpiration(this.peerMap?.[u.id].key, 30))) {
        this.peerMap[u.id] = { //古くて未接続なら上書き？
          key   : u.update,
          status: 'offer_creating',
          peer  : this.createPeer(u.id)
        }
      }
    })

    offererUsers.forEach(async u => {
      if (!this.peerMap[u.id] ||
          (!this.peerMap?.[u.id].status === 'connected' && isExpiration(this.peerMap?.[u.id].key, 30))) {
        this.peerMap[u.id] = { //古くて未接続なら上書き？
          status: 'offer_waiting'
        }
      }
    })

    this.getOffers().then((offers) => {
      offers.forEach((offer) => {
        if (!this.peerMap[offer.id] ||
            (!this.peerMap?.[offer.id].status === 'connected' && isExpiration(this.peerMap?.[offer.id].update, 30))) {
          this.peerMap[offer.pub] = {
            key     : offer.key,
            status  : 'offer_received',
            peer    : this.createPeer(offer.pub),
            offerSDP: offer.sdp
          }
        }
      })
    })

    this.getAnswers().then((answers) => {
      answers.forEach((answer) => {
        const offererPeer = this.peerMap?.[answer.pub]
        if(offererPeer && offererPeer.status === 'offer_sent' && offererPeer.key === answer.key) {
          offererPeer.status = 'answer_received'
          offererPeer.peer.setAnswerSdp(answer.sdp).then(() => offererPeer.status = 'connencted')
        }
      })
    })

    oForEach(this.peerMap, ([id, v]) => {
      if (v.status === 'offer_creating') {
        v.status = 'offer_sending'
        v.peer.createOfferSdp()
          .then(() => this.sendOffer({id, key: v.key, sdp: v.peer.localSDP}))
          .then(console.log)
          .then(() => v.status = 'offer_sent')
          .catch((error) => {
            console.error(error)
            v.status = 'offer_send_failed'
            this.resetInterval(v.status)
          })
      }
      if (v.status === 'offer_received') {
        v.status = 'answer_sending'
        v.peer.setOfferSdp(v.offerSDP)
          .then(() => this.sendAnswer({id, key: v.key, sdp: v.peer.localSDP}))
          .then(console.log)
          .then(() => v.status = 'answer_sent')
          .catch((error) => {
            console.error(error)
            v.status = 'answer_send_failed'
            this.resetInterval(v.status)
          })
      }
    })

  }


}
