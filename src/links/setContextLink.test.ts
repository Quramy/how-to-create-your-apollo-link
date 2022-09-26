import fetch from "cross-fetch"
import { gql as parse, ApolloLink, HttpLink, from, toPromise } from "@apollo/client"
import { graphql, ResponseResolver, MockedRequest, GraphQLContext } from "msw"
import { setupServer } from "msw/node"

import { createSetContextLink } from "./setContextLink"

describe(createSetContextLink, () => {
  const server = setupServer()

  const mockResolver: jest.Mock<
    ReturnType<ResponseResolver>,
    Parameters<ResponseResolver<MockedRequest, GraphQLContext<Record<string, unknown>>>>
  > = jest.fn()

  beforeAll(() => server.listen())

  beforeEach(() =>
    server.resetHandlers(
      graphql.query(
        "SampleQuery",
        mockResolver.mockClear().mockImplementation((_, res, ctx) =>
          res(
            ctx.data({
              __typename: "Query",
            }),
          ),
        ),
      ),
    ),
  )

  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it("should set value to HTTP Header", async () => {
    await toPromise(
      ApolloLink.execute(
        from([
          createSetContextLink("TEST VALUE"),
          new HttpLink({
            uri: "http://localhost/graphql",
            fetch,
          }),
        ]),
        {
          query: parse("query SampleQuery { __typename }"),
        },
      ),
    )
    expect(mockResolver.mock.lastCall?.[0].headers.get("X-Custom-Header")).toBe("TEST VALUE")
  })
})
