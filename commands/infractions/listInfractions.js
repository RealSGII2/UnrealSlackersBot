// Requirements
const settings = require('../../settings.json');
const discord = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

exports.run = async (client, message, args, permissionLevel) => {
    // Retrieve arguments
    const member = message.mentions.members.first();

    // __dirname leads to the commands folder
    const dbPath = path.resolve(__dirname, '../../database/main.db');
    let database = new sqlite3.Database(dbPath, (error) => {
        if(error) { console.log(error.stack); return; }
    });

    let embed = new discord.RichEmbed()
    .setTimestamp()
    .setColor(settings.messageColors.colorSuccess)
    .setTitle(`### List of Infractions ###`);

    const moderatorLog = client.channels.find('name', settings.logChannels.moderator);

    if(member) {
        database.all('SELECT * FROM infractions WHERE userID = ?', [member.id], (error, rows) => {
            if(error) { console.log(error.stack); return; }
            // Go over all rows and add new fields into the embed for each
            rows.forEach(row => {
                embed.addField(`EntryID: ${row.entryID}`, `**__User__**: <@${row.userID}>\n` +
                    `**__Infraction Name__**: ${row.typeName}\n` +
                    `**__Date of Expire__**: ${expireTime}`, true);
            });

            // Post the Embed to the mod channel
            if(moderatorLog) {
                moderatorLog.send(embed);
            }
        });
    } else {
        database.all('SELECT * FROM infractions', (error, rows) => {
            if(error) { console.log(error.stack); return; }
            // Go over all rows and add new fields into the embed for each
            rows.forEach(row => {
                embed.addField(`EntryID: ${row.entryID}`, `**__User__**: <@${row.userID}>\n` +
                    `**__Infraction Name__**: ${row.typeName} \n` +
                    `**__Date of Expire__**: ${expireTime}`, true);
            });

            // Post the Embed to the mod channel
            if(moderatorLog) {
                moderatorLog.send(embed);
            }
        });
    }

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
    name: 'listInfractions',
    description: 'Lists all infractions. Can filter by user.',
    usage: 'listInfractions <user (optional)>\n' +
        '<user (optional)>: Tagged user you wish to filter for.'
};
