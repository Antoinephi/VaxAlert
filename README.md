run command
```
node index.js <pushbullet API key> <delay> <city>
```

- API Key to your own pushbullet account is required to recieive notifications
- delay is in ms
- city must be a city from the Nord as it queries only those centers for now (or you have to manualy change the api url)


If you want to run the script on a distant host in background like a raspberry pi you can easily use **nohup**
```
nohup node index.js my-api-key 60000 Lille > output.log &!
```
