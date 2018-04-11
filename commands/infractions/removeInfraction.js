// Requirements
const embedSender = require('../../utilities/embedSender.js');
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

                embedSender.logModerator(message, 'Infraction Expired',
                    `__Message__: Infraction expired for <@${row.userID}>.\n` +
                    `__Given By__: <@${row.moderatorID}>\n` +
                    `__Infraction Name__: ${row.typeName}`);
            });
        }
    });

    database.close();
};

exports.run = async (client, message, args, permissionLevel) => {
    if(args.length != 1) {
        embedSender.sendMessageToUser(message, 'Remove Infraction Command', 'Please specify the ID of the infraction entry you wish to removed.\nE.g.: "~removeInfraction 42".\nYou can list all infractions with "~listInfractions".');
        return;
    }
    // Retrieve arguments
    const entryID = args.shift();

    // __dirname leads to the commands folder
    const dbPath = path.resolve(__dirname, '../../database/main.db');
    let database = new sqlite3.Database(dbPath, (error) => {
        if(error) { console.log(error.stack); return; }
    });
    database.get('SELECT * FROM infractions WHERE entryID = ?;', [entryID], (error, row) => {
        if(row) {
            database.run('DELETE FROM infractions WHERE entryID = ?;', [entryID], (error) => {
                if(error) { console.log(error.stack); return; }

                // Post a notification to the bot channel
                embedSender.logModerator(message, 'Remove Infraction Command',
                    `__User__: <@${row.userID}>\n` +
                    `__Infraction Name__: ${row.typeName}\n` +
                    `__Entry ID__: ${entryID}`
                );
            });
        } else {
            embedSender.sendMessageToUser(message, 'Remove Infraction Command', `Couldn\'t find infraction with EntryID ${entryID}.`);
        }
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
