const Discord = require('discord.js');
const GameDig = require('gamedig');

const config = require('./config.json');

const client = new Discord.Client();
const log = console.log;

(async () => { 
    await client.login(config.token);
    
    const channel = await client.guilds.get(config.guild).channels.get(config.channel);
    const servers = config.servers;

    if (!channel) {
        Shutdown(`Channel ${config.channel} not found in guild ${config.guild}`);
    }

    servers.forEach(async (server) => {
        const msg = await channel.fetchMessage(server.id);

        log(`Setting up handler for ${msg.id} - ${server.ip}:${server.port}`);

        handleMessage(msg, server);
    });
})();

client.on('message', async (message) => {
    if (message.content === `${config.prefix}status`) {
        const reply = await message.channel.send('', { embed: {
            color: 3447003,
            description: `Copy this message's ID to your config.json file under servers`
        }})

        reply.edit('', { embed: {
            color: 3447003,
            description: `Copy this message's ID to your config.json file under servers: ${reply.id}`
        }});
    }
});

function handleMessage(message, info) {
    setInterval(async () => {
        try {
            const server = await queryServer(info.ip, info.port, info.type);
            const embed = getEmbed(server);

            message.edit("", { embed });
        } catch (err) {
            log(`Error getting info for ${info.ip}:${info.port}: ${err}`);
            
            return;
        }
    }, config.interval);
}

function getEmbed(server) {
    const players = getPlayerDetails(server);
    const ip = `${server.query.address}:${server.query.port}`;
    const joinLink = ("steam://connect/" + ip);
    const embed = {
        color: 3447003,
        title: server.name,
        url: config.url,
        description: "Server Info",
        fields: [
            {
                name: 'Game',
                value: server.raw.game,
                inline: true
            },
            {
                name: 'Players',
                value: server.players.length + " / " + server.maxplayers,
                inline: true
            },
            {
                name: 'Map',
                value: server.map,
                inline: true
            },
            {
                name: 'IP',
                value: '[' + ip + '](' + joinLink + ')',
                inline: false
            },
            {
                name: "Player",
                value: players.names,
                inline: true
            },
            {
                name: "Score",
                value: players.scores,
                inline: true
            }
        ],
        timestamp: new Date(),
        footer: {
            icon_url: null,
            text: 'ServerStatus'
        }
    }

    return embed;
}

function getPlayerDetails(server) {
    var players = {
        names: "",
        scores: ""
    }

    if (server.players.length != 0) {
        server.players = server.players.sort(sortBy("score"));
        for (var i in server.players) {
            players.names = players.names + server.players[i].name + "\n";
            players.scores = players.scores + server.players[i].score + "\n";
        }
    } else {
        players.names = "No players";
        players.scores = '0';
    }

    return players;
}

async function queryServer(ip, port, type) {
    return new Promise((resolve, reject) => {
        GameDig.query({
            type,
            host: ip,
            port: parseInt(port)
        }, (info) => {
            if (info.error) {
                reject("Server is either offline or unable to get info");
            }

            resolve(info);
        })
    });
}

function sortBy(prop) {
    return function (a, b) {
        if (a[prop] < b[prop]) {
            return 1;
        } else if (a[prop] > b[prop]) {
            return -1;
        }
        return 0;
    }
}

function Shutdown(info) {
    log(`${info}`);

    process.exit();
}
