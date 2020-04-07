export default `schema {
  mutation: Mutation
  query: Query
}

type Mutation {
  setBar(id: ID!): Bar
  setFoo(id: ID!): Foo
}

type Query {
  getBar(id: ID!): Bar
  getFoo(id: ID!): Foo
}

type Bar {
  baz: Baz!
}

type Foo {
  baz: Baz!
}

type Baz {
  id: ID!
}
`
