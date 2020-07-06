
export const MODE_UPDATE_ONLY = 0
export const MODE_SET_AND_UPDATE = 1

export class DS3502 {
  static from(abus) { return Promise.resolve(new DS3502(abus)) }

  constructor(abus) {
    this.abus = abus
  }

  async profile() {
    const result = await this.abus.read(0x00, 3)
    const WR = result.readUInt8(0)
    const IVR = result.readUInt8(1)
    const CR = result.readUInt8(2)

    return {
      WR, IVR, CR
    }
  }

  setProfile(profile) {
    console.log('setProfile', profile)
    const hasWR = profile.WR !== undefined
    const hasIVR = profile.IVR !== undefined
    const hasCR = profile.CR !== undefined

    // Zero
    if(!hasWR && !hasIVR && !hasCR) {}
    
    // Three
    const three = hasWR && hasIVR && hasCR

    // One
    const one = (!hasWR && !hasIVR &&  hasCR) || 
                (!hasWR &&  hasIVR && !hasCR) ||
                ( hasWR && !hasIVR && !hasCR)
    // Two
    const two = !one 

    if(one) {
      //
      if(hasWR) { return this.abus.write(0x00, Buffer.from([profile.WR])) }
    }
    else if(two) {
      //
    }
    else if(three) {
      //
    }
  }


}
