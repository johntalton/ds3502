//import { describe } from 'mocha';
import mocha from 'mocha'
const { describe } = mocha
//import { expect } from 'chai';
import chai from 'chai'
const { expect } = chai


import { I2CAddressedBus, I2CScriptBus, EOS_SCRIPT } from '@johntalton/and-other-delights'
import { DS3502 } from '@johntalton/ds3502'

const DEFAULT_SCRIPT = {
  ...EOS_SCRIPT
}

const PROFILE_SCRIPT = [
  { method: 'readI2cBlock', result: { bytesRead: 3, buffer: Buffer.from([0x03, 0x00, 0x05]) } },
  ...EOS_SCRIPT
]

const UPDATE_PROFILE_CR_SCRIPT = [
  { method: 'writeI2cBlock', result: { bytesWritten: 1, buffer: Buffer.from([]) } },
  ...EOS_SCRIPT
]

const UPDATE_PROFILE_WR_SCRIPT = [
  { method: 'writeI2cBlock', result: { bytesWritten: 1, buffer: Buffer.from([]) } },
  ...EOS_SCRIPT
]

const UPDATE_PROFILE_FULL_SCRIPT = [
  { method: 'writeI2cBlock', result: { bytesWritten: 3, buffer: Buffer.from([]) } },
  ...EOS_SCRIPT
]


describe('DS3502', () => {
  describe('#from', () => {
    it('should construct device', async () => {
      //
      const bus = await I2CScriptBus.openPromisified(1, DEFAULT_SCRIPT)
      const ds = await DS3502.from(new I2CAddressedBus(bus, 0x28))
    })
  })

  describe('#profile', () => {
    it('should ', async () => {
      //
      const bus = await I2CScriptBus.openPromisified(1, PROFILE_SCRIPT)
      const ds = await DS3502.from(new I2CAddressedBus(bus, 0x28))
      const p = await ds.profile();
      expect(p.WR).to.equal(3)
      expect(p.CR).to.equal(5)

    })
  })

  describe('#setProfile', () => {
    it('should set profile single CR', async () => {
      //
      const bus = await I2CScriptBus.openPromisified(1, UPDATE_PROFILE_CR_SCRIPT)
      const ds = await DS3502.from(new I2CAddressedBus(bus, 0x28))
      await ds.setProfile({ CR: 128 });

    })

    it('should set profile single WR', async () => {
      //
      const bus = await I2CScriptBus.openPromisified(1, UPDATE_PROFILE_WR_SCRIPT)
      const ds = await DS3502.from(new I2CAddressedBus(bus, 0x28))
      await ds.setProfile({ WR: 42 });
    })

    it('should set profile fully', async () => {
      //
      const bus = await I2CScriptBus.openPromisified(1, UPDATE_PROFILE_FULL_SCRIPT)
      const ds = await DS3502.from(new I2CAddressedBus(bus, 0x28))
      await ds.setProfile({ WR: 42, CR: 0 });
    })
  })


})
