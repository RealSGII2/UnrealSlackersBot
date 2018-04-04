// Requirements
const discord = require('discord.js');
const settings = require('../settings.json');
const app = require('../app.js');

exports.run = (client, message, args) => {
    const botLog = client.channels.find('name', settings.logChannels.bot);

    // Search the command via command and aliases
    let command;
    if (client.commands.has(args[0])) {
        command = args[0];
    }
    else if (client.aliases.has(args[0])) {
        command = client.aliases.get(args[0]);
    }
    // If not found, notify the bog log
    if (!command) {
        if(botLog) {
            const embed = new discord.RichEmbed()
            .setTimestamp()
            .setColor(settings.messageColors.colorError)
            .setTitle(`Event: Reload Command`)
            .setDescription(`**__Moderator__**: <@${message.author.id}>\n\n` +
                            `**__Message__**: Couldn't find the command [${settings.serverSettings.commandPrefix}${args[0]}].`);
            botLog.send(embed);
        }
    } else { // If found, tell the client to reload the commandfile
        app.reload(message, command).then(() => {
            if(botLog) {
                const embed = new discord.RichEmbed()
                .setTimestamp()
                .setColor(settings.messageColors.colorSuccess)
                .setTitle(`Event: Reload Command`)
                .setDescription(`**__Moderator__**: <@${message.author.id}>\n\n` +
                                `**__Message__**: Successfully reloaded command [${settings.serverSettings.commandPrefix}${command}].`);
                botLog.send(embed);
            }
        }).catch(error => {
            if(botLog) {
                const embed = new discord.RichEmbed()
                .setTimestamp()
                .setColor(settings.messageColors.colorError)
                .setTitle(`Event: Reload Command`)
                .setDescription(`**__Moderator__**: <@${message.author.id}>\n\n**__Message__**: Failed to reload command [${command}].`);
                botLog.send(embed);
            }
        });
    }
};

exports.config = {
    enabled: true,
    guildOnly: false,
    aliases: ['r'],
    permissionLevel: 2
};

exports.help = {
    name: 'reload',
    description: 'Tries to reload the file of the specified command. Can be used in case the file got updated or modified.',
    usage: 'reload <commandname>'
};
