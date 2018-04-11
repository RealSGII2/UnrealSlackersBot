// Requirements
const embedSender = require('../../utilities/embedSender.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

exports.run = async (client, message, args, permissionLevel) => {
    // Retrieve arguments
    let member;
    if(!message.mentions.members) {
        embedSender.sendMessageToUser(message, 'List Infractions Command', 'Specifying a user is not supported in Direct Messages.');
    } else {
        member = message.mentions.members.first();
        if(!member) {
            embedSender.sendMessageToUser(message, 'List Infractions Command', 'Couldn\'t find the specified user.');
            return;
        }
    }

    // __dirname leads to the commands folder
    const dbPath = path.resolve(__dirname, '../../database/main.db');
    let database = new sqlite3.Database(dbPath, (error) => {
        if(error) { console.log(error.stack); return; }
    });

    if(member) {
        database.all('SELECT * FROM infractions WHERE userID = ?', [member.id], (error, rows) => {
            if(error) { console.log(error.stack); return; }
            // Go over all rows and add new fields into the embed for each
            var infractionList = new Array();
            rows.forEach(row => {
                const propertyKey = `EntryID: ${row.entryID}`;
                const propertyVal = `__User__: <@${row.userID}>\n` +
                    `__Infraction Name__: ${row.typeName}\n` +
                    `__Date of Expire__: ${row.expireTime}`
                infractionList.push({ 'propertyKey' : propertyKey, 'propertyVal' : propertyVal });
            });

            // Only post the message if we actually have entries
            if(rows.length > 0) {
                // Send List to user
                embedSender.sendListToUser(message, 'List of Infractions', '', infractionList);
            };
        });
    } else {
        database.all('SELECT * FROM infractions', (error, rows) => {
            if(error) { console.log(error.stack); return; }

            // Go over all rows and add new fields into the embed for each
            var infractionList = new Array();
            rows.forEach(row => {
                const propertyKey = `EntryID: ${row.entryID}`;
                const propertyVal = `__User__: <@${row.userID}>\n` +
                    `__Infraction Name__: ${row.typeName}\n` +
                    `__Date of Expire__: ${row.expireTime}`
                infractionList.push({ 'propertyKey' : propertyKey, 'propertyVal' : propertyVal });
            });

            // Only post the message if we actually have entries
            if(rows.length > 0) {
                // Send List to user
                embedSender.sendListToUser(message, 'List of Infractions', '', infractionList);
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
