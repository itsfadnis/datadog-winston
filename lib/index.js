const Transport = require('winston-transport')
const querystring = require('querystring')
const fetch = require('node-fetch')

/**
 * Class for sending logging information to Datadog's HTTPS intakes
 * @extends Transport
 */
module.exports = class DatadogTransport extends Transport {
  /**
   * Constructor for the Datadog Transport responsible for making
   * HTTP requests whenever log messages are received
   * @param {!Object} opts Transport options
   * @param {string} opts.apiKey The Datadog API key or Client token
   * @param {string} [intakeRegion] The intake region to be used
   */
  constructor (opts = {}) {
    super(opts)

    if (!opts.apiKey) {
      throw new Error('Missing required option: `apiKey`')
    }
    this.opts = opts

    const tld = opts.intakeRegion === 'eu' ? 'eu' : 'com'
    const subdomain = opts.apiKey.startsWith('pub') ? 'browser-http-intake' : 'http-intake'
    this.api = `https://${subdomain}.logs.datadoghq.${tld}/v1/input/${opts.apiKey}`
  }

  /**
   * Expose the name of the Transport
   */
  get name () {
    return 'datadog'
  }

  /**
   * Core logging method exposed to Winston
   * @param {!Object} info Information to be logged
   * @param {function} callback Continuation to respond when complete
   */
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

    try {
      // Perform the writing to the remote service
      await fetch(api, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(logs)
      })
    } catch (err) {
    } finally {
      callback()
    }
  }
}
