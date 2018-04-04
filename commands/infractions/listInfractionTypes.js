// Requirements
const settings = require('../../settings.json');
const discord = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

exports.run = async (client, message, args, permissionLevel) => {
    // __dirname leads to the commands folder
    const dbPath = path.resolve(__dirname, '../../database/main.db');
    let database = new sqlite3.Database(dbPath, (error) => {
        if(error) { console.log(error.stack); return; }
    });

    let embed = new discord.RichEmbed()
    .setTimestamp()
    .setColor(settings.messageColors.colorSuccess)
    .setTitle(`### List of Infraction Types ###`);

    const botLog = client.channels.find('name', settings.logChannels.bot);

    database.all('SELECT * FROM infractionTypes', (error, rows) => {
        if(error) { console.log(error.stack); return; }
        // Go over all rows and add new fields into the embed for each
        rows.forEach(row => {
            embed.addField(`EntryID: ${row.entryID}`, `**__Infraction Name__**: ${row.typeName}\n` +
                `**__Points__**: ${row.points}\n` +
                `**__Days__**: ${row.days}\n` +
                `**__Description__**: ${row.description}`, true);
        });

        // Post the Embed to the mod channel
        if(botLog) {
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
    name: 'listInfractionTypes',
    description: 'Lists all existing type of infraction.',
    usage: 'listInfractionTypes'
};
