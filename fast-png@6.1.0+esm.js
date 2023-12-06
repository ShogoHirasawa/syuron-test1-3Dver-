/**
 * Bundled by jsDelivr using Rollup v2.79.1 and Terser v5.19.2.
 * Original file: /npm/fast-png@6.1.0/lib-esm/index.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import { IOBuffer as t } from "./iobuffer@5.3.2+esm.js";
import { Inflate as e, inflate as r, deflate as i } from "./pako@2.1.0+esm.js";
const s = [137, 80, 78, 71, 13, 10, 26, 10],
  n = [];
for (let t = 0; t < 256; t++) {
  let e = t;
  for (let t = 0; t < 8; t++) 1 & e ? (e = 3988292384 ^ (e >>> 1)) : (e >>>= 1);
  n[t] = e;
}
const h = 4294967295;
function o(t, e) {
  return (
    ((function (t, e, r) {
      let i = t;
      for (let t = 0; t < r; t++) i = n[255 & (i ^ e[t])] ^ (i >>> 8);
      return i;
    })(h, t, e) ^
      h) >>>
    0
  );
}
var a, c, d, l;
!(function (t) {
  (t[(t.UNKNOWN = -1)] = "UNKNOWN"),
    (t[(t.GREYSCALE = 0)] = "GREYSCALE"),
    (t[(t.TRUECOLOUR = 2)] = "TRUECOLOUR"),
    (t[(t.INDEXED_COLOUR = 3)] = "INDEXED_COLOUR"),
    (t[(t.GREYSCALE_ALPHA = 4)] = "GREYSCALE_ALPHA"),
    (t[(t.TRUECOLOUR_ALPHA = 6)] = "TRUECOLOUR_ALPHA");
})(a || (a = {})),
  (function (t) {
    (t[(t.UNKNOWN = -1)] = "UNKNOWN"), (t[(t.DEFLATE = 0)] = "DEFLATE");
  })(c || (c = {})),
  (function (t) {
    (t[(t.UNKNOWN = -1)] = "UNKNOWN"), (t[(t.ADAPTIVE = 0)] = "ADAPTIVE");
  })(d || (d = {})),
  (function (t) {
    (t[(t.UNKNOWN = -1)] = "UNKNOWN"),
      (t[(t.NO_INTERLACE = 0)] = "NO_INTERLACE"),
      (t[(t.ADAM7 = 1)] = "ADAM7");
  })(l || (l = {}));
const f = new Uint8Array(0),
  p = new Uint16Array([255]),
  u = 255 === new Uint8Array(p.buffer)[0];
class w extends t {
  constructor(t, r = {}) {
    super(t);
    const { checkCrc: i = !1 } = r;
    (this._checkCrc = i),
      (this._inflator = new e()),
      (this._png = {
        width: -1,
        height: -1,
        channels: -1,
        data: new Uint8Array(0),
        depth: 1,
        text: {},
      }),
      (this._end = !1),
      (this._hasPalette = !1),
      (this._palette = []),
      (this._compressionMethod = c.UNKNOWN),
      (this._filterMethod = d.UNKNOWN),
      (this._interlaceMethod = l.UNKNOWN),
      (this._colorType = -1),
      this.setBigEndian();
  }
  decode() {
    for (this.decodeSignature(); !this._end; ) this.decodeChunk();
    return this.decodeImage(), this._png;
  }
  decodeSignature() {
    for (let t = 0; t < s.length; t++)
      if (this.readUint8() !== s[t])
        throw new Error(`wrong PNG signature. Byte at ${t} should be ${s[t]}.`);
  }
  decodeChunk() {
    const t = this.readUint32(),
      e = this.readChars(4),
      r = this.offset;
    switch (e) {
      case "IHDR":
        this.decodeIHDR();
        break;
      case "PLTE":
        this.decodePLTE(t);
        break;
      case "IDAT":
        this.decodeIDAT(t);
        break;
      case "IEND":
        this._end = !0;
        break;
      case "tRNS":
        this.decodetRNS(t);
        break;
      case "iCCP":
        this.decodeiCCP(t);
        break;
      case "tEXt":
        this.decodetEXt(t);
        break;
      case "pHYs":
        this.decodepHYs();
        break;
      default:
        this.skip(t);
    }
    if (this.offset - r !== t)
      throw new Error(`Length mismatch while decoding chunk ${e}`);
    if (this._checkCrc) {
      const r = this.readUint32(),
        i = t + 4,
        s = o(
          new Uint8Array(this.buffer, this.byteOffset + this.offset - i - 4, i),
          i
        );
      if (s !== r)
        throw new Error(
          `CRC mismatch for chunk ${e}. Expected ${r}, found ${s}`
        );
    } else this.skip(4);
  }
  decodeIHDR() {
    const t = this._png;
    (t.width = this.readUint32()),
      (t.height = this.readUint32()),
      (t.depth = (function (t) {
        if (1 !== t && 2 !== t && 4 !== t && 8 !== t && 16 !== t)
          throw new Error(`invalid bit depth: ${t}`);
        return t;
      })(this.readUint8()));
    const e = this.readUint8();
    let r;
    switch (((this._colorType = e), e)) {
      case a.GREYSCALE:
        r = 1;
        break;
      case a.TRUECOLOUR:
        r = 3;
        break;
      case a.INDEXED_COLOUR:
        r = 1;
        break;
      case a.GREYSCALE_ALPHA:
        r = 2;
        break;
      case a.TRUECOLOUR_ALPHA:
        r = 4;
        break;
      default:
        throw new Error(`Unknown color type: ${e}`);
    }
    if (
      ((this._png.channels = r),
      (this._compressionMethod = this.readUint8()),
      this._compressionMethod !== c.DEFLATE)
    )
      throw new Error(
        `Unsupported compression method: ${this._compressionMethod}`
      );
    (this._filterMethod = this.readUint8()),
      (this._interlaceMethod = this.readUint8());
  }
  decodePLTE(t) {
    if (t % 3 != 0)
      throw new RangeError(
        `PLTE field length must be a multiple of 3. Got ${t}`
      );
    const e = t / 3;
    this._hasPalette = !0;
    const r = [];
    this._palette = r;
    for (let t = 0; t < e; t++)
      r.push([this.readUint8(), this.readUint8(), this.readUint8()]);
  }
  decodeIDAT(t) {
    this._inflator.push(
      new Uint8Array(this.buffer, this.offset + this.byteOffset, t)
    ),
      this.skip(t);
  }
  decodetRNS(t) {
    if (3 === this._colorType) {
      if (t > this._palette.length)
        throw new Error(
          `tRNS chunk contains more alpha values than there are palette colors (${t} vs ${this._palette.length})`
        );
      let e = 0;
      for (; e < t; e++) {
        const t = this.readByte();
        this._palette[e].push(t);
      }
      for (; e < this._palette.length; e++) this._palette[e].push(255);
    }
  }
  decodeiCCP(t) {
    let e,
      i = "";
    for (; "\0" !== (e = this.readChar()); ) i += e;
    const s = this.readUint8();
    if (s !== c.DEFLATE)
      throw new Error(`Unsupported iCCP compression method: ${s}`);
    const n = this.readBytes(t - i.length - 2);
    this._png.iccEmbeddedProfile = { name: i, profile: r(n) };
  }
  decodetEXt(t) {
    let e,
      r = "";
    for (; "\0" !== (e = this.readChar()); ) r += e;
    this._png.text[r] = this.readChars(t - r.length - 1);
  }
  decodepHYs() {
    const t = this.readUint32(),
      e = this.readUint32(),
      r = this.readByte();
    this._png.resolution = { x: t, y: e, unit: r };
  }
  decodeImage() {
    if (this._inflator.err)
      throw new Error(
        `Error while decompressing the data: ${this._inflator.err}`
      );
    const t = this._inflator.result;
    if (this._filterMethod !== d.ADAPTIVE)
      throw new Error(`Filter method ${this._filterMethod} not supported`);
    if (this._interlaceMethod !== l.NO_INTERLACE)
      throw new Error(
        `Interlace method ${this._interlaceMethod} not supported`
      );
    this.decodeInterlaceNull(t);
  }
  decodeInterlaceNull(t) {
    const e = this._png.height,
      r = (this._png.channels * this._png.depth) / 8,
      i = this._png.width * r,
      s = new Uint8Array(this._png.height * i);
    let n,
      h,
      o = f,
      a = 0;
    for (let c = 0; c < e; c++) {
      switch (
        ((n = t.subarray(a + 1, a + 1 + i)),
        (h = s.subarray(c * i, (c + 1) * i)),
        t[a])
      ) {
        case 0:
          E(n, h, i);
          break;
        case 1:
          _(n, h, i, r);
          break;
        case 2:
          U(n, h, o, i);
          break;
        case 3:
          g(n, h, o, i, r);
          break;
        case 4:
          N(n, h, o, i, r);
          break;
        default:
          throw new Error(`Unsupported filter: ${t[a]}`);
      }
      (o = h), (a += i + 1);
    }
    if (
      (this._hasPalette && (this._png.palette = this._palette),
      16 === this._png.depth)
    ) {
      const t = new Uint16Array(s.buffer);
      if (u)
        for (let e = 0; e < t.length; e++)
          t[e] = ((255 & (c = t[e])) << 8) | ((c >> 8) & 255);
      this._png.data = t;
    } else this._png.data = s;
    var c;
  }
}
function E(t, e, r) {
  for (let i = 0; i < r; i++) e[i] = t[i];
}
function _(t, e, r, i) {
  let s = 0;
  for (; s < i; s++) e[s] = t[s];
  for (; s < r; s++) e[s] = (t[s] + e[s - i]) & 255;
}
function U(t, e, r, i) {
  let s = 0;
  if (0 === r.length) for (; s < i; s++) e[s] = t[s];
  else for (; s < i; s++) e[s] = (t[s] + r[s]) & 255;
}
function g(t, e, r, i, s) {
  let n = 0;
  if (0 === r.length) {
    for (; n < s; n++) e[n] = t[n];
    for (; n < i; n++) e[n] = (t[n] + (e[n - s] >> 1)) & 255;
  } else {
    for (; n < s; n++) e[n] = (t[n] + (r[n] >> 1)) & 255;
    for (; n < i; n++) e[n] = (t[n] + ((e[n - s] + r[n]) >> 1)) & 255;
  }
}
function N(t, e, r, i, s) {
  let n = 0;
  if (0 === r.length) {
    for (; n < s; n++) e[n] = t[n];
    for (; n < i; n++) e[n] = (t[n] + e[n - s]) & 255;
  } else {
    for (; n < s; n++) e[n] = (t[n] + r[n]) & 255;
    for (; n < i; n++) e[n] = (t[n] + A(e[n - s], r[n], r[n - s])) & 255;
  }
}
function A(t, e, r) {
  const i = t + e - r,
    s = Math.abs(i - t),
    n = Math.abs(i - e),
    h = Math.abs(i - r);
  return s <= n && s <= h ? t : n <= h ? e : r;
}
const b = { level: 3 };
class C extends t {
  constructor(t, e = {}) {
    super(),
      (this._colorType = a.UNKNOWN),
      (this._zlibOptions = Object.assign({}, b, e.zlib)),
      (this._png = this._checkData(t)),
      this.setBigEndian();
  }
  encode() {
    return (
      this.encodeSignature(),
      this.encodeIHDR(),
      this.encodeData(),
      this.encodeIEND(),
      this.toArray()
    );
  }
  encodeSignature() {
    this.writeBytes(s);
  }
  encodeIHDR() {
    this.writeUint32(13),
      this.writeChars("IHDR"),
      this.writeUint32(this._png.width),
      this.writeUint32(this._png.height),
      this.writeByte(this._png.depth),
      this.writeByte(this._colorType),
      this.writeByte(c.DEFLATE),
      this.writeByte(d.ADAPTIVE),
      this.writeByte(l.NO_INTERLACE),
      this.writeCrc(17);
  }
  encodeIEND() {
    this.writeUint32(0), this.writeChars("IEND"), this.writeCrc(4);
  }
  encodeIDAT(t) {
    this.writeUint32(t.length),
      this.writeChars("IDAT"),
      this.writeBytes(t),
      this.writeCrc(t.length + 4);
  }
  encodeData() {
    const { width: e, height: r, channels: s, depth: n, data: h } = this._png,
      o = s * e,
      a = new t().setBigEndian();
    let c = 0;
    for (let t = 0; t < r; t++)
      if ((a.writeByte(0), 8 === n)) c = O(h, a, o, c);
      else {
        if (16 !== n) throw new Error("unreachable");
        c = T(h, a, o, c);
      }
    const d = a.toArray(),
      l = i(d, this._zlibOptions);
    this.encodeIDAT(l);
  }
  _checkData(t) {
    const {
        colorType: e,
        channels: r,
        depth: i,
      } = (function (t) {
        const { channels: e = 4, depth: r = 8 } = t;
        if (4 !== e && 3 !== e && 2 !== e && 1 !== e)
          throw new RangeError(`unsupported number of channels: ${e}`);
        if (8 !== r && 16 !== r)
          throw new RangeError(`unsupported bit depth: ${r}`);
        const i = { channels: e, depth: r, colorType: a.UNKNOWN };
        switch (e) {
          case 4:
            i.colorType = a.TRUECOLOUR_ALPHA;
            break;
          case 3:
            i.colorType = a.TRUECOLOUR;
            break;
          case 1:
            i.colorType = a.GREYSCALE;
            break;
          case 2:
            i.colorType = a.GREYSCALE_ALPHA;
            break;
          default:
            throw new Error("unsupported number of channels");
        }
        return i;
      })(t),
      s = {
        width: R(t.width, "width"),
        height: R(t.height, "height"),
        channels: r,
        data: t.data,
        depth: i,
        text: {},
      };
    this._colorType = e;
    const n = s.width * s.height * r;
    if (s.data.length !== n)
      throw new RangeError(
        `wrong data size. Found ${s.data.length}, expected ${n}`
      );
    return s;
  }
  writeCrc(t) {
    this.writeUint32(
      o(new Uint8Array(this.buffer, this.byteOffset + this.offset - t, t), t)
    );
  }
}
function R(t, e) {
  if (Number.isInteger(t) && t > 0) return t;
  throw new TypeError(`${e} must be a positive integer`);
}
function O(t, e, r, i) {
  for (let s = 0; s < r; s++) e.writeByte(t[i++]);
  return i;
}
function T(t, e, r, i) {
  for (let s = 0; s < r; s++) e.writeUint16(t[i++]);
  return i;
}
var y;
function L(t, e) {
  return new w(t, e).decode();
}
function k(t, e) {
  return new C(t, e).encode();
}
!(function (t) {
  (t[(t.UNKNOWN = 0)] = "UNKNOWN"), (t[(t.METRE = 1)] = "METRE");
})(y || (y = {}));
export { y as ResolutionUnitSpecifier, L as decode, k as encode };
export default null;
//# sourceMappingURL=/sm/498760f858deb9b331642f7528e7c92ca0e7be907671afa4e164223cf3be231f.map
