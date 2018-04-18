// Requirements
const embedSender = require('../../utilities/embedSender.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

exports.run = async (client, message, args, permissionLevel) => {
    // Retrieve arguments
    let member;
    if(args.length === 1 && !message.mentions.members) {
        embedSender.sendMessageToAuthor(message, 'List Infractions Command', 'Specifying a user is not supported in Direct Messages.');
    } else if(args.length === 1 && message.mentions.members) {
        member = message.mentions.members.first();
        if(args.length == 1 && !member) {
            embedSender.sendMessageToAuthor(message, 'List Infractions Command', 'Couldn\'t find the specified user.');
            return;
        }
    }

    // __dirname leads to the commands folder
    const dbPath = path.resolve(__dirname, '../../database/main.db');
    let database = new sqlite3.Database(dbPath, (error) => {
        if(error) { console.log(error.stack); return; }
    });

    if(member) {
        database.all('SELECT * FROM infractionsNew WHERE userID = ?', [member.id], (error, rows) => {
            if(error) { console.log(error.stack); return; }
            // Go over all rows and add new fields into the embed for each
            var infractionList = new Array();
            rows.forEach(row => {
                const expired = (row.expired == 0) ? "No" : "Yes";
                const propertyKey = `EntryID: ${row.entryID}`;
                const propertyVal = `__User__: <@${row.userID}>\n` +
                    `__Reason__: ${row.reason}\n` +
                    `__Points__: ${row.points}\n` +
                    `__Date of Expire__: ${row.expireTime}\n` +
                    `__Expired__: ${expired}`
                infractionList.push({ 'propertyKey' : propertyKey, 'propertyVal' : propertyVal });
            });

            // Only post the message if we actually have entries
            if(rows.length > 0) {
                // Send List to user
                embedSender.sendListToAuthor(message, 'List of Infractions', '', infractionList);
            } else {
                embedSender.sendMessageToAuthor(message, 'List of Infractions', 'There are no infractions at this point.');
            }
        });
    } else {
        database.all('SELECT * FROM infractionsNew', (error, rows) => {
            if(error) { console.log(error.stack); return; }

            // Go over all rows and add new fields into the embed for each
            var infractionList = new Array();
            rows.forEach(row => {
                const expired = (row.expired == 0) ? "No" : "Yes";
                const propertyKey = `EntryID: ${row.entryID}`;
                const propertyVal = `__User__: <@${row.userID}>\n` +
                    `__Reason__: ${row.reason}\n` +
                    `__Points__: ${row.points}\n` +
                    `__Date of Expire__: ${row.expireTime}\n` +
                    `__Expired__: ${expired}`
                infractionList.push({ 'propertyKey' : propertyKey, 'propertyVal' : propertyVal });
            });

            // Only post the message if we actually have entries
            if(rows.length > 0) {
                // Send List to user
                embedSender.sendListToAuthor(message, 'List of Infractions', '', infractionList);
            } else {
                embedSender.sendMessageToAuthor(message, 'List of Infractions', 'There are no infractions at this point.');
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
