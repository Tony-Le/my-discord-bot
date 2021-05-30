const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const voice_commands = require('./voice-commands.json');
const { MessageAttachment } = require('discord.js');
const fs = require('fs');

const prefix = '%'

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user
      .setActivity(prefix + "help", { type: "PLAYING" })
      .then((presence) =>
        console.log(`Activity set to ${presence.activities[0].name}`)
      )
      .catch(console.error);
});

client.on('message', message => {
    // Join the same voice channel of the author of the message
    console.log('message detected');
    const command = message.content;
    const commandWithoutPrefix = command.substr(
      Math.max(0, command.indexOf(prefix) + 1),
      command.length
    );
    console.log(command);
    console.log(commandWithoutPrefix);
    if (commandWithoutPrefix in voice_commands) {
      if (message.member.voice.channel) {
        const connection = message.member.voice.channel
          .join()
          .then((connection) => {
            const audio = voice_commands[commandWithoutPrefix].audio;
            const picture = voice_commands[commandWithoutPrefix].picture;

            const dispatcher = connection.play(audio, { volume: 0.5 });
            let start = 0;
            let end = 0;

            dispatcher.on("start", () => {
              start = new Date();
              start = start.getTime();
              console.log("Playing");
            });

            dispatcher.on("debug", (info) => {
              console.log("Debug: " + info);
            });

            dispatcher.on("finish", () => {
              console.log("Finished");
              end = new Date();
              end = end.getTime();
              console.log("Playtime: " + (end - start) + "ms");
              connection.disconnect();
            });

            dispatcher.on("error", console.error);

            if (picture) {
              //Check if picture file exists
              fs.access(picture, fs.constants.R_OK, (err) => {
                if (err) {
                  console.log(
                    `${file} ${err ? "is not readable" : "is readable"}`
                  );
                } else {
                  // Send the attachment in the message channel with a content
                  const attachment = new MessageAttachment(picture);
                  message.channel.send(attachment);
                }
              });
            }
          });
      } else {
        message.channel.send("Please join a voice channel.");
      }
    } else if (message.content == prefix + "help") {
      let text =
        "The list of available commands. Pre-pend with an '" +
        prefix +
        "' to run the command. " +
        prefix +
        "{command}:";
      text += "\n";
      text += "help";
      for (let command in voice_commands) {
        text += "\n";
        text += command;
      }
      message.channel.send(text);
    }

});


client.login(auth.token)
    .catch(console.error);