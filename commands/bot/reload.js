// Requirements
const embedSender = require('../../utilities/embedSender.js');
const settings = require('../../settings.json');
const app = require('../../app.js');

exports.run = (client, message, args) => {
    if(args.length != 1) {
        embedSender.sendMessageToUser(message, 'Reload Command', 'Please specify the command you want to reload.\nE.g.: "~reload ping".');
        return;
    }

    // Search the command via command and aliases
    const command = args[0];
    const lowerCaseCommand = command.toLowerCase();
    let actualCommand;
    if (client.commands.has(lowerCaseCommand)) {
        actualCommand = lowerCaseCommand;
    }
    else if (client.aliases.has(lowerCaseCommand)) {
        actualCommand = client.aliases.get(lowerCaseCommand);
    }
    // If not found, notify the bog log
    if (!actualCommand) {
        embedSender.sendMessageToUser(message, 'Reload Command', `Couldn't find the command [${settings.serverSettings.commandPrefix}${lowerCaseCommand}].`);
    } else { // If found, tell the client to reload the commandfile
        app.reload(message, actualCommand).then(() => {
            embedSender.logBot(message, 'Reload Command', `Successfully reloaded command [${settings.serverSettings.commandPrefix}${lowerCaseCommand}].`)
        }).catch(error => {
            console.log(error.stack);
            embedSender.sendMessageToUser(message, 'Reload Command', `Failed to reload command [${settings.serverSettings.commandPrefix}${lowerCaseCommand}].`);
        });
    }
};

exports.config = {
    enabled: true,
    guildOnly: false,
    category: 'bot',
    aliases: ['r'],
    permissionLevel: 2
};

exports.help = {
    name: 'reload',
    description: 'Tries to reload the file of the specified command. Can be used in case the file got updated or modified.',
    usage: 'reload <commandname>\n\n' +
        '<commandname>: Name of the command you wish to reload.'
};
