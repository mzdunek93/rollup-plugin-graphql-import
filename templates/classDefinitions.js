/* eslint-disable */
class Token {
  constructor(kind, start, end, line, column, prev, value) {
    this.kind = kind
    this.start = start
    this.end = end
    this.line = line
    this.column = column
    this.value = value
    this.prev = prev
    this.next = null
  }
}

Token.prototype.inspect = function () {
  return {
    kind: this.kind,
    value: this.value,
    line: this.line,
    column: this.column
  }
}
Token.prototype.toJSON = Token.prototype.inspect

export class Location {
  constructor(startToken, endToken, source) {
    this.start = startToken.start
    this.end = endToken.end
    this.startToken = startToken
    this.endToken = endToken
    this.source = source
  }
}

Location.prototype.inspect = function () {
  return { start: this.start, end: this.end }
}
Location.prototype.toJSON = Location.prototype.inspect

const SYMBOL_TO_STRING_TAG = typeof Symbol === 'function' ? Symbol.toStringTag : '@@toStringTag'

class Source {
  constructor(body, name = 'GraphQL request', locationOffset = { line: 1, column: 1 }) {
    this.body = body
    this.name = name
    this.locationOffset = locationOffset
  }

  get [SYMBOL_TO_STRING_TAG]() {
    return 'Source'
  }
}
