const { newAlertingSystemInstance } = require('./alert.service')
const { newCenterServiceInstance } = require('./center.service')
const { delay, getArgs } = require('./utils')

// Consts
const DEFAULT_DELAY_DURATION = 60000
const DEFAULT_CITY = 'Lille'

void (async function main() {
  const [, , apiKey, delayDuration = DEFAULT_DELAY_DURATION, city = DEFAULT_CITY] = getArgs(process)
  const alertService = newAlertingSystemInstance(apiKey)
  const centerService = newCenterServiceInstance()

  while (true) {
    const newSlots = await centerService.findAvailableAppointmentSchedules(city)
    alertService.alertAvailableCenter(newSlots)
    await delay(delayDuration)
  }
})()
