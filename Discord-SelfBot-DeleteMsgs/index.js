const Discord = require('discord.js');
const prompt = require('prompt');

const client = new Discord.Client();
const log = console.log;
const prefix = '!';
const schema = {
    properties: {
        cmd: {
            message: 'Enter Command',
            required: true
        }
    }
};

client.on('ready', () => {
    log(`-------------------------- DISCORD CONNECTED --------------------------`);
    log(`~ Name: ${client.user.username}#${client.user.discriminator}`);
    log(`~ Email: ${client.user.email}`);
    log(`~ UID: ${client.user.tag}`);
    log(`-----------------------------------------------------------------------`);

    interact();
});
  
client.on('message', async msg => {
    if (msg.author.id === client.user.id) {
        if (msg.content.indexOf(prefix) === 0 && msg.content.indexOf("cl") === prefix.length) {
            log("Command Received: cl");         
            
            try {
                await deleteMessages(msg.channel);
            } catch (error) {
                log(error);
            }
        }
    }
});

function interact() {
    prompt.get(schema, async (err, result) => {
        if (result.cmd === 'exit') {
            process.exit();
        } else if (result.cmd.indexOf("cl") === 0) {
            const id = result.cmd.split(' ')[1];
            const channel = await client.channels.get(id);

            try {
                if (channel) {
                    await deleteMessages(channel);
                } else {
                    const user = await client.users.get(id);
    
                    if (user) {
                        await deleteMessages(user.dmChannel);
                    } else {
                        log(`No channel with ID: ${id}`);
                    }
                }   
                interact();
            } catch (error) {         
                log(error);
            }
        }
    });
}

async function deleteMessages(channel) {
    let flag = false;
    let before = "";
    let count = 0;
    let mCount = 0;

    do {
        if (before === "") {
            options = {
                limit: 99
            }
        } else {
            options = {
                limit: 99,
                before
            }

            before = "";
        }

        log(`Reading Messages: ${JSON.stringify(options)}`)
        const messages = await channel.fetchMessages(options);
        const array = messages.array();

        flag = false;
        if (array.length > 0) flag = true;

        for (let i in array) {
            try {
                mCount++;
                log(`${mCount}: ${array[i].id} (${array[i].author.username}#${array[i].author.discriminator}) - ${array[i].content}`)

                if (array[i].author.id === client.user.id) {
                    await array[i].delete();
                    count++;
                    log(`Deleted Message: ${array[i].id} - Count ${count}`);
                } else {
                    before = array[i].id;
                }
            } catch (error) {
                log(error)
            }
        }
    } while (flag);

    log(`Completed Deleting Messages Deleted ${count} messages`);
}
  
client.login("<TOKEN>");
prompt.start();