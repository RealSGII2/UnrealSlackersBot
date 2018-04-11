// Requirements
const embedSender = require('../../utilities/embedSender.js');
const settings = require('../../settings.json');
const discord = require('discord.js');

exports.run = async (client, message, args, permissionLevel) => {
    const prefix = settings.serverSettings.commandPrefix;

    // If it's only the help command, send a list of commands that match the users permissionlevel.
    if(!args[0]) {
        const commandNames = Array.from(client.commands.keys());
        let commandList = new Array();
        // Go over all commands and add them as fields if the permissionLevel of the user is high enough
        client.commands.map(command => {
            // Only include commands that are available to this user's permissionlevel
            if (permissionLevel >= command.config.permissionLevel) {
                const propertyKey = `[${command.config.category}] ${prefix}${command.help.name}`;
                const propertyVal = `${command.help.description}`;
                commandList.push({ 'propertyKey' : propertyKey, 'propertyVal' : propertyVal });
            }
        });
        embedSender.sendListToUser(message, 'Command List',
            `[Use ${prefix}help <commandname> for more details.]`, commandList
        );

    } else { // If there is in fact an argument after the help command, show command specific help
        const command = args[0];
        const lowerCaseCommand = command.toLowerCase();
        // Make sure we actually have the command
        if(client.commands.has(lowerCaseCommand)) {
            // Retrieve the actual command object
            const actualCommand = client.commands.get(lowerCaseCommand);
            // Don't send information about commands that aren't permitted
            if(permissionLevel >= actualCommand.config.permissionLevel) {
                var embed = new discord.RichEmbed()
                .setTitle(`[${actualCommand.config.category}] ${prefix}${actualCommand.help.name}`)
                .setColor(settings.messageColors.colorSuccess)
                .setDescription(`${actualCommand.help.description}`)
                // If this command has aliases, post them too
                if(actualCommand.config.aliases.length > 0) {
                    embed.addField('Aliases', `${actualCommand.config.aliases}`);
                }
                embed.addField('Usage', `${actualCommand.help.usage}`);
                // Send the message to the actual user via direct message
                message.author.send(embed);
            }
        } else if(client.categories.has(lowerCaseCommand)) { // Maybe we were searching for a category?
            // Get the Array of commands saved for this category
            const commands = client.categories.get(lowerCaseCommand);
            let commandList = new Array();
            // Iterate over all commands and load the actual command object from it
            commands.forEach(cmd => {
                const actualCommand = client.commands.get(cmd);
                // Only include commands that are available to this user's permissionlevel
                if (permissionLevel >= actualCommand.config.permissionLevel) {
                    const propertyKey = `[${actualCommand.config.category}] ${prefix}${actualCommand.help.name}`;
                    const propertyVal = `${actualCommand.help.description}`;
                    commandList.push({ 'propertyKey' : propertyKey, 'propertyVal' : propertyVal });
                }
            });
            // Send the message to the actual user via direct message
            embedSender.sendListToUser(message, `Command List for Category [${command}]`,
                `[Use ${prefix}help <commandname> for more details.]`, commandList
            );
        } else {
            embedSender.sendMessageToUser(message, 'Help Command', `Couldn't find the command [${settings.serverSettings.commandPrefix}${lowerCaseCommand}].`)
        }
    }
};

exports.config = {
    enabled: true,
    guildOnly: false,
    category: 'general',
    aliases: [],
    permissionLevel: 0
};

exports.help = {
    name: 'help',
    description: 'Shows which commands are available to the user.',
    usage: 'help <filter (optional)>\n\n' +
        '<filter (optional)>: Can either be used to show more information about a specific command or filter a category.'
};
