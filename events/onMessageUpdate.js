// Requirements
const discord = require('discord.js');
const settings = require('../settings.json');

module.exports = (oldMessage, newMessage) => {
    // We don't want to listen to the bot, otherwise we could loop
    if(oldMessage.author.bot) return;
    const client = oldMessage.client;

    // We need to make sure that not all actions are logged
    client.getPermissionLevel(oldMessage).then(permissionLevel => {
        if(permissionLevel < 2) {
            const botLog = client.channels.find('name', settings.logChannels.bot);
            if(botLog) {
                const embed = new discord.RichEmbed()
                .setTimestamp()
                .setColor(settings.messageColors.colorWarning)
                .setTitle(`Event: User edited a message`)
                .setDescription(`**__User__**: <@${oldMessage.author.id}>\n\n**__Old Message__**: ${oldMessage.content}\n**__New Message__**: ${newMessage.content}`);
                botLog.send(embed);
            }
        }
    });
};
