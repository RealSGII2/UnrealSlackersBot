// Requirements
const discord = require('discord.js');
const settings = require('../../settings.json');

exports.run = async(client, message) => {
    const botLog = client.channels.find('name', settings.logChannels.bot);
    if(botLog) {
        const embed = new discord.RichEmbed()
        .setTimestamp()
        .setColor(settings.messageColors.colorSuccess)
        .setTitle(`Event: Ping`)
        .setDescription(`**__Moderator__**: <@${message.author.id}>\n` +
            `**__Message__**: Pong!`);
        botLog.send(embed);
    }
};

exports.config = {
    enabled: true,
    guildOnly: false,
    category: 'bot',
    aliases: [],
    permissionLevel: 2
};

exports.help = {
    name: 'ping',
    description: 'Pings the bot.',
    usage: 'ping'
};
