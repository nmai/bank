# bank api

1. Install dependencies with `npm install`
2. Requires MongoDB. Start mongod (if it isn't already running)
3. Start this API server with `npm start`
4. Run the tests with `npm test`. Note the tests require the server to be already running, so launch the test process in a separate terminal window/tab.

API endpoints:
  - `/api/accounts/open/` (POST)
  - `/api/accounts/close` (DELETE)
  - `/api/accounts/account_status` (GET)
  - `/api/accounts/deposit` (PUT)
  - `/api/accounts/withdraw` (PUT)
  - `/api/transfers/submit_transfer` (POST)

Runs on port 3000 by default.

### TODO:
Unit tests... I have written integration tests, but while the coverage is OK for a codebase of this scale (tiny!) I would be worried about continuing development without adding unit tests. Luckily, because the code is small and the functionality so basic (the ratio of functions to endpoints is quite low), the integration test suite will catch the majority of basic errors. I have set up the route handlers to be unit testable, but I could split some of the functions into separate, more thoroughly testable chunks of code.
