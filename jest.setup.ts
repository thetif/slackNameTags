import "cross-fetch/polyfill";
import { server } from "./src/mocks/server";
// Establish API mocking before all tests.
beforeAll(() => {
  console.log("starting MSW listener");
  server.listen({
    onUnhandledRequest: "error",
  });
  // server.printHandlers();
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());
// Clean up after the tests are finished.
afterAll(() => server.close());
