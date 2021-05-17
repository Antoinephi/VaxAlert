require('dotenv').config()
const fetch = require('node-fetch');
const PushBullet = require('pushbullet/lib/pushbullet');
const open = require('open');

const apiKey = process.env.PUSH_BULLET_TOKEN;

if(apiKey === undefined) {
    throw new Error("Missing PushBullet token")
}

const delayDuration = process.env.REFRESH_DELAY;
const city = process.env.CITY;
const openBrowser = process.env.OPEN_BROWSER == 'true';

const pusher = new PushBullet(apiKey);

const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const notEligibleVaccineType = (types) => {
    if(!types) return false;
    return types.toString() === ['AstraZeneca'].toString()
}

void async function () {
    let slots = {};
    while (true) {
        const data = await fetch("https://vitemadose.gitlab.io/vitemadose/59.json");
        const { centres_disponibles }  = await data.json();

        console.log(`Checking ${centres_disponibles.length} results...`);
        centres_disponibles.filter(c => {
            if (!c.location || c.location.city !== city) {
                return false;
            }
            if (notEligibleVaccineType(c.vaccine_type)) {
                return false;
            }
            if(!c.appointment_schedules) {
                return false;
            }
            return true
        })
        .map(c => ({
            ...c,
            appointment_schedules: c.appointment_schedules.filter(a => a.name === 'chronodose')[0]
        }))
        .forEach(c => {
            if(c.appointment_schedules.total > 0 && !slots[c.nom]) {
                slots[c.nom] = new Date();
                console.log('Vaccin dispo !', `${c.nom} - ${c.url} - nb: ${c.appointment_schedules.total} - ${c.vaccine_type} - ${slots[c.nom]}`);
                pusher.note({}, 'Vaccin dispo !', `${c.nom} - nb: ${c.appointment_schedules.total} - ${c.url}`);
                if(openBrowser) {
                    open(c.url);
                }
            } else if(c.appointment_schedules.total === 0) {
                slots[c.nom] = null;
            }
        });
        await delay(delayDuration);
    }
}();
