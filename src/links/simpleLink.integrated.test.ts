import fetch from "cross-fetch"
import { gql as parse, ApolloLink, HttpLink, from, toPromise } from "@apollo/client"
import { graphql, rest } from "msw"
import { setupServer } from "msw/node"
import { simpleLink } from "./simpleLink"

describe(simpleLink, () => {
  describe("Integrated testing", () => {
    const subjectLink = from([
      simpleLink,
      new HttpLink({
        uri: "http://localhost/graphql",
        fetch,
      }),
    ])

    const server = setupServer()

    beforeAll(() => server.listen())
    afterEach(() => server.resetHandlers())
    afterAll(() => server.close())

    describe("When server responds GraphQL response", () => {
      beforeEach(() => {
        const sampleQueryHandler = graphql.query("SampleQuery", (_, res, ctx) =>
          res(
            ctx.data({
              __typename: "Query",
            }),
          ),
        )
        server.resetHandlers(...[sampleQueryHandler])
      })

      it("should resolve GraphQL data", async () => {
        await expect(
          toPromise(
            ApolloLink.execute(subjectLink, {
              query: parse("query SampleQuery { __typename }"),
            }),
          ),
        ).resolves.toMatchObject({
          data: {
            __typename: "Query",
          },
        })
      })
    })

    describe("When server responds Network error (ServerError)", () => {
      beforeEach(() => {
        server.resetHandlers(
          rest.post("http://localhost/graphql", (_, res, ctx) =>
            res(ctx.status(500), ctx.json({ message: "Internal Server Error" })),
          ),
        )
      })

      it("should reject ServerError", async () => {
        await expect(
          toPromise(
            ApolloLink.execute(subjectLink, {
              query: parse("query SampleQuery { __typename }"),
            }),
          ),
        ).rejects.toMatchObject({
          result: {
            message: "Internal Server Error",
          },
          statusCode: 500,
        })
      })
    })

    describe("When server responds Network error (ServerParseError)", () => {
      beforeEach(() => {
        server.resetHandlers(
          rest.post("http://localhost/graphql", (_, res, ctx) => res(ctx.status(502), ctx.text("Service Unavailable"))),
        )
      })

      it("should reject ServerParseError", async () => {
        await expect(
          toPromise(
            ApolloLink.execute(subjectLink, {
              query: parse("query SampleQuery { __typename }"),
            }),
          ),
        ).rejects.toMatchObject({
          statusCode: 502,
          bodyText: "Service Unavailable",
        })
      })
    })
  })
})
