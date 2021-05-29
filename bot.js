const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const voice_commands = require('./voice-commands.json');
const { MessageAttachment } = require('discord.js');
const fs = require('fs');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    // Join the same voice channel of the author of the message
    if (message.content.toLowerCase() in voice_commands) {
        if (message.member.voice.channel) {
            const connection = message.member.voice.channel.join().then((connection) => {
                command = message.content;
                audio = voice_commands[command].audio;
                picture = voice_commands[command].picture;

                const dispatcher = connection.play(audio, { volume: 0.5 });
                let start = 0;
                let end = 0;

                dispatcher.on('start', () => {
                    start = new Date();
                    start = start.getTime();
                    console.log("Playing");
                });

                dispatcher.on('debug', (info) => {
                    console.log("Debug: " + info);
                });

                dispatcher.on('finish', () => {
                    console.log("Finished");
                    end = new Date();
                    end = end.getTime();
                    console.log("Playtime: " + (end - start) + "ms");
                    connection.disconnect();
                });

                dispatcher.on('error', console.error);

                if (picture) {
                    //Check if picture file exists
                    fs.access(picture, fs.constants.R_OK, (err) => {
                        if (err) {
                            console.log(`${file} ${err ? 'is not readable' : 'is readable'}`);
                        }
                        else {
                            // Send the attachment in the message channel with a content
                            const attachment = new MessageAttachment(picture);
                            message.channel.send(attachment);
                        }
                    });
                }
            });
        }
        else {
            message.channel.send("Please join a voice channel.");
        }
    }
    else if (message.content == '!help') {
        let text = 'The list of available commands. Pre-pend with an \'!\' to run the command. !{command}:';
        text += "\n";
        text += "help";
        for (command in voice_commands) {
            text += "\n";
            commandWithoutExclamationMark = command.substr(Math.max(0, command.indexOf('!') + 1), command.length);
            text += commandWithoutExclamationMark
        }
        message.channel.send(text);
    }

});


client.login(auth.token)
    .catch(console.error);