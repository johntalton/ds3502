import i2c from 'i2c-bus'
import aod from '@johntalton/and-other-delights'
const { I2CAddressedBus } = aod
import { DS3502 } from '@johntalton/ds3502'

const busAddress = 0x28

const args = process.argv.slice(2)
const WR = args[0]
const CR = args[1]
const unused = args[2]

const profile = { WR, CR, unused }

i2c.openPromisified(1)
  .then(i2c1 => DS3502.from(new I2CAddressedBus(i2c1, busAddress)))
  .then(ds => ds.setProfile(profile))
  .catch(e => console.log('top-level-error', e))
