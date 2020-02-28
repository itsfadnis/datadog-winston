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
      ddtags: 'env:production,trace_id:abc,span_id:def,tag_a:value_a,tag_b:value_b',
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
      dd: {
        trace_id: 'abc',
        span_id: 'def'
      },
      foo: 'bar',
      ddtags: 'tag_a:value_a,tag_b:value_b'
    }, callback)
    expect(scope.isDone()).toBe(true)
    expect(callback).toHaveBeenCalled()
  })
})
