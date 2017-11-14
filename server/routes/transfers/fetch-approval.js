let request = require('request-promise-native')

module.exports = () =>
  request('http://handy.travel/test/success.json')
    .then( res =>
      new Promise( resolve =>
        resolve(Boolean(JSON.parse(res).status == 'success'))
      )
    )