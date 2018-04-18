// Requirements
const embedSender = require('../../utilities/embedSender.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

exports.run = async (client, message, args, permissionLevel) => {
    if(args.length < 4) {
        embedSender.sendMessageToAuthor(message, 'Add Infraction Type Command', 'Please specify the name, points, days and description of the infraction type.\nE.g.: "~addInfractionType Spamming 2 90 For Spammers.".');
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

    database.run('INSERT INTO infractionTypes (typeName, points, days, description) VALUES (?, ?, ?, ?);', [lowerCaseTypeName, points, days, description], (error) => {
        if(error) {
            embedSender.sendMessageToAuthor(message, 'Add Infraction Type Command', 'Something went wrong when trying to add the new type to the database.\nAre you sure the type doesn\'t already exist?');
            console.log(error.stack); return;
        }

        // Post a notification to the bot channel
        embedSender.logBot(message, 'Add Infraction Type',
            `__Infraction Type Name__: ${lowerCaseTypeName}\n` +
            `__Points__: ${points}\n` +
            `__Days__: ${days}\n` +
            `__Description__: ${description}`
        );
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
    name: 'addInfractionType',
    description: 'Adds a new type of infraction.',
    usage: 'addInfractionType <infraction name> <points> <days> <description>\n\n' +
        '<infraction name>: Name of the infraction. Later used for applying infractions.\n' +
        '<points>: How many points this infraction causes.\n' +
        '<days>: How many days until this infraction expires (0 = never)\n' +
        '<description>: Description of the infraction. Can contain whitespaces.'
};
