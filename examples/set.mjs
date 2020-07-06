import i2c from 'i2c-bus'
import aod from '@johntalton/and-other-delights'
const { I2CAddressedBus } = aod
import { DS3502 } from '@johntalton/ds3502'

const busAddress = 0x28

class Action {
  static pot(ds, value) { return ds.setProfile({ WR: value }) }
  static mode(bus, value) {}
  
}



function script(item) {
  console.log('script', item)
  return { next: command }
}

function node(item) {
  console.log('node', item)
  return { next: script }
}

function mode(item) {
  return { next: modeValue }
}

function pot(item, steps = []) {
  console.log('---', item)
  return { next: command, steps: [ (ds) => Action.pot(ds, item), ...steps ] }
}

function command(item) {
  console.log('start new command', item)
  if(item === 'mode') { return { next: mode } }
  if(item === 'pot') { return { next: pot } }
  if(item === 'default') { return }
  // if(item === '') { return } 

  throw new Error('unknown command: ' + item)
}

async function build(argv) {
  const builder = { steps: [], next: node }

  return argv.reduce((b, item) => b.next(item), builder).steps
}

async function main(argv) {
  const steps = await build(argv)
  const bus1 = await i2c.openPromisified(1)
  const ds = await DS3502.from(new I2CAddressedBus(bus1, busAddress))

  steps.forEach(async step => {
    console.log('execute step', step)
    await step(ds)
  })
}

main(process.argv)


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

// set mode updateOnly pot 10% mode setAndUpdate default 50%
// set pot 10% pot 20% pot 100% pot 10% delay 1s

// set default 127 

// set pot 0-65-0 over 30-10s
