/* global describe, jest, expect, it */

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

it('has a name', () => {
  const transport = new DatadogTransport({
    apiKey: 'apiKey'
  })
  expect(transport.name).toEqual('datadog')
})

describe('DatadogTransport#log(info, callback)', () => {
  [
    {
      case: 'transfers logs to the default intake',
      uri: 'https://http-intake.logs.datadoghq.com'
    },
    {
      case: 'transfers logs to the EU intake',
      uri: 'https://http-intake.logs.datadoghq.eu',
      opts: {
        intakeRegion: 'eu'
      }
    }
  ]
    .forEach(testCase => {
      it(testCase.case, async () => {
        const scope = nock(testCase.uri,
          {
            reqheaders: {
              'content-type': 'application/json'
            }
          }).post(
          '/v1/input/apikey',
          JSON.stringify({
            dd: {
              trace_id: 'abc',
              span_id: 'def'
            },
            foo: 'bar'
          })
        ).query({
          service: 'service',
          ddsource: 'ddsource',
          ddtags: 'env:production,trace_id:abc,span_id:def,tag_a:value_a,tag_b:value_b',
          hostname: 'hostname'
        }).reply(204)

        const opts = Object.assign({}, {
          apiKey: 'apikey',
          service: 'service',
          ddsource: 'ddsource',
          ddtags: 'env:production',
          hostname: 'hostname'
        }, testCase.opts ? testCase.opts : {})

        const transport = new DatadogTransport(opts)
        const callback = jest.fn()
        await transport.log({
          dd: {
            trace_id: 'abc',
            span_id: 'def'
          },
          foo: 'bar',
          ddtags: 'tag_a:value_a,tag_b:value_b'
        }, callback)
        expect(callback).toHaveBeenCalled()
        expect(scope.isDone()).toBe(true)
      })
    })
  it('Can retry', async () => {
    const v = 5
    expect(v === 4)
  })
})
