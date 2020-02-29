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
    this.opts = opts
    // https://docs.datadoghq.com/api/?lang=python#send-logs-over-http
    this.api = `https://http-intake.logs.datadoghq.com/v1/input/${opts.apiKey}`
  }

  async log (info, callback) {
    setImmediate(() => {
      this.emit('logged', info)
    })

    const query = [
      'service',
      'ddsource',
      'ddtags',
      'hostname'
    ].reduce((a, b) => {
      if (this.opts.hasOwnProperty(b)) {
        a[b] = this.opts[b]
      }
      return a
    }, {})

    const { ddtags, ...logs } = info

    const append = (string) => {
      if (query.ddtags) {
        query.ddtags += `,${string}`
      } else {
        query.ddtags = string
      }
    }

    info.dd && append(`trace_id:${info.dd.trace_id},span_id:${info.dd.span_id}`)
    ddtags && append(ddtags)

    const queryString = querystring.encode(query)
    const api = querystring ? `${this.api}?${queryString}` : this.api

    // Perform the writing to the remote service
    await fetch(api, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(logs)
    })
    callback()
  }
}
