// Requirements
const embedSender = require('../../utilities/embedSender.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

exports.run = async (client, message, args, permissionLevel) => {
    if(args.length < 4) {
        embedSender.sendMessageToUser(message, 'Update Infraction Type Command', 'Please specify the name, points, days and description of the infraction type.\nE.g.: "~updateInfractionType Spamming 2 90 For Spammers.".');
        return;
    }
    // Retrieve all single arguments and join the other args into the description
    const typeName = args.shift();
    const lowerCaseTypeName = typeName.toLowerCase();
    const points = args.shift();
    const days = args.shift();
    const description = args.join(' ');

    // __dirname leads to the commands folder
    const dbPath = path.resolve(__dirname, '../../database/main.db');
    let database = new sqlite3.Database(dbPath, (error) => {
        if(error) { console.log(error.stack); return; }
    });

    // TODO:  Should we check if a user would deserve a ban, giving that we are also adjusting points?
    database.get('SELECT * FROM infractionTypes WHERE typeName = ?', [lowerCaseTypeName], (error, row) => {
        if(error) { console.log(error.stack); return; }

        if(row) {
            database.run('UPDATE infractionTypes SET points = ?, days = ?, description = ? WHERE typeName = ?;', [points, days, description, lowerCaseTypeName], (error) => {
                if(error) { console.log(error.stack); return; }

                // Post a notification to the bot channel
                embedSender.logBot(message, 'Update Infraction Type Command' ,
                    `__Infraction Type Name__: ${typeName}\n` +
                    `__Points__: ${points}\n` +
                    `__Days__: ${days}\n` +
                    `__Description__: ${description}`
                );
            });
        } else {
            embedSender.sendMessageToUser(message, 'Update Infraction Type Command', `Couldn\'t find infraction type [${typeName}].\nYou can list all infraction types with "~listInfractionTypes".`);
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
    name: 'updateInfractionType',
    description: 'Update an existing type of infraction.',
    usage: 'updateInfractionType <infraction name> <points> <days> <description>\n\n' +
        '<infraction name>: Name of the infraction you wish to update (won\'t change).\n' +
        '<points>: How many points this infraction causes.\n' +
        '<days>: How many days until this infraction expires (0 = never)\n' +
        '<description>: Description of the infraction. Can contain whitespaces.'
};
