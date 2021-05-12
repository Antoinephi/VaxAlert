const fetch = require('node-fetch');
const PushBullet = require('pushbullet/lib/pushbullet');

const apiKey = process.argv[2];
const delayDuration = process.argv[3] || 60000;
const city = process.argv[4] || 'Lille';
if(process.argv.length < 2 || process.argv.length === 4) {
    throw Error('Missing argument: node index.js <pushbullet API key> <delay> <city>')
}

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
                        slots[c.nom] = new Date()
                        console.log('Vaccin dispo !', `${c.nom} - ${c.url} - nb: ${c.appointment_schedules.total} - ${c.vaccine_type} - ${slots[c.nom]}`);
                        pusher.note({}, 'Vaccin dispo !', `${c.nom} - nb: ${c.appointment_schedules.total} - ${c.url}`)
                    } else if(c.appointment_schedules.total === 0) {
                        slots[c.nom] = null                        
                    }
                });
                await delay(delayDuration)
    }
}();