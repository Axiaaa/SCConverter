
export class ByteStream {

  buffer: Uint8Array;
  length: number;
  offset: number;
  bitOffset: number;

  constructor(data?: Uint8Array) {
    this.buffer = data != null ? data : new Uint8Array(0)
    this.length = 0
    this.offset = 0
    this.bitOffset = 0
  }

  readInt() {
    this.bitOffset = 0
    return ((this.buffer[this.offset++] ?? 0) << 24 |
      (this.buffer[this.offset++] ?? 0) << 16 |
      (this.buffer[this.offset++] ?? 0) << 8 |
      (this.buffer[this.offset++] ?? 0))
  }

  skip(len: number) {
    this.bitOffset += len
  }

  /**
   *  Reading Short from Bytes (`commonly isn't used.`)
   * @returns { Number } Short
   */
  readShort() {
    this.bitOffset = 0
    return ((this.buffer[this.offset++] ?? 0) << 8 |
      (this.buffer[this.offset++] ?? 0))
  }

  /**
   * Writing value to Bytes as Short (c`ommonly isn't used`)
   * @param {Number} value Your value to write.
   */
  writeShort(value: number) {
    this.bitOffset = 0
    this.ensureCapacity(2)
    this.buffer[this.offset++] = (value >> 8)
    this.buffer[this.offset++] = (value)
  }

  /**
   * Writing value to Bytes as Int
   * @param {Number} value Your value to write.
   */
  writeInt(value: number) {
    this.bitOffset = 0
    this.ensureCapacity(4)
    this.buffer[this.offset++] = (value >> 24)
    this.buffer[this.offset++] = (value >> 16)
    this.buffer[this.offset++] = (value >> 8)
    this.buffer[this.offset++] = (value )
  }

  /**
   * Get Bytes in String
   * @returns { String } Bytes in String form (`AA-BB-CC`)
   */
  getHex(resetOffset?: boolean) {
    return Array.from(this.buffer.subarray(resetOffset ?? true ? 0 : 0, this.offset))
      .map(b => `${b.toString(16).padStart(2, '0')}`)
      .join('');
  }

  /**
   *  Reading String from Bytes
   */
  readString() {
    const len = this.readInt();
    let str : string ="";
    for (let i = 0; i < len; i++)
      str += String.fromCharCode(this.buffer[this.offset++] ?? 0)
    return str
  }

  /**
   * Reading VarInt from Bytes
   * @returns { Number } VarInt
   */
  readVInt() {
    let result = 0,
      shift = 0,
      s = 0,
      a1 = 0,
      a2 = 0
    do {
      let byte = this.buffer[this.offset++] ?? 0
      if (shift === 0) {
        a1 = (byte & 0x40) >> 6
        a2 = (byte & 0x80) >> 7
        s = (byte << 1) & ~0x181
        byte = s | (a2 << 7) | a1
      }
      result |= (byte & 0x7f) << shift
      shift += 7
      if (!(byte & 0x80)) { break }
    } while (true)

    return (result >> 1) ^ (-(result & 1))
  }

  /**
   * Reading 2 VarInts from Bytes
   * @returns { Array<Number> } Commonly CSVID and ReferenceID
   */
  readDataReference(): [number, number] {
    const a1 = this.readVInt()
    return [a1, a1 == 0 ? 0 : this.readVInt()]
  }

  /**
   * Writing values to Bytes as VarInts
   * If value1 is 0, then 2nd value doesn't used
   * 
   * @param {Number} value1 Your value to write. Commonly it's a CSVID
   * @param {Number} value2 Your value to write. Commonly it's a ReferenceID
   */
  writeDataReference(value1: number, value2: number) {
    if (value1 < 1) {
      this.writeVInt(0)
    } else {
      this.writeVInt(value1)
      this.writeVInt(value2)
    }
  }

  /**
   * Writing value to Bytes as VarInt
   * @param {Number} value Your value to write.
   */
  writeVInt(value: number) {
    this.bitOffset = 0
    let temp = (value >> 25) & 0x40

    let flipped = value ^ (value >> 31)

    temp |= value & 0x3F

    value >>= 6
    flipped >>= 6

    if (flipped === 0) {
      this.writeByte(temp)
      return
    }

    this.writeByte(temp | 0x80)

    flipped >>= 7
    let r = 0

    if (flipped) { r = 0x80 }

    this.writeByte((value & 0x7F) | r)

    value >>= 7

    while (flipped !== 0) {
      flipped >>= 7
      r = 0
      if (flipped) { r = 0x80 }
      this.writeByte((value & 0x7F) | r)
      value >>= 7
    }
  }

  /**
   * Writing value to Bytes as NullVInt (Retro Royale shit nigga)
   * @param {Number} count Count of NullVInts to write.
   */
  writeNullVInt(count = 1) {
    for (let i = 0; i < count; i++)
      this.writeByte(0x7F)
  }

  /**
   * Writing value to Bytes as Boolean
   * @param {Boolean} value Your value to write.
   */
  writeBoolean(value: boolean) {
    if (value) {
      this.writeVInt(1)
    } else {
      this.writeVInt(0)
    }
  }

  /**
   * Reading Boolean from Bytes
   * @returns { Boolean } Boolean (`true|false`)
   */
  readBoolean() {
    return this.readVInt() >= 1
  }

  /**
   * Writing value to Bytes as String
   * @param {String} value Your value to write.
   */
  writeString(value: string) {
    const strlen = value.length
    if (value == null || strlen > 90000) {
      this.writeInt(0)
      return
    }
    this.writeInt(strlen)
    this.ensureCapacity(strlen)

    for (let i = 0; i < strlen; i++) {
      this.buffer[this.offset++] = value.charCodeAt(i)
    }
  }

  /**
 * Writing value to Bytes as String but length is VInt? wtf nigga?
 * @param {String} value Your value to write.
 */
  writeVString(value: string) {
    if (value == null || value.length > 90000) {
      this.writeVInt(-1)
      return
    }

    const encoder = new TextEncoder();
    const buf = encoder.encode(value);
    this.writeVInt(buf.length)
    const newBuffer = new Uint8Array(this.buffer.length + buf.length);
    newBuffer.set(this.buffer);
    newBuffer.set(buf, this.buffer.length);
    this.buffer = newBuffer;
    this.offset += buf.length
  }

  /**
   * Writing value to Bytes as String (`You can just use writeString()`)
   * @param {String} value Your value to write.
   */
  writeStringReference = this.writeString

  /**
   * Writing value to Bytes as LongLong (`commonly isn't used`)
   * @param {Number} value Your value to write.
   */
  writeLongLong(value: number) {
    this.writeInt(value >> 32)
    this.writeInt(value)
  }

  /**
   * Writing values to Bytes as VarInts
   * 
   * @param {Number} value1 Your value to write.
   * @param {Number} value2 Your value to write.
   */
  writeLogicLong(value1: number, value2: number) {
    this.writeVInt(value1)
    this.writeVInt(value2)
  }

  /**
   * Reading 2 VarInts from Bytes
   * @returns { Array<Number> } LogicLong VarInts
   */
  readLogicLong(): [number, number] {
    return [this.readVInt(), this.readVInt()]
  }

  /**
   * Writing values to Bytes as Ints
   * 
   * @param {Number} value1 Your value to write.
   * @param {Number} value2 Your value to write.
   */
  writeLong(value1: number, value2: number) {
    this.writeInt(value1)
    this.writeInt(value2)
  }

  /**
   * Reading 2 Ints from Bytes
   * @returns { Array<Number> } Long Ints
   */
  readLong(): [number, number] {
    return [this.readInt(), this.readInt()]
  }


  /**
   * Reading a Byte from Bytes
   * @returns {Number} The byte value read
   */
  readByte() {
    this.bitOffset = 0
    return this.buffer[this.offset++]
  }

  /**
   * Writing value to Bytes as Byte
   * @param {Number} value Your value to write.
   */
  writeByte(value: number) {
    this.bitOffset = 0
    this.ensureCapacity(1)
    this.buffer[this.offset++] = value
  }

  /**
   * Writing value to Bytes as ByteArray
   * @param {Uint8Array} buffer Your buffer to write.
   */
  writeBytes(buffer: Uint8Array) {
    const length = buffer.length

    if (buffer != null) {
      this.writeInt(length)
      const newBuffer = new Uint8Array(this.buffer.length + buffer.length);
      newBuffer.set(this.buffer);
      newBuffer.set(buffer, this.buffer.length);
      this.buffer = newBuffer;
      this.offset += length
      return
    }

    this.writeInt(-1)
  }

  /**
   * Writing HEX to Bytes
   * @param {String} str HEX data.
   */
  writeHex(str: string) {
    const hexArray = str.replace(/-/g, '').match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) ?? [];
    const encoded = new Uint8Array(hexArray);

    const newBuffer = new Uint8Array(this.buffer.length + encoded.length);
    newBuffer.set(this.buffer);
    newBuffer.set(encoded, this.buffer.length);
    this.buffer = newBuffer;
    this.offset += encoded.length
  }

  writeHexa(data: string) {
    this.bitOffset = 0
    if (data) {
      if (data.startsWith('0x')) {
        data = data.substring(2)
      }
      const hexString = data.replace(/-/g, '').replace(/\s/g, '')
      const hexArray = [];
      for (let i = 0; i < hexString.length; i += 2) {
        hexArray.push(parseInt(hexString.substr(i, 2), 16));
      }
      const buffer = new Uint8Array(hexArray);
      this.ensureCapacity(buffer.length)
      this.buffer.set(buffer, this.offset);
      this.offset += buffer.length
    }
  }

  /**
   * Adding more space to Buffer
   * @param {Number} capacity Amount of new space
   */
  ensureCapacity(capacity: number) {
    const bufferLength = this.buffer.length

    if (this.offset + capacity > bufferLength) {
      const newBuffer = new Uint8Array(this.buffer.length + capacity);
      newBuffer.set(this.buffer);
      this.buffer = newBuffer;
    }
  }
}

