// Requirements
const embedSender = require('../../utilities/embedSender.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

exports.run = async (client, message, args, permissionLevel) => {
    if(args.length != 1) {
        embedSender.sendMessageToAuthor(message, 'Remove Infraction Type Command', 'Please specify the name of the infraction type you wish to remove.\nE.g.: "~removeInfractionType Spamming".\nYou can list all infraction types with "~listInfractionTypes".');
        return;
    }
    // Retrieve typeName
    const typeName = args.shift();
    const lowerCaseTypeName = typeName.toLowerCase();

    // __dirname leads to the commands folder
    const dbPath = path.resolve(__dirname, '../../database/main.db');
    let database = new sqlite3.Database(dbPath, (error) => {
        if(error) { console.log(error.stack); return; }
    });

    // TODO: Should we remove existing infractions too, or rather keep them?
    database.get('SELECT * FROM infractionTypes WHERE typeName = ?', [lowerCaseTypeName], (error, row) => {
        if(error) { console.log(error.stack); return; }

        if(row) {
            database.run('DELETE FROM infractionTypes WHERE typeName = ?;', [lowerCaseTypeName], (error) => {
                if(error) { console.log(error.stack); return; }

                // Post a notification to the bot channel
                embedSender.logBot(message, 'Remove Infraction Type Command',
                    `__Infraction Type Name__: ${lowerCaseTypeName}`);
            });
        } else {
            embedSender.sendMessageToAuthor(message, 'Remove Infraction Type Command', `Couldn\'t delete infraction type [${typeName}].\nAre you sure this type exists?\nYou can list all infraction types with "~listInfractionTypes".`);
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
    name: 'removeInfractionType',
    description: 'Removes an existing type of infraction from the database.',
    usage: 'removeInfractionType <infraction name>\n\n' +
        '<infraction name>: Name of the infraction type you wish to remove.'
};
