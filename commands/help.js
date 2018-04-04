// Requirements
const settings = require('../settings.json');
const discord = require('discord.js');

exports.run = async (client, message, args, permissionLevel) => {
    // If it's only the help command, send a list of commands that match the users permissionlevel.
    if(!args[0]) {
        const commandNames = Array.from(client.commands.keys());

        var embed = new discord.RichEmbed()
        .setTitle('### Command List ###')
        .setColor(settings.messageColors.colorSuccess)
        .setFooter(`[Use ${settings.serverSettings.commandPrefix}help <commandname> for more details.]`);

        // Go over all commands and add them as fields if the permissionLevel of the user is high enough
        client.commands.map(command => {
            // Only include commands that are available to this user's permissionlevel
            if (permissionLevel >= command.config.permissionLevel) {
                embed.addField(`${settings.serverSettings.commandPrefix}${command.help.name}`, `${command.help.description}`);
            }
        });
        // Send the message to the actual user via direct message
        message.author.send(embed);

    } else { // If there is in fact an argument after the help command, show command specific help
        const command = args[0];
        // Make sure we actually have the command
        if(client.commands.has(command)) {
            // Retrieve the actual command object
            const actualCommand = client.commands.get(command);

            // Don't send information about commands that aren't permitted
            if(permissionLevel >= actualCommand.config.permissionLevel)
            {
                var embed = new discord.RichEmbed()
                .setTitle(`${settings.serverSettings.commandPrefix}${actualCommand.help.name}`)
                .setColor(settings.messageColors.colorSuccess)
                .setDescription(`${actualCommand.help.description}`);
                // If this command has aliases, post them too
                if(actualCommand.config.aliases.length > 0) {
                    embed.addField('Aliases', `${actualCommand.config.aliases}`);
                }
                embed.addField('Usage', `${actualCommand.help.usage}`);
                // Send the message to the actual user via direct message
                message.author.send(embed);
            }
        }
    }
};

exports.config = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permissionLevel: 0
};

exports.help = {
    name: 'help',
    description: 'Shows which commands are available to the user.',
    usage: 'help <commandname (optional)>'
};
