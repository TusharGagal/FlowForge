import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
/**
 * Create a preconfigured TanStack Query Client for application use.
 *
 * The returned client sets query stale time to 30 seconds and configures dehydration
 * to include queries that either satisfy the default dehydrate predicate or whose
 * state status is `"pending"`.
 *
 * @returns A `QueryClient` instance with the described default options applied.
 */
import superjson from 'superjson'
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
}