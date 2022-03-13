import i2c from 'i2c-bus'
import aod from '@johntalton/and-other-delights'
const { I2CAddressedBus } = aod
import { DS3502 } from '@johntalton/ds3502'


const mock = false
const provider = mock ? undefined : i2c

const scans = [0, 1].map(async busNumber => {
  const busN = await provider.openPromisified(busNumber)
  return { busNumber, addresses: await busN.scan() }
})


const results = await Promise.all(scans)
results.map(async result => {
    return result.addresses.map(async busAddress => {
      const busN = await provider.openPromisified(result.busNumber)
      const ds = await DS3502.from(new I2CAddressedBus(busN, busAddress))
      console.log(result.busNumber, busAddress, await ds.profile())
    })
})

