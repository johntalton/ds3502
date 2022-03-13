async function tryImport(name) { try { return await import(name) } catch(e) { console.log('tryImport failed', e.toString())} }
const i2c = tryImport('i2c-bus')

import { I2CAddressedBus, I2CMockBus } from '@johntalton/and-other-delights'
import { DS3502 } from '@johntalton/ds3502'

const DEFAULT_ADDRESS = '1:40'
const config = { delayMs: 15 }

class Action {
  static delayMs(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }
  static async create(busNumber, busAddress) {
    console.log('initialize device', busNumber, busAddress)
    const busN = await i2c.openPromisified(busNumber)
    const ds = await DS3502.from(new I2CAddressedBus(busN, busAddress))
    return [busN, ds]
  }
  static async mock() {
    console.log('initialize mock-device')
    I2CMockBus.addDevice(-1, -1, {
      commandMask: 255,
      register: {
        0x00: { data: 0x40 },
        0x02: { data: 0x00 }
      }
    })
    const bus = await I2CMockBus.openPromisified(-1)
    const ds = await DS3502.from(new I2CAddressedBus(bus, -1))
    return [bus, ds]
  }
  static pot(ds, value) { return ds.setProfile({ WR: value }) }
  static mode(ds, value) { return ds.setProfile({ CR: value }) }
  static unused(ds, value) { return ds.setProfile({ unused: value })}
}

async function setupDS(state, address) {
  if(state.log) { console.log('Setup DS 0x' + address.toString(16)) }
  state.address = address
  state.bus = await i2c.openPromisified(1)
  state.ab = new I2CAddressedBus(state.bus, state.address)
  state.ds = await DS3502.from(state.ab)
}



function addressOrCommand(item, steps) {
  if(item !== 'address' ) {
    return command(item, [ ...steps, state => setupDS(state, DEFAULT_ADDRESS) ])
  }

  return command(item, steps)
}



function script(item, steps) {
  return { next: firstCommand, steps }
}

function node(item, steps) {
  return { next: script, steps }
}

function mode(item, steps) {
  return { next: command, steps: [ ...steps, () => Action.mode(config.ds, item), () => Action.delayMs(config.delayMs) ] }
}

function pot(item, steps) {
  // console.log('---', item)
  return { next: command, steps: [ ...steps, () => Action.pot(config.ds, item), () => Action.delayMs(config.delayMs) ] }
}

function updateDelay(item, steps) {
  return { next: command, steps: [ ...steps, () => { config.delayMs = item} ]}
}

function delay(item, steps) {
  return { next: command, steps: [ ...steps, () => Action.delayMs(item) ] }
}

function actionCreate(item) {
  return async () => {
    const [busNumber, busAddress] = item.split(':')
    const [bus, ds] = await Action.create(busNumber, busAddress)
    config.bus = bus
    config.ds = ds
  }
}

function actionMock() {
  return async () => {
    const [bus, ds] = await Action.mock()
    config.bus = bus
    config.ds = ds
  }
}

function busAddress(item, steps) {
  return { next: command, steps: [ ...steps, actionCreate(item) ]}
}

function firstCommand(item, steps) {
  if(item === 'address') { return { next: busAddress, steps } }
  if(item === 'mock') {
    return { next: command, steps: [ ...steps, actionMock() ] }
  }

  const firstStep = [ actionCreate(DEFAULT_ADDRESS) ]

  return command(item, firstStep)
}

function command(item, steps) {
  // console.log('start new command', item)
  if(item === 'address') { return { next: busAddress, steps } }
  if(item === 'mode') { return { next: mode, steps } }
  if(item === 'pot') { return { next: pot, steps } }
  if(item === 'unused') { return { next: unused, steps } }
  if(item === 'delay') { return { next: delay, steps } }
  if(item === 'updateDelay') { return { next: updateDelay, steps } }
  if(item === 'mock') {
    return { next: command, steps: [ ...steps, actionMock() ] }
  }
  // if(item === '') { return }

  throw new Error('unknown command: ' + item)
}

async function build(argv) {
  const builder = { steps: [ () => {} ], next: node }
  return argv.reduce((b, item) => b.next(item, b.steps), builder).steps
}

async function main(argv) {
  const steps = await build(argv)
  const provider = config.mock


  for(const s in steps) {
    const step = steps[s]
    //console.log('exec step', step)
    try {
      await step()
    }
    catch(e) {
      console.log('step error', e)
      break
    }
  }
}

try {
  main(process.argv)
}
catch(e) {
  console.log('top level error', e)
}


// set log ON
// set address 0x2b
// set mode updateOnly
// set mode setAndUpdate
// set pot 30%
// set pot 127
// set pot min
// set pot max
// set mode updateOnly pot min
// set default 10%
// set default 37
// set mode setAndUpdate default 120
// set default 50% pot 50%

// set delay 100 pot 0 delay 5000 pot 120
// set address 0x28 pot 10
// set pot 0 delay 30000 pot 127
// set pot 0 delay 1000 mark 1 pot 10


// set mode updateOnly pot 10% mode setAndUpdate default 50%
// set pot 10% pot 20% pot 100% pot 10% delay 1s

// set default 127

// set pot 0-65-0 over 30-10s
