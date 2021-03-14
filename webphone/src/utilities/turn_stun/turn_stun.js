/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

const iceCandidatePoolSize = 0
const iceTransportPolicy = 'all'
const iceServers = [
  { urls: ['stun:coturn.ibridgepeople.fr:80?transport=udp'], username: '', credential: '' },
  { urls: ['turn:coturn.ibridgepeople.fr:80?transport=tcp'], username: 'webphone', credential: 'webphone_1234' }
]

class TurnStun {
  constructor() {
    this.result = []
    this.started = false
    this.begin = null
    this.pc = null
    this.candidates = null
    this.callback = null
  }

  start(callback = null) {
    if (this.started || !CONFIG.sendLogs) return
    this.callback = callback

    // check if we have getUserMedia permissions.
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        devices.forEach((device) => {
          if (device.label !== '') return false
        })
      })

    this.result = []
    this.started = true

    // Create a PeerConnection with no streams, but force a m=audio line.
    const config = {
      iceServers,
      iceTransportPolicy,
      iceCandidatePoolSize
    }

    const offerOptions = { offerToReceiveAudio: 1 }
    // Whether we gather IPv6 candidates.
    // Whether we only gather a single set of candidates for RTP and RTCP.
    const self = this

    this.pc = new RTCPeerConnection(config)
    this.pc.onicecandidate = self.iceCallback.bind(self)
    this.pc.onicegatheringstatechange = self.gatheringStateChange.bind(self)
    this.pc.createOffer(
      offerOptions
    ).then(
      self.gotDescription.bind(self),
      self.noDescription.bind(self)
    )
  }


  gotDescription(desc) {
    this.begin = window.performance.now()
    this.candidates = []
    this.pc.setLocalDescription(desc)
  }

  noDescription(error) {
    console.log('Error creating offer: ', error)
  }

  // Parse a candidate:foo string into an object, for easier use by other methods.
  parseCandidate(text) {
    const candidateStr = 'candidate:'
    const pos = text.indexOf(candidateStr) + candidateStr.length
    const [foundation, component, protocol, priority, address, port, , type] = text.substr(pos).split(' ')
    return {
      component,
      type,
      foundation,
      protocol,
      address,
      port,
      priority
    }
  }

  // Parse the uint32 PRIORITY field into its constituent parts from RFC 5245,
  // type preference, local preference, and (256 - component ID).
  // ex: 126 | 32252 | 255 (126 is host preference, 255 is component ID 1)
  formatPriority(priority) {
    return [
      priority >> 24,
      (priority >> 8) & 0xFFFF,
      priority & 0xFF
    ].join(' | ')
  }

  // Try to determine authentication failures and unreachable TURN
  // servers by using heuristics on the candidate types gathered.
  getFinalResult() {
    return 'Done'
  }

  iceCallback(event) {
    const elapsed = ((window.performance.now() - this.begin) / 1000).toFixed(3)
    const obj = { time: elapsed }

    if (event.candidate) {
      const c = this.parseCandidate(event.candidate.candidate)
      obj.component = c.component
      obj.type = c.type
      obj.foundation = c.foundation
      obj.protocol = c.protocol
      obj.address = c.address
      obj.port = c.port
      obj.priority = this.formatPriority(c.priority)

      this.candidates.push(c)
    } else if (!('onicegatheringstatechange' in RTCPeerConnection.prototype)) {
      // should not be done if its done in the icegatheringstatechange callback.
      obj.message = this.getFinalResult()
      this.pc.close()
      this.pc = null
      this.started = false
    }
    this.result.push(obj)
    if (this.callback) {
      this.callback(this.result)
    }
  }

  gatheringStateChange() {
    if (this.pc.iceGatheringState !== 'complete') return

    const elapsed = ((window.performance.now() - this.begin) / 1000).toFixed(3)
    const obj = { time: elapsed }
    obj.message = this.getFinalResult()
    this.pc.close()
    this.pc = null
    this.started = false
    this.result.push(obj)
    if (this.callback) {
      this.callback(this.result)
    }
  }
}


export default new TurnStun()
