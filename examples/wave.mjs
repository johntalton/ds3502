import i2c from 'i2c-bus'
import aod from '@johntalton/and-other-delights'
const { I2CAddressedBus } = aod
import { DS3502 } from '@johntalton/ds3502'

const busAddress = 0x28
const config = { delayMs: 15, mock: false }

function delayMs(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

const bus1 = await i2c.openPromisified(1)
const ds = await DS3502.from(new I2CAddressedBus(bus1, busAddress))

class Waves {
  static async *sin(low, high, periodMs, cache = []) {
    const twoPi = 2 * Math.PI
    const range = high - low
    const w = twoPi / periodMs

    const bucketCount = 1000
    const bucketSizeMs = periodMs / bucketCount
    

    const foo = (mtime, cache) => {
      const bucket = Math.trunc(mtime / bucketSizeMs)
      if(cache === undefined || cache[bucket] === undefined) {
        const value = Math.trunc((((0.5 * Math.sin(w * mtime)) + 0.5) * range) + low + 0.5)
        if(cache !== undefined) { cache[bucket] = value }
        return value
      }
      return cache[bucket]
    }


    while(true) {
      const now = Date.now()
      const r = now % periodMs
      yield foo(r, cache)
    }
  }
}



const low = 90
const high = 127
const periodMs = 3 * 1000

await ds.setProfile({ CR: 128 })

const start = 50

const cache = undefined

let previous = undefined
const geni = Waves.sin(low, high, periodMs, cache)

/*
//let first = true
process.on('SIGINT', signal => {
  console.log('SIGINT', signal)
  //process.exit(0)
  //if(first) { first = false } else { return process.exit(-1) }
   geni.return()
  //console.log(r)
})
*/

for await (const p of geni) {  
  if(false) { 
   let out = low < start ? '< ...' : '[ ...'
    for(let i = start; i <= 127; i++) {
      if(i === low && i !== p) { out += '<' }
      else if(i === high && i !== p) { out += '>' }
      else if(i === p) { out += '*' }
      else { out += ' ' }
    }
    out += ']'
    console.log(out, p)
  }

  if(p === previous) { continue }
  previous = p

  if(cache) { console.log(cache) }


  await ds.setProfile({ WR: p })
}

