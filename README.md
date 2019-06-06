[![Build Status](https://semaphoreci.com/api/v1/itsfadnis/datadog-winston/branches/master/badge.svg)](https://semaphoreci.com/itsfadnis/datadog-winston)

# datadog-winston
Ship winston logs to datadog without breaking a sweat

## Options
- **apiKey**: Your datadog api key *[required]*
- **hostname**: The machine/server hostname
- **service**: The name of the application or service generating the logs
- **ddsource**: The technology from which the logs originated
- **ddtags**: Metadata assoicated with the logs

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
    ddsource: 'node.js',
    ddtags: 'foo:bar,boo:baz'
  })
)
```
