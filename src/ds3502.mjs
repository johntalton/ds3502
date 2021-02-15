export const MODE_UPDATE_ONLY = 0
export const MODE_SET_AND_UPDATE = 1

export class DS3502 {
  static from(abus) { return Promise.resolve(new DS3502(abus)) }

  constructor(abus) {
    this.abus = abus
  }

  async profile() {
    const result = await this.abus.readI2cBlock(0x00, 3)
    const WR = result.readUInt8(0)
    const unused = result.readUInt8(1)
    const CR = result.readUInt8(2)

    return {
      WR, unused, CR
    }
  }

  async setProfile(profile) {
    const hasWR = profile.WR !== undefined
    const hasCR = profile.CR !== undefined

    const unused = profile.unused || 0xFE

    if(!hasWR && !hasCR) {
      return Promise.resolve()
    }

    if(hasWR && !hasCR) {
      // pot update (but also may be update depending on mode)
      return this.abus.writeI2cBlock(0x00, Buffer.from([profile.WR]))
    }

    if(!hasWR && hasCR) {
      // update just mode
      return this.abus.writeI2cBlock(0x02, Buffer.from([profile.CR]))
    }

    if(hasWR && hasCR) {
      // full update
      return this.abus.writeI2cBlock(0x00, Buffer.from([profile.WR, unused, profile.CR]))
    }

    throw new Error('unknown set profile state')
  }
}
