// Requirements
const discord = require('discord.js');
const settings = require('../../settings.json');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

exports.run = async (client, message, args) => {
    // Try to retrieve the moderator if passed
    const moderator = message.mentions.members.first();

    // __dirname leads to the commands folder
    const dbPath = path.resolve(__dirname, '../../database/main.db');
    let database = new sqlite3.Database(dbPath, (error) => {
        if(error) { console.log(error.stack); return; }
    });

    let embed = new discord.RichEmbed()
    .setTimestamp()
    .setColor(settings.messageColors.colorSuccess)
    .setTitle(`### List of Muted Users ###`);

    const moderatorLog = client.channels.find('name', settings.logChannels.moderator);

    let results;
    if(moderator) {
        database.all('SELECT * FROM mutedUsers WHERE moderatorID = ?', [moderator.id], (error, rows) => {
            if(error) { console.log(error.stack); return; }
            // Go over all rows and add new fields into the embed for each
            rows.forEach(row => {
                embed.addField(`EntryID: ${row.entryID}`, `**__Muted User__**: <@${row.userID}>\n` +
                    `**__For Reason__**: ${row.reason} \n` +
                    `**__Muted Until__**: ${row.unMuteTime} `, true);
            });

            // Post the Embed to the mod channel
            if(moderatorLog) {
                moderatorLog.send(embed);
            }
        });
    } else {
        database.all('SELECT * FROM mutedUsers', (error, rows) => {
            if(error) { console.log(error.stack); return; }
            // Go over all rows and add new fields into the embed for each
            rows.forEach(row => {
                embed.addField(`EntryID: ${row.entryID}`, `**__Muted User__**: <@${row.userID}>\n` +
                    `**__By Moderator__**: <@${row.moderatorID}>\n` +
                    `**__For Reason__**: ${row.reason}\n` +
                    `**__Muted Until__**: ${row.unMuteTime} `, true);
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
    category: 'muting',
    aliases: [ 'muted' ],
    permissionLevel: 2
};

exports.help = {
    name: 'whosmuted',
    description: 'Shows which user is currently muted. Allows showing only mutes by a specific moderator.',
    usage: 'whosmuted <moderator (optional)>\n\n' +
        '<moderator (optional)>: Tagged moderator you wish to filter for.'
};
