const fetch = require('node-fetch')

const VACCINE_API_URL = 'https://vitemadose.gitlab.io/vitemadose/59.json'
const VACCINE_NAME = 'AstraZeneca'
const APPOINTMENT_SCHEDULE_NAME = 'chronodose'

const fetchAvailableCenters = async () => {
  const data = await fetch(VACCINE_API_URL)
  const json = await data.json()
  return json.centres_disponibles
}

const hasNewSlots = ({ total }, slots, name) => total > 0 && !slots[name]
const haslEigibleVaccineType = ({ vaccine_type }) =>
  vaccine_type && vaccine_type.toString() === [VACCINE_NAME].toString()
const isMatchingCity = ({ location }, city) => location && location.city === city
const isValidAvailableCenter = (center, city) =>
  isMatchingCity(center, city) && haslEigibleVaccineType(center) && center.appointment_schedules !== undefined

const isMatchingChronodoseName = ({ name }) => name === APPOINTMENT_SCHEDULE_NAME
const toChronodoseAppointmentSchedule = ({ nom, url, appointment_schedules, vaccine_type }) => ({
  name: nom,
  url: url,
  vaccineType: vaccine_type,
  appointmentSchedules: appointment_schedules.filter(isMatchingChronodoseName)[0],
})

const getAvailableAppointmentScheduleCenterList = (availableCenterList, city) =>
  availableCenterList.reduce((availableAppointmentSchedulesCenterList, availableCenter) => {
    if (isValidAvailableCenter(availableCenter, city)) {
      availableAppointmentSchedulesCenterList.push(toChronodoseAppointmentSchedule(availableCenter))
    }
    return availableAppointmentSchedulesCenterList
  }, [])

const findNewSlots = (availableAppointmentSchedulesCenterList, slots) =>
  availableAppointmentSchedulesCenterList.reduce(
    (slots, { name, url, vaccineType, appointmentSchedules }) => ({
      ...slots,
      [name]: hasNewSlots(appointmentSchedules, slots, name)
        ? {
            date: new Date(),
            name,
            url,
            vaccineType,
            appointmentSchedules,
          }
        : null,
    }),
    slots,
  )

const newCenterServiceInstance = () => {
  let slots = {}

  return {
    findAvailableAppointmentSchedules: async (city) => {
      const availableCentersList = await fetchAvailableCenters()
      const availableAppointmentScheduleList = getAvailableAppointmentScheduleCenterList(availableCentersList, city)
      return findNewSlots(availableAppointmentScheduleList, slots)
    },
  }
}

module.exports = {
  newCenterServiceInstance,
  fetchAvailableCenters,
  hasNewSlots,
  haslEigibleVaccineType,
  isMatchingCity,
  isValidAvailableCenter,
  isMatchingChronodoseName,
  toChronodoseAppointmentSchedule,
  getAvailableAppointmentScheduleCenterList,
  findNewSlots,
}
