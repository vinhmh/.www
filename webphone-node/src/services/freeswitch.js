import Esl from '../esl'
import Adjustments from '../libs/adjustments'
import User from '../models/user'
import Member from '../models/member'
import UserService from './users'
import { Sender } from '../socket'
import * as Notify from './notify'

const PickState = {
  NONE: 'NONE',
  RELAY: 'RELAY',
  FLOOR: 'FLOOR',
  ORATOR: 'ORATOR',
  LANGB: 'LANGB',
}

export default class Freeswitch {
  static toggleSpeakSelf({ userId }) {
    const user = User.find(userId)
    if (user.isModerator()) return Freeswitch.toggleSpeakModerator(user)
    return Freeswitch.toggleSpeakRegular(user)
  }

  static toggleHearSelf({ userId }) {
    const user = User.find(userId)
    if (user.isModerator()) return Freeswitch.toggleHearModerator(user)
    return Freeswitch.toggleHearRegular(user)
  }

  static async toggleSpeakRegular(user) {
    const member = user.memberByRoomId(user.speakRoomId)
    if (!member.speak && Adjustments.demoMode) return

    if (user.isFloorEnabled() && user.speakRoomId !== user.rooms.babel) {
      // Toggle speaking to the room and floor
      const floorMember = user.memberByRoomId(user.rooms.floor)
      if (member.speak) {
        await Esl.muteSpeak(member.id, member.roomId)
        if (floorMember) await Esl.muteSpeak(floorMember.id, floorMember.roomId)
      } else {
        await Esl.unmuteSpeak(member.id, member.roomId)
        if (floorMember) await Esl.unmuteSpeak(floorMember.id, floorMember.roomId)
      }
    } else {
      // Toggle speaking to the room
      await Esl.toggleSpeak(member.id, member.roomId)
    }
  }

  static async toggleHearRegular(user) {
    if (user.isFloorEnabled() && user.hearRoomId !== user.rooms.babel) {
      // Toggle on the floor
      const floorMember = user.memberByRoomId(user.rooms.floor)
      if (floorMember) await Esl.toggleHear(floorMember.id, floorMember.roomId, floorMember.hear)
    } else {
      // Toggle on the room
      const member = user.memberByRoomId(user.hearRoomId)
      await Esl.toggleHear(member.id, member.roomId, member.hear)
    }
  }

  static async muteSpeakRegular(user) {
    const member = user.memberByRoomId(user.speakRoomId)
    await Esl.muteSpeak(member.id, member.roomId)

    if (user.isFloorEnabled()) {
      // Also toggle speaking to the floor
      const floorMember = user.memberByRoomId(user.rooms.floor)
      if (floorMember) {
        await Esl.muteSpeak(floorMember.id, floorMember.roomId)
      }
    }
  }

  static async toggleSpeakModerator(user) {
    if (user.inLoungeRoom()) return Freeswitch.toggleLoungeSpeak(user)

    const speakRoom = user.speakRoomId
    const hearRoom = user.hearRoomId
    const speakMember = user.memberByRoomId(speakRoom)
    const hearMember = user.memberByRoomId(hearRoom)
    const unmuting = !speakMember.speak

    if (unmuting && !hearMember.hear && !user.isFloorHear()) {
      await Esl.unmuteHear(hearMember.id, hearMember.roomId)
    }
    await Esl.toggleSpeak(speakMember.id, speakMember.roomId)

    if (!unmuting) {
      Freeswitch.handleSwitcher(hearMember.roomId)
      Freeswitch.handleSwitcher(speakMember.roomId)
      return
    }

    if (user.wasHearBoth && !user.isFloorHear()) {
      await Esl.unmuteHear(speakMember.id, speakMember.roomId)
    }

    // mute all other moderators with the same rooms
    await Freeswitch.muteModeratorsBoothTeam(user)

    Freeswitch.handleSwitcher(hearMember.roomId)
    Freeswitch.handleSwitcher(speakMember.roomId)
  }

  static async toggleHearModerator(user) {
    const loungeMember = user.memberByRoomId(user.rooms.lounge)
    if (loungeMember) {
      return Esl.toggleHear(loungeMember.id, loungeMember.roomId, loungeMember.hear)
    }

    const floorMember = user.memberByRoomId(user.rooms.floor)
    if (floorMember && floorMember.hear) {
      Esl.muteHear(floorMember.id, floorMember.roomId)
    }

    const { hearRoomId, speakRoomId } = user
    const speakMember = user.memberByRoomId(speakRoomId)
    const hearMember = user.memberByRoomId(hearRoomId)

    if (hearMember.hear && speakMember.hear) {
      Esl.muteHear(speakMember.id, speakMember.roomId)
      return
    }

    if (hearMember.hear && speakMember.speak) {
      await Esl.muteSpeak(speakMember.id, speakMember.roomId)
    }

    if (hearMember.hear || speakMember.hear) {
      user.wasHearBoth = user.hearBoth()
      await Esl.muteHear(hearMember.id, hearMember.roomId)
      await Esl.muteHear(speakMember.id, speakMember.roomId)
    } else if (!hearMember.hear && !speakMember.hear) {
      await Esl.unmuteHear(hearMember.id, hearMember.roomId)
      if (user.wasHearBoth) {
        await Esl.unmuteHear(speakMember.id, speakMember.roomId)
      }
    }
    Freeswitch.handleSwitcher(hearMember.roomId)
    Freeswitch.handleSwitcher(speakMember.roomId)
  }

  static toggleLoungeSpeak(user) {
    const member = user.memberByRoomId(user.rooms.lounge)
    Esl.toggleSpeak(member.id, member.roomId)
    console.log('user', user)
  }

  static muteModeratorsBoothTeam(user) {
    const promises = []
    user.boothTeam().forEach(u => {
      const speakMember = u.memberByRoomId(u.speakRoomId)
      if (!speakMember || !speakMember.speak) return
      promises.push(Esl.muteSpeak(speakMember.id, speakMember.roomId))
    })
    return Promise.all(promises)
  }

  static async toggleSpeakMember({ userId, memberId, roomId }) {
    const user = User.find(userId)
    const member = Member.find(memberId)
    if (!member) return
    const participant = member.user

    if (user.isSwitcher() || participant.isSwitcher()) return

    if (user.isRegular()) {
      if (participant.isModerator() || participant.rooms.first !== roomId || Adjustments.demoMode) return
    }

    if (participant.isModerator() && !participant.inLoungeRoom()) {
      await Freeswitch.muteModeratorsBoothTeam(member.user)
    }

    if (participant.isFloorEnabled() && participant.isRegular() && roomId !== participant.rooms.babel) {
      // Toggle speaking to the room and the floor
      const floorMember = participant.memberByRoomId(user.rooms.floor)
      if (member.speak) {
        await Esl.muteSpeak(member.id, roomId)
        if (floorMember) await Esl.muteSpeak(floorMember.id, floorMember.roomId)
      } else {
        await Esl.unmuteSpeak(member.id, roomId)
        if (floorMember) await Esl.unmuteSpeak(floorMember.id, floorMember.roomId)
      }
    } else {
        if (user.rooms.langb) {
          await Esl.toggleHear(member.id, roomId, member.speak)
        }
        // Toggle speaking to the room
        await Esl.toggleSpeak(member.id, roomId)
    }

    Freeswitch.handleSwitcher(roomId)
    Notify.toggleSpeak(member, user)
  }

  static toggleHearMember({ memberId, roomId }) { // for debug mode
    const member = Member.find(memberId)
    if (!member) return

    if (member.isFloor()) Freeswitch.beforeFloorToggle(member)

    Esl.toggleHear(memberId, roomId, member.hear)
  }

  static handleFloorForMeeting(meetingId) {
    const rooms = new Set()
    User.byMeeting(meetingId).forEach(u => u.roomsList.forEach(r => rooms.add(r)))
    rooms.forEach(r => Freeswitch.handleFloor(r))
  }

  static handleFloor(roomId) {
    const members = Member.byRoom(roomId)
    const moderatorSpeaking = members.filter(m => m.user.isModerator() && m.speak).length

    // Regular users using the floor hear the floor if no moderator is speaking
    const regularUsers = members.map(m => m.user).filter(u => u.isRegular() && u.useFloor && roomId !== u.rooms.floor)
    for (const user of regularUsers) {
      const member = user.memberByRoomId(roomId)
      const floorMember = user.memberByRoomId(user.rooms.floor)
      if (member && floorMember) {
        if (user.isFloorEnabled()) {
          // Floor is enabled
          if (member.hear || floorMember.hear) {
            // The user must listen to only one room, find which one...
            if (moderatorSpeaking || member.roomId === user.rooms.babel) {
              // Listen only to the room
              if(floorMember.hear) Esl.muteHear(floorMember.id, floorMember.roomId)
              if(!member.hear) Esl.unmuteHear(member.id, member.roomId)
            } else {
              // Listen only to the floor
              if(member.hear) Esl.muteHear(member.id, member.roomId)
              if(!floorMember.hear) Esl.unmuteHear(floorMember.id, floorMember.roomId)
            }
          }
          // If speaking to the room, speak also to the floor
          if (member.speak && !floorMember.speak) Esl.unmuteSpeak(floorMember.id, floorMember.roomId)

        } else {
          // Floor is disabled
          if (member.hear || floorMember.hear) {
            // Listen only to the room
            if(floorMember.hear) Esl.muteHear(floorMember.id, floorMember.roomId)
            if(!member.hear) Esl.unmuteHear(member.id, member.roomId)
          }
          // Mute speaking to the floor
          if (floorMember.speak) Esl.muteSpeak(floorMember.id, floorMember.roomId)
        }
      }
    }
  }

  static handleSwitcher(roomId) {
    // The floor implements a similar but distributed mechanism
    Freeswitch.handleFloor(roomId)

    const switcher = User.all.find(u => u.isSwitcher() && u.roomsList.includes(roomId))
    if (!switcher) return

    const swMember = switcher.memberByRoomId(roomId)
    if (!swMember) return

    const moderatorSpeaking = Member.byRoom(roomId).filter(m => m.user.isModerator() && m.speak).length
    if (moderatorSpeaking) {
      Esl.muteSpeak(swMember.id, roomId)
    } else {
      Esl.unmuteSpeak(swMember.id, roomId)
    }
  }

  static beforeFloorToggle(floorMember) {
    const { user } = floorMember
    const { hearRoomId, speakRoomId } = user
    const hearMember = user.memberByRoomId(hearRoomId)
    const speakMember = user.memberByRoomId(speakRoomId)

    // disable floor
    if (floorMember.hear) {
      if (speakMember.speak) Esl.muteSpeak(speakMember.id, speakRoomId)
      if (hearMember.hear) Esl.muteHear(hearMember.id, hearRoomId)
      return
    }

    // enable floor
    if (hearMember.hear) Esl.muteHear(hearMember.id, hearRoomId)
    if (speakMember.hear) Esl.muteHear(speakMember.id, speakRoomId)
  }

  static async changeRegularRoom({ userId, newRoomId }) {
    const user = User.find(userId)
    const member = user.memberByRoomId(user.rooms.first)
    user.speakRoomId = newRoomId
    user.hearRoomId = newRoomId
    user.rooms.first = newRoomId
    if (member) {
      user.skipReconnect = true
      await Esl.hupMember(member.id, member.roomId)
    }
    Sender.firstLineCall(user.channels.self, newRoomId)
    Sender.updateProfile(user.channels.self, user)
  }

  static async switchRooms({ userId }) {
    const user = User.find(userId)
    const { hearRoomId, speakRoomId } = user

    user.speakRoomId = hearRoomId
    user.hearRoomId = speakRoomId

    const newHearMember = user.memberByRoomId(user.hearRoomId)
    const newSpeakMember = user.memberByRoomId(user.speakRoomId)

    // If moderator was speaking before, switch deaf/undeaf
    if (newHearMember.speak) {
        await Esl.muteSpeak(newHearMember.id, newHearMember.roomId)
        await Esl.unmuteSpeak(newSpeakMember.id, newSpeakMember.roomId)
        Freeswitch.handleSwitcher(newSpeakMember.roomId)
        Freeswitch.handleSwitcher(newHearMember.roomId)
    }

    if (user.rooms.langb) {
      await Esl.unmuteHear(newSpeakMember.id, newSpeakMember.roomId)
      await Esl.muteHear(newHearMember.id, newHearMember.roomId)
    }

    UserService.update(user)
  }

  static async joinLounge({ userId }) {
    const user = User.find(userId)
    const { rooms } = user
    await Freeswitch.pickState(user, PickState.NONE)
    if (rooms.lounge) Sender.loungeLineCall(user.channels.self, rooms.lounge)
    user.speakRoomId = user.rooms.lounge
    user.hearRoomId = user.rooms.lounge
    UserService.update(user)
  }

  static async leaveLounge({ userId }) {
    const user = User.find(userId)
    const { rooms } = user
    const loungeMember = rooms.lounge ? user.memberByRoomId(rooms.lounge) : undefined
    if (loungeMember) await Esl.hupMember(loungeMember.id, loungeMember.roomId)
    user.speakRoomId = user.rooms.second
    user.hearRoomId = user.rooms.first
    await Freeswitch.pickState(user, PickState.RELAY)
  }

  static async pickState(user, state, roomId) {
    const { hearRoomId, speakRoomId, rooms, userState } = user
    const mediaSettings = userState.mediaSettings
    const speakMember = user.memberByRoomId(speakRoomId)
    const hearMember = user.memberByRoomId(hearRoomId)
    const floorMember = rooms.floor ? user.memberByRoomId(rooms.floor) : undefined

    if (state === PickState.FLOOR) {
      if (floorMember) await Esl.unmuteHear(floorMember.id, floorMember.roomId)
      if (mediaSettings.outputVolumeLine1 > 0) await Esl.unmuteHear(hearMember.id, hearRoomId)
      if (mediaSettings.outputVolumeLine2 > 0) await Esl.unmuteHear(speakMember.id, speakRoomId)
    } else {
      if (floorMember) await Esl.muteHear(floorMember.id, floorMember.roomId)
    }

    if (state === PickState.RELAY) {
      await Esl.unmuteHear(hearMember.id, hearRoomId)
      await Esl.unmuteHear(speakMember.id, speakRoomId)
    } else {
      await Esl.muteHear(hearMember.id, hearRoomId)
      await Esl.muteHear(speakMember.id, speakRoomId)
    }

    if (state === PickState.ORATOR) {
        if (roomId && roomId !== rooms.orator) {
            await Freeswitch.dropOrator(user)
            if (roomId !== user.hearRoomId && roomId !== user.speakRoomId) {
                rooms.orator = roomId
                Sender.oratorLineCall(user.channels.self, roomId)
            }
        }
    } else {
        await Freeswitch.dropOrator(user)
    }

    if (state === PickState.LANGB) {
        if (roomId && roomId !== rooms.langb) {
            await Freeswitch.dropLangb(user)
            if (roomId !== user.hearRoomId && roomId !== user.speakRoomId) {
                rooms.langb = roomId
                Sender.langbLineCall(user.channels.self, roomId)
                if (speakMember.speak) {
                  Esl.unmuteHear(speakMember.id, user.speakRoomId)
                } else if (hearMember.speak) {
                  Esl.unmuteHear(hearMember.id, user.hearMemberId)
                }
            }
        }
    } else {
        await Freeswitch.dropLangb(user)
    }

    UserService.update(user)
  }

  static async dropOrator(user) {
    const { rooms } = user
    const oratorMember = rooms.orator ? user.memberByRoomId(rooms.orator) : undefined
    if (oratorMember) await Esl.hupMember(oratorMember.id, oratorMember.roomId)
    rooms.orator = null
  }

  static async dropLangb(user) {
    const { rooms } = user
    const langbMember = rooms.langb ? user.memberByRoomId(rooms.langb) : undefined
    if (langbMember) await Esl.hupMember(langbMember.id, langbMember.roomId)
    rooms.langb = null
  }

  static async pickRelay({ userId }) {
    const user = User.find(userId)
    await Freeswitch.pickState(user, PickState.RELAY)
  }

  static async pickFloor({ userId }) {
    const user = User.find(userId)
    await Freeswitch.pickState(user, PickState.FLOOR)
  }

  static async pickOrator({ userId, roomId }) {
    const user = User.find(userId)
    if (roomId) await Freeswitch.pickState(user, PickState.ORATOR, roomId)
    else await Freeswitch.pickState(user, PickState.RELAY)
  }

  static async pickLangb({ userId, roomId }) {
    const user = User.find(userId)
    if (roomId) await Freeswitch.pickState(user, PickState.LANGB, roomId)
    else await Freeswitch.pickState(user, PickState.RELAY)
  }

  static setVolumeIn({ userId, level }) {
    const user = User.find(userId)
    const { echoUuid } = user
    user.members.forEach(m => Esl.volumeIn(m.id, m.roomId, level))
    if (echoUuid) {
      Esl.uuid_audio(echoUuid, `start write level ${level}`)
    }
  }
}
