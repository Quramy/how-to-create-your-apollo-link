import { gql as parse, Operation, FetchResult, Observable, toPromise, fromError, ServerError } from "@apollo/client"

import { simpleLink } from "./simpleLink"

describe(simpleLink, () => {
  describe("Unit testing", () => {
    const operation: Operation = {
      operationName: "TestQuery",
      query: parse("query TestQuery { __typename }"),
      variables: {},
      extensions: {},
      getContext: () => ({}),
      setContext: () => ({}),
    }

    describe("When following link generates successfully", () => {
      const forward = jest.fn(() =>
        Observable.of<FetchResult>({
          data: {
            __typename: "Query",
          },
        }),
      )

      beforeEach(() => {
        forward.mockClear()
      })

      it("should call the following link", () => {
        simpleLink(operation, forward)
        expect(forward).toBeCalledTimes(1)
        expect(forward).toBeCalledWith(operation)
      })

      it("should return fetch result", async () => {
        await expect(toPromise(simpleLink(operation, forward))).resolves.toStrictEqual({
          data: {
            __typename: "Query",
          },
        })
      })
    })

    describe("When following link ends with error", () => {
      const forward = jest.fn(() =>
        fromError<FetchResult>(new MyServerError(500, { message: "Internal Server Error" })),
      )

      beforeEach(() => {
        forward.mockClear()
      })

      it("should call the following link", () => {
        simpleLink(operation, forward)
        expect(forward).toBeCalledTimes(1)
        expect(forward).toBeCalledWith(operation)
      })

      it("should return fetch result", async () => {
        await expect(toPromise(simpleLink(operation, forward))).rejects.toMatchObject({
          statusCode: 500,
          result: {
            message: "Internal Server Error",
          },
        })
      })
    })
  })
})

class MyServerError extends Error implements ServerError {
  readonly response = {} as Response
  constructor(public readonly statusCode: number, public readonly result: any) {
    super()
  }
}
