// Requirements
const embedSender = require('../utilities/embedSender.js');

module.exports = message => {
    // We don't want to listen to the bot, otherwise we could loop
    if(message.author.bot) return;

    const client = message.client;

    // We need to make sure that not all actions are logged
    client.getPermissionLevel(message).then(permissionLevel => {
        if(permissionLevel < 2) {
            embedSender.logMessage(message, 'User deleted a message',
                `__User__: <@${message.author.id}>\n` +
                `__Created at__: ${message.createdAt}\n` +
                `__Channel__ : ${message.channel.name}\n` +
                `__Message__: ${message.content}`
            );
        }
    });
};
