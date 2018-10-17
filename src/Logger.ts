import * as winston from 'winston'

const Logger = winston.createLogger({
  format: winston.format.json(),
  level: process.env.LOG_LEVEL || 'silly',
  transports: [//
  // - Write to all logs with level `info` and below to `combined.log`
  // - Write all logs error (and below) to `error.log`.
  //
    new winston.transports.File({
      filename: 'error.log',
      level: 'error'
    }), new winston.transports.File({
      filename: 'combined.log'
    })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  Logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

export default Logger
