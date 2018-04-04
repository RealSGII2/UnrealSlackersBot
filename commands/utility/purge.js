// Requirements
const discord = require('discord.js');
const settings = require('../../settings.json');

exports.run = async(client, message, args) => {
    const amountOfMessages = parseInt(args.join(' '));
    const finalAmountOfMessage = Math.min(100, amountOfMessages);
    const moderatorLog = client.channels.find('name', settings.logChannels.moderator);

    message.channel.bulkDelete(finalAmountOfMessage).then(messages => {
        if(moderatorLog) {
            const embed = new discord.RichEmbed()
            .setTimestamp()
            .setColor(settings.messageColors.colorSuccess)
            .setTitle(`Event: Purge Messages`)
            .setDescription(`**__Moderator__**: <@${message.author.id}>\n` +
                `**__Message__**: Successfully purged ${messages.size} messages.`);
            moderatorLog.send(embed);
        }
    }).catch(console.error);
};

exports.config = {
    enabled: true,
    guildOnly: false,
    category: 'utility',
    aliases: [],
    permissionLevel: 2
};

exports.help = {
    name: 'purge',
    description: 'Tries to purge x amount of messages from a given channel.',
    usage: 'purge <amount of messages>\n\n' +
        '<amount of messages>: Amount of messages you want to purge (limit 100).'
};
