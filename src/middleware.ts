// Next.js requires this file to be named `middleware.ts` at src/.
// The implementation lives in proxy.ts to keep it testable in isolation.
export { proxy as middleware, config } from "./proxy";
