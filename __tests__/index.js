/* global describe, beforeEach, afterEach, jest, expect, it */

const Transport = require('winston-transport')
const DatadogTransport = require('../lib')
const nock = require('nock')

it('extends winston transport', () => {
  expect(DatadogTransport.prototype).toBeInstanceOf(Transport)
})

it('throws an error if api key isn\'t passed in', () => {
  try {
    // eslint-disable-next-line
    new DatadogTransport()
  } catch (e) {
    expect(e.message).toBe('Missing required option: `apiKey`')
  }
})

describe('DatadogTransport#log(info, callback)', () => {
  let scope

  beforeEach(() => {
    scope = nock('https://http-intake.logs.datadoghq.com', {
      reqheaders: {
        'content-type': 'application/json'
      }
    })

    scope.post(
      '/v1/input/apikey',
      JSON.stringify({
        foo: 'bar'
      })
    ).query({
      service: 'service',
      ddsource: 'ddsource',
      ddtags: 'env:production,trace_id:123,span_id:456',
      hostname: 'hostname'
    }).reply(204)
  })

  afterEach(() => {
    nock.restore()
  })

  it('transports logs to datadog', async () => {
    const transport = new DatadogTransport({
      apiKey: 'apikey',
      service: 'service',
      ddsource: 'ddsource',
      ddtags: 'env:production',
      hostname: 'hostname'
    })
    const callback = jest.fn()
    await transport.log({
      foo: 'bar',
      ddtags: 'trace_id:123,span_id:456'
    }, callback)
    expect(scope.isDone()).toBe(true)
    expect(callback).toHaveBeenCalled()
  })
})
