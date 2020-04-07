import { Source } from 'graphql'
import { Location, Token } from 'graphql/language/ast'

const s = (literals: TemplateStringsArray, ...args: unknown[]) =>
  literals
    .slice(0, -1)
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    .map((str, i) => str + serialize(args[i]))
    .join('') + literals[literals.length - 1]

const serializeSource = ({ body, name, locationOffset }: Source) =>
  s`new Source(${body},${name},${locationOffset})`

const serializeToken = ({ kind, start, end, line, column, value }: Token) =>
  s`new Token(${kind},${start},${end},${line},${column},null,${value})`

const serializeLocation = ({ startToken, endToken, source }: Location) =>
  s`new Location(${startToken},${endToken},${source})`

const serializeArray = (arr: unknown[]) => `[${arr.map((val) => s`${val}`).join(',')}]`

const serializeObject = (obj: object) =>
  `{${Object.entries(obj)
    .map(([key, value]) => s`${key}:${value}`)
    .join(',')}}`

const serialize = (val: unknown): string =>
  val instanceof Location
    ? serializeLocation(val)
    : val instanceof Token
    ? serializeToken(val)
    : val instanceof Source
    ? serializeSource(val)
    : Array.isArray(val)
    ? serializeArray(val)
    : typeof val === 'object' && val
    ? serializeObject(val)
    : JSON.stringify(val)

export default serialize
