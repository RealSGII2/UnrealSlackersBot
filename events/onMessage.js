// Requirements
const settings = require('../settings.json');

module.exports = message => {
    // Make sure, that we only filter messages that are starting with the proper prefix
    if(!message.content.startsWith(settings.serverSettings.commandPrefix)) return;
    // Also we don't want to listen to the bot, otherwise we could loop
    if(message.author.bot) return;

    const client = message.client;

    // Retrieve the command and arguments that were passed
    const command = message.content.split(" ")[0].slice(settings.serverSettings.commandPrefix.length);
    const args = message.content.split(" ").slice(1);

    // Get the Permission Level of this user
    client.getPermissionLevel(message).then(permissionLevel => {
        // Try to find the command
        let actualCommand;
        if (client.commands.has(command)) {
            actualCommand = client.commands.get(command);
        }
        else if (client.aliases.has(command)) {
            actualCommand = client.commands.get(client.aliases.get(command));
        }
        // If found, forward the call
        if (actualCommand) {
            if (permissionLevel < actualCommand.config.permissionLevel) return;
                actualCommand.run(client, message, args, permissionLevel);
        }
    }).catch(error => {
        console.log(error.stack);
    });


};
