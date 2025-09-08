# DS3502
Digital Potentiometer (POT)

[![npm Version](http://img.shields.io/npm/v/@johntalton/ds3502.svg)](https://www.npmjs.com/package/@johntalton/ds3502)
![GitHub package.json version](https://img.shields.io/github/package-json/v/johntalton/ds3502)
[![CI](https://github.com/johntalton/ds3502/actions/workflows/CI.yml/badge.svg)](https://github.com/johntalton/ds3502/actions/workflows/CI.yml)

## :gear: Operation
The Digital Potentiometer uses a resistor array to achieve a 0-127 step range between its high (RH) and low value (RL).  In most cases these are wired to the same logic high and low.  Thus, providing a POT output (on RW) for analog usage in the RH-RL range.

In addition to the controllable wiper value (via WR) the device provides the ability to set the initialization value on startup.  This is provided via a `mode` change such that writes to the wiper value are preserved in a persistent storage on the chip (withing IVR on the EEPROM).

This set-and-update `mode` while useful for setting persistent values over power loss also comes with increased delay in update.

:warning: `mode changes to the control register (CR) do not take effect until the next write phase`

:warning: `it is not recommended to update both CR and WR in a single update, although it is supported`

## :book: Example

```javascript
import { I2CAddressedBus } from '@johntalton/and-other-delights'
import { DS3502 } from '@johntalton/ds3502'

const bus = /* I2CBus */
const device = new  DS3502.from(new I2CAddressedBus(bus, 0x28))

const { persist } = await device.getControl()

await device.setWiper(42)

```



