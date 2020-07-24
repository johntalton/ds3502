# DS3502
Digital Potentiometer (POT)

[![npm Version](http://img.shields.io/npm/v/@johntalton/ds3502.svg)](https://www.npmjs.com/package/@johntalton/ds3502)
![GitHub package.json version](https://img.shields.io/github/package-json/v/johntalton/ds3502)
![CI](https://github.com/johntalton/ds3502/workflows/CI/badge.svg?branch=master&event=push)
![GitHub](https://img.shields.io/github/license/johntalton/ds3502)
[![Downloads Per Month](http://img.shields.io/npm/dm/@johntalton/ds3502.svg)](https://www.npmjs.com/package/@johntalton/ds3502)
![GitHub last commit](https://img.shields.io/github/last-commit/johntalton/ds3502)
[![Package Quality](https://npm.packagequality.com/shield/%40johntalton%2Fds3502.svg)](https://packagequality.com/#?package=@johntalton/ds3502)

* [Operation](#gear-operation)
* [Api](#book-api)
* [Tools](#wrench-tools) 

## :gear: Operation
The Digital Potentiometer uses a resistory array to achive a 0-127 step range between its high (RH) and low value (RL).  In most cases these are wired to the same logic high and low.  Thus, providing a POT output (on RW) for analog usage in the RH-RL range.

In addition to the controllable wiper value (via WR) the device provides the ability to set the initialization value on startup.  This is provided via a `mode` change such that writes to the wiper value are preserved in a persistant storage on the chip (withing IVR on the EEPROM).

This set-and-update `mode` while usefull for setting persistent values over power loss also comes with increassed delay in update.

:warning: `mode changes to the control register (CR) do not take effect until the next write phase`

:warning: `it is not recommended to update both CR and WR in a single update, although it is supported`

## :book: API

The primary interface is the exposed `DS3502` class.  Which expose a factory method `from` and primary class methods of `setProfile` and `profile`.

And example of typical usage:

```javascript
import i2c from 'i2c-bus'
import aod from '@johntalton/and-other-delights'
const { I2CAddressedBus } = aod
import { DS3502 } from '@johntalton/ds3502'

const busNumber = 1
const busAddress = 0x28

const i2c1 = await i2c.openPromisified(busNumber)
const ds = await DS3502.from(new I2CAddressedBus(i2c1, busAddress))

const profile = await ds.profile() // { WR: 127, CR: 0 }

```

#### profile
Returns asyncronously and object with properties for the wiper (WR) and control (CR).  The initialization value of the wiper (IVR) can not be inspected.  

#### setProfile
Sets asyncronously the devices profile via and object with properties for wiper (WR) and control (CR).  Both wiper `WR` and `CR` mode update can be specified in a single update.  However, the POTs value update to the wiper (WR) will respect the previous `mode` value.


## :wrench: Tools

#### `get`
Fetches and returns the current devices profile.

#### `set`
Sets one or more values of the devices.

And example of using the set command to blink and LED twice with a half second delay in update-only mode:
```shell
>node set.mjs mode 128 pot 0 delay 500 pot 127 pot 100 pot 127 pot 0
```




