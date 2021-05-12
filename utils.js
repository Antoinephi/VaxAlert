// Utils
const getArgs = (process) => {
  if (process.argv.length < 3 || process.argv.length === 4) {
    console.error(`Error : Missing argument
        Usage : node index.js <pushbullet API key> <delay> <city>
        `)

    process.exit(1)
  }
  return process.argv
}
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

module.exports = {
  delay,
  getArgs,
}
