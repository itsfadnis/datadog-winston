[![Build Status](https://semaphoreci.com/api/v1/itsfadnis/datadog-winston/branches/master/badge.svg)](https://semaphoreci.com/itsfadnis/datadog-winston)

# datadog-winston
Ship winston logs to datadog without breaking a sweat

## Install
```console
$ npm install --save datadog-winston
```
or
```console
$ yarn add datadog-winston
```

## Options
- **apiKey**: Your datadog api key or client token *[required]*
- **hostname**: The machine/server hostname
- **service**: The name of the application or service generating the logs
- **ddsource**: The technology from which the logs originated
- **ddtags**: Metadata assoicated with the logs
- **intakeRegion**: The datadog intake to use. set to `eu` to force logs to be sent to the EU specific intake

## Usage
```javascript
var winston = require('winston')
var DatadogWinston = require('datadog-winston')

var logger = winston.createLogger({
  // Whatever options you need
  // Refer https://github.com/winstonjs/winston#creating-your-own-logger
})

logger.add(
  new DatadogWinston({
    apiKey: 'super_secret_datadog_api_key',
    hostname: 'my_machine',
    service: 'super_service',
    ddsource: 'nodejs',
    ddtags: 'foo:bar,boo:baz'
  })
)
```
