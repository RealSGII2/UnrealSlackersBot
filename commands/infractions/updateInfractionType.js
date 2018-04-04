// Requirements
const settings = require('../../settings.json');
const discord = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

exports.run = async (client, message, args, permissionLevel) => {
    if(args.length < 3) return;
    // Retrieve all single arguments and join the other args into the description
    const typeName = args.shift();
    const points = args.shift();
    const days = args.shift();
    const description = args.join(' ');

    // __dirname leads to the commands folder
    const dbPath = path.resolve(__dirname, '../../database/main.db');
    let database = new sqlite3.Database(dbPath, (error) => {
        if(error) { console.log(error.stack); return; }
    });

    // TODO:  Should we check if a user would deserve a ban, giving that we are also adjusting points?
    database.run('UPDATE infractionTypes SET points = ?, days = ?, description = ? WHERE typeName = ?;', [points, days, description, typeName], (error) => {
        if(error) { console.log(error.stack); return; }

        // Post a notification to the bot channel
        const botLog = client.channels.find('name', settings.logChannels.bot);
        if(botLog) {
            const embed = new discord.RichEmbed()
            .setTimestamp()
            .setColor(settings.messageColors.colorSuccess)
            .setTitle(`Event: Update Infraction Type`)
            .setDescription(`**__Moderator__**: <@${message.author.id}>\n` +
                `**__Infraction Name__**: ${typeName}\n` +
                `**__Points__**: ${points}\n` +
                `**__Days__**: ${days}\n` +
                `**__Description__**: ${description}`);
            botLog.send(embed);
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
