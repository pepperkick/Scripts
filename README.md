A simple script to show game server status in discord.

## Config

`config.json` file is required. Create it with following content if missing.

```
{
    "prefix": "!",                      // Prefix for bot commands (Ex: !status)
    "token": "",                        // Bot token used to login
    "guild": "",                        // Guild ID where the messages are
    "channel": "",                      // Channel ID where the messages are
    "interval": 300000                  // Interval of server query in ms
    "url": "",                          // URL which is opened when user clicks on title (Ex: http://google.com) NOTE: Must contain `http://` or `https://`
    "servers": [                        // Collection of game servers
        {
            "id": "",                   // ID of message
            "ip": "",                   // IP of game server to monitor
            "port": 0,                  // Port of game server to monitor
            "type": "tf2"               // Type of game server to monitor
        }
    ]
}
```

List of game server types
https://github.com/sonicsnes/node-gamedig#readme

## Install

```
npm install
npm start
```

## Commands

- status: Makes the bot send a message whose ID you can use to configure.
