export const DS3502MockDefinition = {
    "commandMask": 255,
    "register": {
      0x00: {
        "name": "WR",
        "readOnly": false,
        "data": 64
      },
      0x01: {
        "name": "unused"
      },
      0x02: {
        "name": "CR",
        "properties": {
        "mode": { "bit": 7 }
        },
        "readOnly": false,
        "data": 0
      }
    }
  }