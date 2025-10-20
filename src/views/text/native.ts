function hex4(n: number) {
  return n.toString(16).toUpperCase().padStart(4, '0')
}

export function nativeToAscii(str: string) {
  let out = ''
  for (const ch of str) {
    const cp = ch.codePointAt(0)!
    if (cp <= 0x7F) {
      out += ch; // ASCII 保留原样
    } else if (cp <= 0xFFFF) {
      out += '\\u' + hex4(cp)
    } else {
      // 非 BMP：生成代理项对（high surrogate, low surrogate）
      const u = cp - 0x10000
      const high = 0xD800 + (u >> 10)
      const low = 0xDC00 + (u & 0x3FF)
      out += '\\u' + hex4(high) + '\\u' + hex4(low)
    }
  }
  return out
}

export function asciiToNative(str: string) {
  // 1) \u{...} -> 相应的字符
  let s = str.replace(/\\u\{([0-9A-Fa-f]+)\}/g, (_, hex) => {
    const cp = parseInt(hex, 16)
    return String.fromCodePoint(cp)
  })

  // 2) \uXXXX -> 对应的 code unit
  s = s.replace(/\\u([0-9A-Fa-f]{4})/g, (_, hex4) => {
    const cu = parseInt(hex4, 16)
    return String.fromCharCode(cu)
  })

  return s
}
