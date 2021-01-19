import i2c from 'i2c-bus'
import aod from '@johntalton/and-other-delights'
const { I2CAddressedBus } = aod
import { DS3502 } from '@johntalton/ds3502'

const DEFAULT_ADDRESS = 0x28
const ALT_ADDRESS = 0x2b

function delayMs(state, ms) {
  if(state.log) { console.log('Start Delay', ms) }
  return new Promise(resolve => setTimeout(() => {
    if(state.log) { console.log('End Delay') }
    resolve()
  }, ms))
}

class Action {
  static pot(state, value) {
    if(state.log) { console.log('Setting Wiper Value', value) }
    return state.ds.setProfile({ WR: value })
  }
  
  static mode(state, value) {
    if(state.log) { console.log('Setting Control', value) }
    return state.ds.setProfile({ CR: value })
  }
  
  static unused(state, value) {
    if(state.log) { console.log('Setting Unused', value) }
    return state.ds.setProfile({ unused: value })
  }
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
  return { next: addressOrCommand, steps }
}

function node(item, steps) {
  return { next: script, steps }
}

function log(logStr, steps) {
  const log = logStr.toUpperCase() === 'ON'  

  return { next: command, steps: [ ...steps, state => { state.log = log }] }
}

function address(addressStr, steps) {
  const address = parseInt(addressStr, 16)
  return { next: command, steps: [ ...steps, state => setupDS(state, address) ]  }
}

function mode(modeStr, steps) {
  const mode = modeStr
  return { next: command, steps: [ ...steps, state => Action.mode(state, mode) ] }
}

function pot(potStr, steps) {
  const pot = potStr
  return { next: command, steps: [ ...steps, state => Action.pot(state, pot) ] }
}

function commandDelay(commandDelayStr, steps) {
  const commandDelayMs = commandDelayStr
  return { next: command, steps: [ ...steps, state => {
    if(state.log) { console.log('Updating command delayMs', commandDelayMs) }
    state.commandDelayMs = commandDelayMs
  }]}
}

function delay(delayStr, steps) {
  const _delayMs = delayStr
  return { next: command, steps: [ ...steps, state => delayMs(state, _delayMs) ] }
}

function command(item, steps) {
  if(item === 'log') { return { next: log, steps } }
  if(item === 'address') { return { next: address, steps } }
  if(item === 'mode') { return { next: mode, steps } }
  if(item === 'pot') { return { next: pot, steps } }
  if(item === 'unused') { return { next: unused, steps } }
  if(item === 'delay') { return { next: delay, steps } } 
  if(item === 'commandDelay') { return { next: commandDelay, steps } }
  if(item === 'mock') {
    config.mock = true
    return { next: command, steps }
  } 
  // if(item === '') { return } 

  throw new Error('unknown command: ' + item)
}

async function build(argv) {
  const builder = { next: node, steps: [] }
  return argv.reduce((b, item) => b.next(item, b.steps), builder).steps
}

async function main(argv) {
  const steps = await build(argv)
  const state = { commandDelayMs: 15, log: false }

  for(const s in steps) {
    const step = steps[s]
    //console.log('exec step', step)
    try {
      await step(state)
      await delayMs(state, state.commandDelayMs)
    }
    catch(e) {
      console.log('step error', e)
      break
    }
  }

  /*steps.forEach(async step => {
    console.log('execute step', step)
    //await step(ds)
    await delay(1000 * 5)
  })*/
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
