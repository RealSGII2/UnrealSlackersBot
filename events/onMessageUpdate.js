// Requirements
const embedSender = require('../utilities/embedSender.js');

module.exports = (oldMessage, newMessage) => {
    // We don't want to listen to the bot, otherwise we could loop
    if(oldMessage.author.bot) return;

    const client = oldMessage.client;

    // We need to make sure that not all actions are logged
    client.getPermissionLevel(oldMessage).then(permissionLevel => {
        if(permissionLevel < 2) {
            embedSender.logMessage(oldMessage, 'User edited a message',
                `__User__: <@${oldMessage.author.id}>\n` +
                `__Old Message__: ${oldMessage.content}\n` +
                `__New Message__: ${newMessage.content}`
            );
        }
    });
};
