// Requirements
const discord = require('discord.js');
const settings = require('../settings.json');

exports.run = async(client, message, args) => {
    const amountOfMessages = parseInt(args.join(' '));
    const moderatorLog = client.channels.find('name', settings.logChannels.moderator);

    // Make sure to await the answers of these before reacting to it
    const messages = await message.channel.fetchMessages({
        limit : amountOfMessages
    });
    await message.channel.bulkDelete(messages);

    if(moderatorLog) {
        const embed = new discord.RichEmbed()
        .setTimestamp()
        .setColor(settings.messageColors.colorSuccess)
        .setTitle(`Event: Purge Messages`)
        .setDescription(`**__Moderator__**: <@${message.author.id}>\n\n**__Message__**: Successfully purged ${amountOfMessages} messages.`);
        moderatorLog.send(embed);
    }
};

exports.config = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permissionLevel: 2
};

exports.help = {
    name: 'purge',
    description: 'Tries to purge x amount of messages from a given channel.',
    usage: 'purge <amount of messages>'
};
