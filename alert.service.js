const PushBullet = require('pushbullet/lib/pushbullet')

const MESSAGE_TITLE = 'Vaccin dispo !'

const newAlertingSystemInstance = (apiKey) => {
  const pusher = new PushBullet(apiKey)

  const alertAvailableCenter = (newSlots) =>
    Object.keys(newSlots).forEach((key) => {
      if (!newSlots[key]) {
        return
      }
      const { date, name, url, vaccineType, appointmentSchedules } = newSlots[key]
      console.log(MESSAGE_TITLE, `${name} - ${url} - nb: ${appointmentSchedules.total} - ${vaccineType} - ${date}`)
      pusher.note({}, MESSAGE_TITLE, `${name} - nb: ${appointmentSchedules.total} - ${url}`)
    })

  return { alertAvailableCenter }
}

module.exports = { newAlertingSystemInstance }
