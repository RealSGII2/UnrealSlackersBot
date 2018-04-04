// Requirements
const settings = require('../../settings.json');
const discord = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

exports.run = async (client, message, args, permissionLevel) => {
    if(args.length < 1) return;
    // Retrieve typeName
    const typeName = args.shift();

    // __dirname leads to the commands folder
    const dbPath = path.resolve(__dirname, '../../database/main.db');
    let database = new sqlite3.Database(dbPath, (error) => {
        if(error) { console.log(error.stack); return; }
    });

    // TODO: Should we remove existing infractions too, or rather keep them?
    database.run('DELETE FROM infractionTypes WHERE typeName = ?;', [typeName], (error) => {
        if(error) { console.log(error.stack); return; }

        // Post a notification to the bot channel
        const botLog = client.channels.find('name', settings.logChannels.bot);
        if(botLog) {
            const embed = new discord.RichEmbed()
            .setTimestamp()
            .setColor(settings.messageColors.colorSuccess)
            .setTitle(`Event: Remove Infraction Type`)
            .setDescription(`**__Moderator__**: <@${message.author.id}>\n` +
                `**__Infraction Name__**: ${typeName}`);
            botLog.send(embed);
        }
    });

    database.close();
};

exports.config = {
    enabled: true,
    guildOnly: false,
    category: 'infractions',
    aliases: [],
    permissionLevel: 2
};

exports.help = {
    name: 'removeInfractionType',
    description: 'Removes an existing type of infraction from the database.',
    usage: 'removeInfractionType <infraction name>\n\n' +
        '<infraction name>: Name of the infraction type you wish to remove.'
};
