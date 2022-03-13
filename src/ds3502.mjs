import { Common } from './common.mjs'

export const MODE_UPDATE_ONLY = 0
export const MODE_SET_AND_UPDATE = 1

export class DS3502 {
	static from(abus) { return Promise.resolve(new DS3502(abus)) }

	constructor(abus) {
		this.abus = abus
	}

	async profile() {
		return Common.profile(this.abus)
	}

	async setProfile(profile) {
		return Common.setProfile(this.abus)
	}
}
