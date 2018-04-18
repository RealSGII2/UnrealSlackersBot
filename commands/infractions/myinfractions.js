// Requirements
const embedSender = require('../../utilities/embedSender.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

exports.run = async (client, message, args, permissionLevel) => {
    // Retrieve arguments
    const author = message.author;

    if(author) {
        // __dirname leads to the commands folder
        const dbPath = path.resolve(__dirname, '../../database/main.db');
        let database = new sqlite3.Database(dbPath, (error) => {
            if(error) { console.log(error.stack); return; }
        });

        database.all('SELECT * FROM infractionsNew WHERE userID = ?', [author.id], (error, rows) => {
            if(error) { console.log(error.stack); return; }

            // Go over all rows and add new fields into the embed for each
            var infractionList = new Array();

            let sumPoints = 0;
            rows.forEach(row => {
                const expired = (row.expired == 0) ? "No" : "Yes";
                const propertyKey = `__Expired__: ${expired}`;
                const propertyVal = `__Reason__: ${row.reason}\n` +
                    `__Points__: ${row.points}\n` +
                    `__Date of Expire__: ${row.expireTime}\n`;
                infractionList.push({ 'propertyKey' : propertyKey, 'propertyVal' : propertyVal });
                sumPoints += row.points;
            });

            // Only post the message if we actually have entries
            if(rows.length > 0) {
                // Send List to user
                embedSender.sendListToAuthor(message, 'Your Infractions', `You currently have ${sumPoints} points. Reaching 10 points will automatically result in a ban.`, infractionList);
            } else {
                embedSender.sendMessageToAuthor(message, 'Your Infractions', `You don't have any infractions at this point.`);
            }
        });
    }
};

exports.config = {
    enabled: true,
    guildOnly: false,
    category: 'infractions',
    aliases: [],
    permissionLevel: 0
};

exports.help = {
    name: 'myInfractions',
    description: 'Lists your current infractions.',
    usage: 'myInfractions'
};
