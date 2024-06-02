export const REGISTER = {
	WIPER: 0x00,
	UNUSED: 0x01,
	CONTROL: 0x02
}

export const MODE_UPDATE_ONLY = 0
export const MODE_SET_AND_UPDATE = 1

export const BYTE_LENGTH_ONE = 1
export const SINGLE_BIT_MASK = 0b1

export class DS3502 {
	#aBus
	static from(aBus) { return new DS3502(aBus) }
	constructor(aBus) { this.#aBus = aBus }

	async getControl() {
		const buffer = await this.#aBus.readI2cBlock(REGISTER.CONTROL, BYTE_LENGTH_ONE)
		const u8 = ArrayBuffer.isView(buffer) ?
			new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength) :
			new Uint8Array(buffer)

		const [ control ] = u8
		const persist = ((control >> 7) & SINGLE_BIT_MASK) === MODE_SET_AND_UPDATE

		return {
			persist
		}
	}

	async getWiper() {
		const buffer = await this.#aBus.readI2cBlock(REGISTER.WIPER, BYTE_LENGTH_ONE)
		const u8 = ArrayBuffer.isView(buffer) ?
			new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength) :
			new Uint8Array(buffer)

		const [ wiper ] = u8
		return wiper
	}

	async setControl({ persist = false }) {
		const control = (persist ? MODE_SET_AND_UPDATE : MODE_UPDATE_ONLY) << 7
		return this.#aBus.writeI2cBlock(REGISTER.CONTROL, Uint8ClampedArray.from([ control ]))
	}

	async setWiper(value) {
		return this.#aBus.writeI2cBlock(REGISTER.WIPER, Uint8ClampedArray.from([ value ]))
	}
}
