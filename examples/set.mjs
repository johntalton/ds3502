import i2c from 'i2c-bus'
import aod from '@johntalton/and-other-delights'
const { I2CAddressedBus } = aod
import { DS3502 } from '@johntalton/ds3502'

const busAddress = 0x28
const config = { delayMs: 15, mock: false }

function delayMs(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

class Action {
  static pot(ds, value) { return ds.setProfile({ WR: value }) }
  static mode(ds, value) { return ds.setProfile({ CR: value }) }
  static unused(ds, value) { return ds.setProfile({ unused: value })}
}

function script(item, steps) {
  return { next: command, steps }
}

function node(item, steps) {
  return { next: script, steps }
}

function mode(item, steps) {
  return { next: command, steps: [ ...steps, (ds) => Action.mode(ds, item) ] }
}

function pot(item, steps) {
  // console.log('---', item)
  return { next: command, steps: [ ...steps, (ds) => Action.pot(ds, item) ] }
}

function potDefault(item, steps) {
  // console.log('---', item)
  return { next: command, steps: [ ...steps, (ds) => Action.potDefault(ds, item) ]}
}

function updateDelay(item, steps) {
  return { next: command, steps: [ ...steps, (ds) => { config.delayMs = item} ]}
}

function delay(item, steps) {
  return { next: command, steps: [ ...steps, (ds) => delayMs(item) ] }
}

function command(item, steps) {
  // console.log('start new command', item)
  if(item === 'mode') { return { next: mode, steps } }
  if(item === 'pot') { return { next: pot, steps } }
  if(item === 'unused') { return { next: unused, steps } }
  if(item === 'delay') { return { next: delay, steps } } 
  if(item === 'updateDelay') { return { next: updateDelay, steps } }
  if(item === 'mock') {
    config.mock = true
    return { next: command, steps }
  } 
  // if(item === '') { return } 

  throw new Error('unknown command: ' + item)
}

async function build(argv) {
  const builder = { steps: [], next: node }
  return argv.reduce((b, item) => b.next(item, b.steps), builder).steps
}

async function main(argv) {
  const steps = await build(argv)
  const bus1 = await i2c.openPromisified(1)
  const ds = await DS3502.from(new I2CAddressedBus(bus1, busAddress))

  for(const s in steps) {
    const step = steps[s]
    //console.log('exec step', step)
    try {
      await step(ds)
      await delayMs(config.delayMs)
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
