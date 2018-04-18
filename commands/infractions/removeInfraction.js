// Requirements
const embedSender = require('../../utilities/embedSender.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const moment = require('moment');
const app = require('../../app.js');

exports.tryToRemoveInfraction = function (client) {
    // Open the DataBase
    const dbPath = path.resolve(__dirname, '../../database/main.db');
    let database = new sqlite3.Database(dbPath, (error) => {
        if(error){ console.log(error.stack); return; }
    });

    // Retrieve the current time to compare to
    const dateNow = moment().utc();
    var results = new Array();
    database.serialize(() => {
        // Fetch all entries from the mutedUsers table
        database.each('SELECT * FROM infractionsNew', (error, row) => {
            if(error) { console.log(error.stack); return; }
            if(row) {
                // Get the time at which they should get unmuted again
                const expireTime = moment(`${row.expireTime} +0000`, 'YYYY-MM-DD HH:mm:ss Z');

                results.push({ 'row' : row, 'expireTime' : expireTime });
            }
        }, () => {
            for(var i = 0; i < results.length; i++) {
                const row = results[i].row;
                const expireTime = results[i].expireTime;

                // If we are past that time...
                if(dateNow.isAfter(expireTime)) {
                    // Remove the entry from the database table
                    database.run('UPDATE infractionsNew SET expired = ? WHERE entryID = ?;', [1, row.entryID], (error) => {
                        if(error) { console.log(error.stack); return; }

                        embedSender.logModerator(message, 'Infraction Expired',
                            `__Message__: Infraction expired for <@${row.userID}>.\n` +
                            `__Given By__: <@${row.moderatorID}>\n` +
                            `__Reason__: ${row.reason}\n` +
                            `__Points__: ${row.points}`
                        );
                    });
                }
            }
        });
        database.close();
    });
};

exports.run = async (client, message, args, permissionLevel) => {
    if(args.length != 1) {
        embedSender.sendMessageToAuthor(message, 'Remove Infraction Command', 'Please specify the ID of the infraction entry you wish to removed.\nE.g.: "~removeInfraction 42".\nYou can list all infractions with "~listInfractions".');
        return;
    }
    // Retrieve arguments
    const entryID = args.shift();

    // __dirname leads to the commands folder
    const dbPath = path.resolve(__dirname, '../../database/main.db');
    let database = new sqlite3.Database(dbPath, (error) => {
        if(error) { console.log(error.stack); return; }
    });

    database.get('SELECT * FROM infractionsNew WHERE entryID = ?', [entryID], (error, row) => {
        console.log('TEST2');
        if(error) { console.log(error.stack); return; }
        if(row) {
            database.run('UPDATE infractionsNew SET expired = ? WHERE entryID = ?;', [1, row.entryID], (error) => {
                if(error) { console.log(error.stack); return; }
                app.logMessage('Remove Infraction | Removed Entry with ID: ' + entryID + '.');
                // Post a notification to the bot channel
                embedSender.logModerator(message, 'Remove Infraction Command',
                    `__User__: <@${row.userID}>\n` +
                    `__Given By__: <@${row.moderatorID}>\n` +
                    `__Reason__: ${row.reason}\n` +
                    `__Points__: ${row.points}\n` +
                    `__Entry ID__: ${entryID}`
                );
            });
        } else {
            embedSender.sendMessageToAuthor(message, 'Remove Infraction Command', `Couldn\'t find infraction with EntryID ${entryID}.`);
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
    name: 'removeInfraction',
    description: 'Removes the specified infraction.',
    usage: 'removeInfraction <entryID>\n\n' +
        '<entryID>: ID of the entry you wish to remove. Can be queried with [~listInfractions].'
};
