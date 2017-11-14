#bank api

Requires MongoDB. Start mongod (if it isn't already running), then start this server with `npm start`

Run the tests with `npm test`. Note the tests require the server to be already running, so launch the test process in a separate terminal window/tab.

API endpoints:
`/api/accounts/open/` (POST)
`/api/accounts/close` (DELETE)
`/api/accounts/account_status` (GET)
`/api/accounts/deposit` (PUT)
`/api/accounts/withdraw` (PUT)
`/api/transfers/submit_transfer` (POST)

Runs on port 3000 by default.
