const { send } = require('micro')
const { extract } = require('@grodno-city/grodno-gov-renting-scraper')

const CACHE_LIFETIME = 60 * 60 * 1000 // one hour

const inMemoryCache = {
  cache: null,
  lastCacheUpdate: null // Date.now() timestamp
}

const isCacheActual = () => {
  const { cache, lastCacheUpdate } = inMemoryCache

  if (!cache || !lastCacheUpdate) {
    return false
  }

  const nowUnixTime = Date.now()
  return (nowUnixTime - lastCacheUpdate < CACHE_LIFETIME)
}

const doRequest = async () => {
  const extractedOpenData = await extract()
  inMemoryCache.cache = extractedOpenData
  inMemoryCache.lastCacheUpdate = Date.now()
  return extractedOpenData
}

module.exports = async (req, res) => {
  try {
    const result = isCacheActual() ? inMemoryCache.cache : await doRequest()
    return result
  } catch (error) {
    console.error(error)
    send(500, {
      message: 'Request open data error'
    })
  }
}
