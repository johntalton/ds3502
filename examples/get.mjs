import aod from '@johntalton/and-other-delights'
const { I2CAddressedBus, I2CMockBus } = aod
import { DS3502 } from '@johntalton/ds3502'

import { DS3502MockDefinition } from './mockDefinition.mjs'
const busAddress = 0x28

async function main() {
  try {
    const mock = true
    let i2c
    if(mock) {
      //console.log(DS3502MockDefinition)
      I2CMockBus.addDevice(1, busAddress, DS3502MockDefinition)
    }
    else
    {
      i2c = await import('i2c-bus')
    }

    const provider = mock ? I2CMockBus : i2c
    const bus1 = await provider.openPromisified(1)
    const ds = await DS3502.from(new I2CAddressedBus(bus1, busAddress))

    const profile = await ds.profile()

    console.log(profile)
  }
  catch(e) {
    console.log('main error', e.toString())
  }
}

main()
