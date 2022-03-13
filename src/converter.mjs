const MAXIUM_WIPER_REGISTER_VALUE = 127

export class Converter {

	//
	// Utility converstion useful to the end user?
	//

	static calculateVoltage(wr, vrh, vrl) {
		const MAX_AS_FLOAT = float(MAXIUM_WIPER_REGISTER_VALUE) // so div return float
		return vrl + (wr / MAX_AS_FLOAT) * (vrh - vrl)
	}

	static calculateWiper(desiredV, vrh, vrl) {
		return ((desiredV - vrl) / (vrh - vrl)) * MAXIUM_WIPER_REGISTER_VALUE
	}
}