const app = require('./app') // The Express app
const config = require('./utils/config')
const logger = require('./utils/logger')

app.listen(process.env.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`)
})