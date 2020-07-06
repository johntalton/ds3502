import i2c from 'i2c-bus'
import aod from '@johntalton/and-other-delights'
const { I2CAddressedBus } = aod
import { DS3502 } from '@johntalton/ds3502'

const busAddress = 0x28

async function main() {
  const bus1 = await i2c.openPromisified(1)
  const ds = await DS3502.from(new I2CAddressedBus(bus1, busAddress))
  
  const profile = await ds.profile()

  console.log(profile)
}

main()
