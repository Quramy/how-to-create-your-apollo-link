import { Operation, Observable, FetchResult } from "@apollo/client"

export const simpleLink = (operation: Operation, forward: (operation: Operation) => Observable<FetchResult>) =>
  forward(operation)
