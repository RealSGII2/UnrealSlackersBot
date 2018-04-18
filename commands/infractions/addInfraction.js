// Requirements
const embedSender = require('../../utilities/embedSender.js');
const base = require('../../utilities/base.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const moment = require('moment');

exports.run = async (client, message, args, permissionLevel) => {
    if(args.length < 3) {
        embedSender.sendMessageToAuthor(message, 'Add Infraction Command', 'Please specify a user, the value and the reason of the infraction.\nE.g.: "~addInfraction @user#1234 5 Spamming all channels.".');
        return;
    }

    // Retrieve arguments
    // Test first, if the mention isn't broken/incorrect. Discord happens to tag wrong people on big Server
    const memberName = args.shift();
    if(!base.isMentionValid(memberName)) {
        embedSender.sendMessageToAuthor(message, 'Add Infraction Command', 'It seems like the \'mention\' part of your message wasn\'t correct.\n' +
            'This can happen on Servers that have a lot of members. Retry later by trying to tag the person again.\n\n' +
            `Your message was: ${message.content}`);
        return;
    }
    // Member would be args[0], however we are not using it. Also shift the array to get rid of the argument
    let member;
    if(!message.mentions.members) {
        embedSender.sendMessageToAuthor(message, 'Add Infraction Command', 'Specifying a user is not supported in Direct Messages.');
    } else {
        member = message.mentions.members.first();
        if(!member) {
            embedSender.sendMessageToAuthor(message, 'Add Infraction Command', 'Couldn\'t find the specified user.');
            return;
        }
    }
    const points = args.shift();
    const reason = args.join(' ');

    // __dirname leads to the commands folder
    const dbPath = path.resolve(__dirname, '../../database/main.db');
    let database = new sqlite3.Database(dbPath, (error) => {
        if(error) { console.log(error.stack); return; }
    });

    // 10 Points would mean we wanted to ban the user directly.
    // These infractions never expire, unless manually removed.
    let expireTime;
    if(points >= 10) {
        expireTime = "Never";
    } else {
        expireTime = moment().add(30, 'days').utc().format('YYYY-MM-DD HH:mm:ss');
    }

    database.serialize(() => {
        database.run('INSERT INTO infractionsNew (userID, moderatorID, points, reason, expireTime, expired) VALUES (?, ?, ?, ?, ?, ?);', [member.id, message.author.id, points, reason, expireTime, 0], function(error) {
            if(error) { console.log(error.stack); return; }

            // Tell the user, that they received an infraction
            embedSender.sendMessageToUser(member, 'You received an infraction from a moderator.',
                `__Reason__: ${reason}\n` +
                `__Points__: ${points}\n` +
                `__Date of Expire__: ${expireTime}`
            );

            // Post a notification to the bot channel
            embedSender.logModerator(message, 'Add Infraction Command',
                `__User__: <@${member.id}>\n` +
                `__Reason__: ${reason}\n` +
                `__Points__: ${points}\n` +
                `__Date of Expire__: ${expireTime}\n` +
                `__Entry ID__: ${this.lastID}`
            );
        }).then(() => {
            // Check if the user now has more than 10 points.
            var totalPoints = 0;

            database.each('SELECT * FROM infractionsNew WHERE userID = ?;', [member.id], (error, row) => {
                if(error) { console.log(error.stack); return; }

                // We keep expired entries, so check if this one is not expired
                if(row.expired == 0) {
                    totalPoints += row.points;
                }
            }, () => {
                // If the User reached 10 points, ban them
                if(totalPoints >= 10) {
                    // Tell the user, that they were banned
                    embedSender.sendMessageToUser(member, 'You were banned.',
                        `__Reason__: Automatically banned due to too many infraction points.`
                    );

                    // Post a notification to the bot channel
                    embedSender.logModerator(message, 'User Banned',
                        `__User__: <@${member.id}>\n` +
                        `__Reason__: Automatically banned due to too many infraction points.`);

                    message.guild.ban(member, { days: 2, reason: 'Had too many infraction points.'}).catch(console.error);
                }
            });
        });

        database.close();
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
    name: 'addInfraction',
    description: 'Adds the an infraction to the user.\n',
    usage: 'addInfraction <user> <points> <reason>\n\n' +
        '<user>: Tagged user you wish to infract.\n' +
        '<points>: The number of points the infraction is worth.\n' +
        '<reason>: The reason why you issued the infraction.'
};
