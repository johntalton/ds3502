const REGISTER = {
  WIPER: 0x00,
  UNUSED: 0x01,
  CONTROL: 0x02
}

const FULL_PROFILE_START = REGISTER.PROFILE
const FULL_PROFILE_LENGTH = 3

export class Common {
  static profile(abus) {
    // console.log('profile')
    const result = await abus.read(FULL_PROFILE_START, FULL_PROFILE_LENGTH)
    const WR = result.readUInt8(0)
    const unused = result.readUInt8(1)
    const CR = result.readUInt8(2)

    return { WR, unused,  CR }
  }

  static setProfile(abus, profile) {
    // profile.unused = 10 // used to fingerprint?

    // console.log('setProfile', profile)
    const hasWR = profile.WR !== undefined
    const hasCR = profile.CR !== undefined

    const unused = profile.unused || 0xFE

    if(!hasWR && !hasCR) {
      // console.log('empty profile', profile)
      return
    }

    // pot update (may cuase ivr update depending on mode, expect delay)
    if(hasWR && !hasCR) {
      // console.log('pot update')
      return this.abus.writeI2cBlock(REGISTER.WIPER, Uint8Array.from([ profile.WR ]))
    }

    // update just mode
    if(!hasWR && hasCR) {
      // console.log('mode update')
      return this.abus.writeI2cBlock(REGISTER.CONTROL, Uint8Array.from([ profile.CR ]))
    }

    // full update
    if(hasWR && hasCR) {
      // console.log('full update')
      return this.abus.writeI2cBlock(FULL_PROFILE_START, Uint8Array.from([ profile.WR, unused, profile.CR ]))
    }
  }
}