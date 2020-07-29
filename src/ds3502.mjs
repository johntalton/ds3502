
export const MODE_UPDATE_ONLY = 0
export const MODE_SET_AND_UPDATE = 1

/**
 *
 **/
export class DS3502 {
  static from(abus) { return Promise.resolve(new DS3502(abus)) }

  constructor(abus) {
    this.abus = abus
  }

  /**
   * 
   **/
  async profile() {
    const result = await this.abus.read(0x00, 3)
    //console.log(result)
    const WR = result.readUInt8(0)
    const unused = result.readUInt8(1)
    const CR = result.readUInt8(2)

    return {
      WR, unused,  CR
    }
  }

  /**
   *
   **/
  async setProfile(profile) {
    //profile.unused = 10

    //console.log('setProfile', profile)
    const hasWR = profile.WR !== undefined
    const hasCR = profile.CR !== undefined

    const unused = profile.unused || 0xFE

    if(!hasWR && !hasCR) {
      // console.log('empty profile', profile)
      return
    }

    if(hasWR && !hasCR) {
      // pot update (but also may be ivr update depending on mode)
      // console.log('pot update')
      return this.abus.write(0x00, Buffer.from([profile.WR]))
    }

    if(!hasWR && hasCR) {
      // update just mode
      // console.log('mode update')
      return this.abus.write(0x02, Buffer.from([profile.CR]))
    }

    if(hasWR && hasCR) {
      // full update
      // console.log('full update')
      return this.abus.write(0x00, Buffer.from([profile.WR, unused, profile.CR]))
    }
  }
}
