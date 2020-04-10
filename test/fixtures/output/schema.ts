export default `type Baz {
  id: ID!
}

type Bar {
  baz: Baz!
}

type Foo {
  baz: Baz!
}

type Mutation {
  setBar(id: ID!): Bar
  setFoo(id: ID!): Foo
}

type Query {
  getBar(id: ID!): Bar
  getFoo(id: ID!): Foo
}

schema {
  mutation: Mutation
  query: Query
}
`
