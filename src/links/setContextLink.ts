import { setContext } from "@apollo/client/link/context"

export const createSetContextLink = (headerValue: string) =>
  setContext(() => ({
    headers: {
      "X-Custom-Header": headerValue,
    },
  }))
