// Requirements
const embedSender = require('../../utilities/embedSender.js');

exports.run = async(client, message, args) => {
    if(args.length != 1) {
        embedSender.sendMessageToUser(message, 'Purge Messages', 'Please specify the number of messages you wish to remove.\nE.g.: "~purge 42".');
        return;
    }
    const amountOfMessages = parseInt(args.join(' '));
    const finalAmountOfMessage = Math.min(100, amountOfMessages + 1);

    message.channel.bulkDelete(finalAmountOfMessage).then(messages => {
        embedSender.logModerator(message, 'Purge Messages', `Successfully purged ${messages.size} messages.`);
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
    description: 'Tries to purge x amount of messages from the channel this command is posted in.',
    usage: 'purge <amount of messages>\n\n' +
        '<amount of messages>: Amount of messages you want to purge (limit 100).'
};
