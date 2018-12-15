const Discord = require('discord.js');
const prompt = require('prompt');
const fs = require("fs");

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
        if (msg.content.indexOf(prefix) === 0 && msg.content.indexOf("ex") === prefix.length) {
            log("Command Received: ex");         
            
            try {
                await exportMessages(msg.channel);
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
        } else if (result.cmd.indexOf("ex") === 0) {
            const id = result.cmd.split(' ')[1];
            const channel = await client.channels.get(id);

            try {
                if (channel) {
                    await exportMessages(channel);
                } else {
                    const user = await client.users.get(id);
    
                    if (user) {
                        await exportMessages(user.dmChannel);
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

async function exportMessages(channel) {
    let flag = false;
    let before = "";
    let count = 0;
    let text = "";

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
                count++;

                log(`${count}: ${array[i].id} (${array[i].author.username}#${array[i].author.discriminator}) - ${array[i].content}`)

                text += `(${array[i].author.username}#${array[i].author.discriminator} - ${array[i].author.id}) {${array[i].id}} [${new Date(array[i].createdTimestamp).toDateString()} - ${new Date(array[i].createdTimestamp).toTimeString()}]\n ${array[i].content}\n`;

                if (array[i].embeds.length > 0) {
                    for (const embed of array[i].embeds) {
                        if (embed.image) {
                            text += `[IMAGE EMBED: ${embed.image.url}]\n`;
                        } else if (embed.thumbnail) {
                            text += `[IMAGE EMBED: ${embed.thumbnail.url}]\n`;
                        } else {
                            text += `[EMBED: ${embed.url}]\n`;
                        }
                    }
                }

                const attachments = array[i].attachments.array();
                if (attachments.length > 0) {
                    for (const attachment of attachments) {
                        text += `[ATTACHMENT: ${attachment.filename} (${attachment.url})]\n`;
                    }
                }

                text += '\n';

                before = array[i].id;
            } catch (error) {
                log(error)
            }
        }

        fs.writeFileSync(`./${channel.id}.log`, text);
    } while (flag);

    log(`Completed Exporting Messages\n Exported ${count} messages.`);
}
  
client.login("mfa.uqhDkR3JCXH46EOVpu99fABojYBZ8jRzLaoF3jgSMhlp35o6-lYfsiwE2m7oyTLEqN9_qrslcAv2Fx8hR1K3");
prompt.start();