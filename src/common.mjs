const REGISTER = {
	WIPER: 0x00,
	UNUSED: 0x01,
	CONTROL: 0x02
}

const FULL_PROFILE_START = REGISTER.WIPER
const FULL_PROFILE_LENGTH = 3

export class Common {
	async static profile(abus) {
		// console.log('profile')
		const result = await abus.readI2cBlock(FULL_PROFILE_START, FULL_PROFILE_LENGTH)
		const [WR, unused, CR] = result
		return { WR, unused, CR }
	}

	async static setProfile(abus, profile) {
		const hasWR = profile.WR !== undefined
		const hasCR = profile.CR !== undefined

		// profile.unused = 10 // used to fingerprint?
		const unused = profile.unused || 0xFE

		if (!hasWR && !hasCR) {
			return Promise.resolve()
		}

		// pot update (may cuase ivr update depending on mode, expect delay)
		if (hasWR && !hasCR) {
			// console.log('pot update')
			return this.abus.writeI2cBlock(REGISTER.WIPER, Uint8Array.from([ profile.WR ]))
		}

		// update just mode
		if (!hasWR && hasCR) {
			// console.log('mode update')
			return this.abus.writeI2cBlock(REGISTER.CONTROL, Uint8Array.from([ profile.CR ]))
		}

		// full update
		if (hasWR && hasCR) {
			// console.log('full update')
			return this.abus.writeI2cBlock(FULL_PROFILE_START, Uint8Array.from([ profile.WR, unused, profile.CR ]))
		}

		throw new Error('unknown set profile state')
	}
}