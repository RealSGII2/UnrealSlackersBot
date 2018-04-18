// Requirements
const embedSender = require('../../utilities/embedSender.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

exports.run = async (client, message, args) => {
    // Try to retrieve the moderator if passed
    let moderator;
    if(args.length === 1 && !message.mentions.members) {
        embedSender.sendMessageToAuthor(message, 'Who\'s Muted Command', 'Specifying a user is not supported in Direct Messages.');
    } else if(args.length === 1 && message.mentions.members) {
        moderator = message.mentions.members.first();
        if(!moderator) {
            embedSender.sendMessageToAuthor(message, 'Who\'s Muted Command', 'Couldn\'t find the specified moderator.');
        }
    }

    // TODO: CHECK THAT USER IS ACTUALLY A MODERATOR AND RETURN ERROR IF NOT

    // __dirname leads to the commands folder
    const dbPath = path.resolve(__dirname, '../../database/main.db');
    let database = new sqlite3.Database(dbPath, (error) => {
        if(error) { console.log(error.stack); return; }
    });

    if(moderator) {
        database.all('SELECT * FROM mutedUsers WHERE moderatorID = ?', [moderator.id], (error, rows) => {
            if(error) { console.log(error.stack); return; }
            // Go over all rows and add new fields into the embed for each
            var mutedUserList = new Array();
            rows.forEach(row => {
                const propertyKey = `EntryID: ${row.entryID}`;
                const propertyVal = `__Muted User__: <@${row.userID}>\n` +
                    `__By Moderator__: <@${row.moderatorID}>\n` +
                    `__For Reason__: ${row.reason} \n` +
                    `__Muted Until__: ${row.unMuteTime}`;
                mutedUserList.push({ 'propertyKey' : propertyKey, 'propertyVal' : propertyVal });
            });

            // Post the Embed to the mod channel
            if(rows.length > 0) {
                embedSender.sendListToAuthor(message, 'List of Muted Users', '', mutedUserList);
            }
        });
    } else {
        database.all('SELECT * FROM mutedUsers', (error, rows) => {
            if(error) { console.log(error.stack); return; }
            // Go over all rows and add new fields into the embed for each
            var mutedUserList = new Array();
            rows.forEach(row => {
                const propertyKey = `EntryID: ${row.entryID}`;
                const propertyVal = `__Muted User__: <@${row.userID}>\n` +
                    `__By Moderator__: <@${row.moderatorID}>\n` +
                    `__For Reason__: ${row.reason} \n` +
                    `__Muted Until__: ${row.unMuteTime}`;
                mutedUserList.push({ 'propertyKey' : propertyKey, 'propertyVal' : propertyVal });
            });

            // Post the Embed to the mod channel
            if(rows.length > 0) {
                embedSender.sendListToAuthor(message, 'List of Muted Users', '', mutedUserList);
            } else {
                embedSender.sendMessageToAuthor(message, 'Who\'s Muted Command', 'No member is currently muted.');
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
