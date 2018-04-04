// Requirements
const discord = require('discord.js');
const settings = require('../settings.json');

module.exports = message => {
    // We don't want to listen to the bot, otherwise we could loop
    if(message.author.bot) return;

    const client = message.client;
    const botLog = client.channels.find('name', settings.logChannels.bot);

    // We need to make sure that not all actions are logged
    client.getPermissionLevel(message).then(permissionLevel => {
        if(permissionLevel < 2) {
            if(botLog) {
                const embed = new discord.RichEmbed()
                .setTimestamp()
                .setColor(settings.messageColors.colorWarning)
                .setTitle(`Event: User deleted a message`)
                .setDescription(`**__User__**: <@${message.author.id}>\n\n**__Message__**: ${message.content}`);
                botLog.send(embed);
            }
        }
    });
};
