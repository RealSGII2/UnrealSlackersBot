// Requirements
const embedSender = require('../../utilities/embedSender.js');
const settings = require('../../settings.json');
const base = require('../../utilities/base.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const moment = require('moment');

exports.run = async(client, message, args) => {
    if(args.length < 3) {
        embedSender.sendMessageToAuthor(message, 'Mute Command', 'Please specify the user you want to mute, the mute time in seconds and the reason.\nE.g.: "~mute @user#1234 60 Spamming".');
        return;
    }
    // Test first, if the mention isn't broken/incorrect. Discord happens to tag wrong people on big Server
    const memberName = args.shift();
    if(!base.isMentionValid(memberName)) {
        embedSender.sendMessageToAuthor(message, 'Mute Command', 'It seems like the \'mention\' part of your message wasn\'t correct.\n' +
            'This can happen on Servers that have a lot of members. Retry later by trying to tag the person again.\n\n' +
            `Your message was: ${message.content}`);
        return;
    }
    let member;
    if(!message.mentions.members) {
        embedSender.sendMessageToAuthor(message, 'Mute Command', 'Specifying a user is not supported in Direct Messages.');
    } else {
        member = message.mentions.members.first();
        if(!member) {
            embedSender.sendMessageToAuthor(message, 'Mute Command', 'Couldn\'t find the specified user.');
            return;
        }
    }

    //args.shift();
    // Retrieve the seconds by shifting the array again
    const seconds = args.shift();
    // All remaining arguments make up the reason
    const reason = args.join(' ');

    // __dirname leads to the commands folder
    const dbPath = path.resolve(__dirname, '../../database/main.db');
    let database = new sqlite3.Database(dbPath, (error) => {
        if(error) { console.log(error.stack); return; }
    });

    // Create the time in a format that sqlite supports. Also add the seconds from the actual command to it.
    const unMuteTime = moment().add(seconds, 'seconds').utc().format('YYYY-MM-DD HH:mm:ss Z');

    // User is already muted, so update the entry
    const mutedRole = message.guild.roles.find('name', settings.roles.mutedRole);
    if(member.roles.has(mutedRole.id)) {
        // Find the entry of this user
        database.run('UPDATE mutedUsers SET unMuteTime = ?, moderatorID = ?, reason = ? WHERE userID = ?;', [unMuteTime, message.author.id, reason, member.id], (error) => {
            if(error) { console.log(error.stack); return; }

            // Tell the user, that they got muted
            embedSender.sendMessageToUser(member, 'You were muted by a moderator.',
                `You'll be automatically unmuted at: ${unMuteTime} (UTC)`
            );

            // Post a notification to the moderator channel
            embedSender.logModerator(message, 'Mute Command | Updated User',
                `__Message__: Muted user <@${member.id}> for ${seconds} seconds (starting now).\n` +
                `__Reason__: ${reason}\n` +
                `__Muted Until__: ${unMuteTime} (UTC)`
            );
        });
    } else {
        // We only need to save the userID and the time at which they should get unmuted.
        // With a simple interval, we can now check if the current time is equal or later to the unMuteTime,
        // resulting in the user being unmuted again
        database.run('INSERT INTO mutedUsers (userID, unMuteTime, moderatorID, reason) VALUES (?, ?, ?, ?);', [member.id, unMuteTime, message.author.id, reason], (error) => {
            if(error) { console.log(error.stack); return; }

            // Tell the user, that they got muted
            embedSender.sendMessageToUser(member, 'You were muted by a moderator.',
                `You'll be automatically unmuted at: ${unMuteTime} (UTC)`
            );

            // Add the mutedRole to the user, so they can't write anymore.
            member.addRole(mutedRole.id).then(() => {
                // Post a notification to the moderator channel
                embedSender.logModerator(message, 'Mute Command',
                    `__Message__: Muted user <@${member.id}> for ${seconds} seconds.\n` +
                    `__Reason__: ${reason}\n` +
                    `__Muted Until__: ${unMuteTime} (UTC)`
                );
            }).catch(console.error);
        });
    }

    database.close();
};

exports.config = {
    enabled: true,
    guildOnly: false,
    category: 'muting',
    aliases: [],
    permissionLevel: 2
};

exports.help = {
    name: 'mute',
    description: 'Tries to mute a user for x seconds. If user already muted, updates the time muted, reason and moderator.',
    usage: 'mute <user> <seconds> <reason>\n\n' +
        '<user>: Tagged user you want to mute.\n' +
        '<seconds>: For how many seconds the user should be muted.\n' +
        '<reason>: Reason the user gets muted for.'
};
