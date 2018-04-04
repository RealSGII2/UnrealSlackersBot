// Requirements
const discord = require('discord.js');
const settings = require('../../settings.json');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const moment = require('moment');

exports.run = async(client, message, args) => {
    if(args.length < 3) return;
    // Member would be args[0], however we are not using it. Also shift the array to get rid of the argument
    const member = message.mentions.members.first();
    if(!member) return;
    args.shift();
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
    const unMuteTime = moment().add(seconds, 'seconds').utc().format('YYYY-MM-DD HH:mm:ss');

    // User is already muted, so update the entry
    const mutedRole = message.guild.roles.find('name', settings.roles.mutedRole);
    if(member.roles.has(mutedRole.id)) {
        // Find the entry of this user
        database.run('UPDATE mutedUsers SET unMuteTime = ?, moderatorID = ?, reason = ? WHERE userID = ?;', [unMuteTime, message.author.id, reason, member.id], (error) => {
            if(error) { console.log(error.stack); return; }

            // Post a notification to the moderator channel
            const moderatorLog = client.channels.find('name', settings.logChannels.moderator);
            if(moderatorLog) {
                const embed = new discord.RichEmbed()
                .setTimestamp()
                .setColor(settings.messageColors.colorSuccess)
                .setTitle(`Event: Update muted User`)
                .setDescription(`**__Moderator__**: <@${message.author.id}>\n` +
                                `**__Message__**: Muted user <@${member.id}> for additional ${seconds} seconds.\n` +
                                `**__Reason__**: ${reason}\n` +
                                `**__Muted Until__**: ${unMuteTime} (UTC)`);
                moderatorLog.send(embed);
            }
        });
    } else {
        // We only need to save the userID and the time at which they should get unmuted.
        // With a simple interval, we can now check if the current time is equal or later to the unMuteTime,
        // resulting in the user being unmuted again
        database.run('INSERT INTO mutedUsers (userID, unMuteTime, moderatorID, reason) VALUES (?, ?, ?, ?);', [member.id, unMuteTime, message.author.id, reason], (error) => {
            if(error) { console.log(error.stack); return; }

            // Add the mutedRole to the user, so they can't write anymore.
            member.addRole(mutedRole.id).then(() => {
                // Post a notification to the moderator channel
                const moderatorLog = client.channels.find('name', settings.logChannels.moderator);
                if(moderatorLog) {
                    const embed = new discord.RichEmbed()
                    .setTimestamp()
                    .setColor(settings.messageColors.colorSuccess)
                    .setTitle(`Event: Muted User`)
                    .setDescription(`**__Moderator__**: <@${message.author.id}>\n` +
                                    `**__Message__**: Muted user <@${member.id}> for ${seconds} seconds.\n` +
                                    `**__Reason__**: ${reason}\n` +
                                    `**__Auto Unmute Time__**: ${unMuteTime} (UTC)`);
                    moderatorLog.send(embed);
                }
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
