// Requirements
const embedSender = require('../../utilities/embedSender.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

exports.run = async (client, message, args, permissionLevel) => {
    // __dirname leads to the commands folder
    const dbPath = path.resolve(__dirname, '../../database/main.db');
    let database = new sqlite3.Database(dbPath, (error) => {
        if(error) { console.log(error.stack); return; }
    });

    database.all('SELECT * FROM infractionTypes', (error, rows) => {
        if(error) { console.log(error.stack); return; }
        // Go over all rows and add new fields into the embed for each
        var infractionTypeList = new Array();
        rows.forEach(row => {
            const propertyKey = `EntryID: ${row.entryID}`;
            const propertyVal = `__Infraction Name__: ${row.typeName}\n` +
                `__Points__: ${row.points}\n` +
                `__Days__: ${row.days}\n` +
                `__Description__: ${row.description}`;
            infractionTypeList.push({ 'propertyKey' : propertyKey, 'propertyVal' : propertyVal });
        });

        if(rows.length > 0) {
            embedSender.sendListToAuthor(message, 'List of Infraction Types', '', infractionTypeList);
        }
    });

    database.close();
};

exports.config = {
    enabled: false,
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
