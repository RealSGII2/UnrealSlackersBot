// Requirements
const settings = require('../../settings.json');
const discord = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const moment = require('moment');

exports.tryToRemoveInfraction = function (client) {
    // Open the DataBase
    const dbPath = path.resolve(__dirname, '../../database/main.db');
    let database = new sqlite3.Database(dbPath, (error) => {
        if(error){ console.log(error.stack); return; }
    });

    // Retrieve the current time to compare to
    const dateNow = moment().utc();

    // Fetch all entries from the mutedUsers table
    database.each('SELECT * FROM infractions', (error, row) => {
        // Get the time at which they should get unmuted again
        const expireTime = moment(`${row.expireTime} +0000`, 'YYYY-MM-DD HH:mm:ss Z');
        // If we are past that time...
        if(dateNow.isAfter(expireTime)) {
            // Remove the entry from the database table
            database.run('DELETE FROM infractions WHERE entryID = ?;', [row.entryID], (error) => {
                if(error) { console.log(error.stack); return; }

                const moderatorLog = client.channels.find('name', settings.logChannels.moderator);
                if(moderatorLog) {
                    const embed = new discord.RichEmbed()
                    .setTimestamp()
                    .setColor(settings.messageColors.colorSuccess)
                    .setTitle(`Event: Infraction Expired`)
                    .setDescription(`**__Message__**: Infraction expired for <@${row.userID}>.\n` +
                                    `**__Given By__**: <@${row.moderatorID}>\n` +
                                    `**__Infraction Name__**: ${row.typeName}`);
                    moderatorLog.send(embed);
                }
            });
        }
    });

    database.close();
};

exports.run = async (client, message, args, permissionLevel) => {
    if(args.length < 1) return;
    // Retrieve arguments
    const entryID = args.shift();

    // __dirname leads to the commands folder
    const dbPath = path.resolve(__dirname, '../../database/main.db');
    let database = new sqlite3.Database(dbPath, (error) => {
        if(error) { console.log(error.stack); return; }
    });
    database.get('SELECT * FROM infractions WHERE entryID = ?;', [entryID], (error, row) => {
        database.run('DELETE FROM infractions WHERE entryID = ?;', [entryID], (error) => {
            if(error) { console.log(error.stack); return; }

            // Post a notification to the bot channel
            const moderatorLog = client.channels.find('name', settings.logChannels.moderator);
            if(moderatorLog) {
                const embed = new discord.RichEmbed()
                .setTimestamp()
                .setColor(settings.messageColors.colorSuccess)
                .setTitle(`Event: Remove Infraction`)
                .setDescription(`**__Moderator__**: <@${message.author.id}>\n` +
                    `**__User__**: <@${row.userID}>\n` +
                    `**__Infraction Name__**: ${row.typeName}\n` +
                    `**__Entry ID__**: ${entryID}`);
                moderatorLog.send(embed);
            }
        });
    });
};

exports.config = {
    enabled: true,
    guildOnly: false,
    category: 'infractions',
    aliases: [],
    permissionLevel: 2
};

exports.help = {
    name: 'removeInfraction',
    description: 'Removes the specified infraction.',
    usage: 'removeInfraction <entryID>\n\n' +
        '<entryID>: ID of the entry you wish to remove. Can be queried with [~listInfractions].'
};
