// Requirements
const settings = require('../../settings.json');
const discord = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const moment = require('moment');

exports.run = async (client, message, args, permissionLevel) => {
    if(args.length < 2) return;
    // Retrieve arguments
    // Member would be args[0], however we are not using it. Also shift the array to get rid of the argument
    const member = message.mentions.members.first();
    if(!member) return;
    args.shift();
    const typeName = args.shift();

    // __dirname leads to the commands folder
    const dbPath = path.resolve(__dirname, '../../database/main.db');
    let database = new sqlite3.Database(dbPath, (error) => {
        if(error) { console.log(error.stack); return; }
    });
    database.get('SELECT * FROM infractionTypes WHERE typeName = ?;', [typeName], (error, row) => {
        if(error) { console.log(error.stack); return; }
        // Add the days from the infractionType entry to the current time
        let actualDays;
        if(row.days === 0) {
            actualDays = 36500; // +- 100 years
        } else {
            actualDays = row.days;
        }
        const expireTime = moment().add(actualDays, 'days').utc().format('YYYY-MM-DD HH:mm:ss');

        database.run('INSERT INTO infractions (userID, moderatorID, typeName, expireTime) VALUES (?, ?, ?, ?);', [member.id, message.author.id, typeName, expireTime], function(error) {
            if(error) { console.log(error.stack); return; }

            // Post a notification to the bot channel
            const moderatorLog = client.channels.find('name', settings.logChannels.moderator);
            if(moderatorLog) {
                const embed = new discord.RichEmbed()
                .setTimestamp()
                .setColor(settings.messageColors.colorSuccess)
                .setTitle(`Event: Add Infraction`)
                .setDescription(`**__Moderator__**: <@${message.author.id}>\n` +
                    `**__User__**: <@${member.id}>\n` +
                    `**__Infraction Name__**: ${typeName}\n` +
                    `**__Date of Expire__**: ${expireTime}\n` +
                    `**__Entry ID__**: ${this.lastID}`);
                moderatorLog.send(embed);
            }
        });
    });

    // Check if the user now has more than 10 points.
    var totalPoints = 0;
    database.each('SELECT * FROM infractionTypes, infractions WHERE infractions.userID = ? AND infractions.typeName = infractionTypes.typeName;', [member.id], (error, row) => {
        if(error) { console.log(error.stack); return; }
        if(totalPoints < 10) {
            totalPoints += row.points;
            if(totalPoints >= 10) {
                database.run('DELETE FROM infractions WHERE userID = ?;', [member.id], (error) => {
                    if(error) { console.log(error.stack); return; }
                    message.guild.ban(member, { days: 2, reason: 'Had too many infractions.'}).catch(console.error);

                    // Post a notification to the bot channel
                    const botLog = client.channels.find('name', settings.logChannels.bot);
                    if(botLog) {
                        const embed = new discord.RichEmbed()
                        .setTimestamp()
                        .setColor(settings.messageColors.colorSuccess)
                        .setTitle(`Event: Auto Banned User`)
                        .setDescription(`**__User__**: <@${member.id}>\n` +
                            `**__Reason__**: Had too many infractions.`);
                        botLog.send(embed);
                    }
                });
            }
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
    name: 'addInfraction',
    description: 'Adds the specified infraction to the user.\n',
    usage: 'addInfraction <user> <infraction name>\n\n' +
        '<user>: Tagged user you wish to infract.\n' +
        '<infraction name>: Name of the infraction you wish to apply.'
};
