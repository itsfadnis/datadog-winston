const Transport = require('winston-transport')
const querystring = require('querystring')
const fetch = require('node-fetch')

//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
module.exports = class DatadogTransport extends Transport {
  constructor (opts = {}) {
    super(opts)

    //
    // Consume any custom options here. e.g.:
    // - Connection information for databases
    // - Authentication information for APIs (e.g. loggly, papertrail,
    //   logentries, etc.).
    //
    if (!opts.apiKey) {
      throw new Error('Missing required option: `apiKey`')
    }

    // https://docs.datadoghq.com/api/?lang=python#send-logs-over-http
    const api = `https://http-intake.logs.datadoghq.com/v1/input${opts.apiKey}`

    const query = [
      'service',
      'ddsource',
      'ddtags',
      'hostname'
    ].reduce((a, b) => {
      if (opts.hasOwnProperty(b)) {
        a[b] = opts[b]
      }
      return a
    }, {})

    const queryString = querystring.encode(query)

    this.api = queryString ? `${api}?${queryString}` : api
  }

  async log (info, callback) {
    setImmediate(() => {
      this.emit('logged', info)
    })

    // Perform the writing to the remote service
    await fetch(this.api, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(info)
    })
    callback()
  }
}
