// Requirements
const embedSender = require('../../utilities/embedSender.js');
const settings = require('../../settings.json');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const moment = require('moment');

exports.tryUnmuteUsers = function (client) {
    // Open the DataBase
    const dbPath = path.resolve(__dirname, '../../database/main.db');
    let database = new sqlite3.Database(dbPath, (error) => {
        if(error){ console.log(error.stack); return; }
    });

    // Retrieve the current time to compare to
    const dateNow = moment().utc();
    // Fetch all entries from the mutedUsers table
    database.each('SELECT * FROM mutedUsers', (error, row) => {
        if(error) { console.log(error.stack); return; }
        // Get the time at which they should get unmuted again
        const unMuteTime = moment(`${row.unMuteTime} +0000`, 'YYYY-MM-DD HH:mm:ss Z');
        // If we are past that time...
        if(dateNow.isAfter(unMuteTime)) {
            // Remove the entry from the database table
            database.run('DELETE FROM mutedUsers WHERE userID = ?;', [row.userID], (error) => {
                if(error) { console.log(error.stack); return; }

                // Remove the role from the user, so they can freely spam again
                const guild = client.guilds.first();
                const mutedRole = guild.roles.find('name', settings.roles.mutedRole);
                guild.members.get(row.userID).removeRole(mutedRole.id).then(() => {
                    embedSender.logModeratorAsBot(client, 'Unmute User Command',
                        `__Message__: Automatically unmuted user <@${row.userID}>.\n` +
                        `__Was Muted By__: <@${row.moderatorID}>\n` +
                        `__Reason__: ${row.reason}`
                    );
                }).catch((error) => {
                    console.log(error.stack);
                });
            });
        }
    });

    database.close();
};

exports.run = async(client, message, args) => {
    if(args.length != 1) {
        embedSender.sendMessageToUser(message, 'Unmute Command', 'Please specify the user you want to unmute.\nE.g.: "~unmute @user#1234".');
        return;
    }

    let member;
    if(!message.mentions.members) {
        embedSender.sendMessageToUser(message, 'Unmute Command', 'Specifying a user is not supported in Direct Messages.');
    } else {
        member = message.mentions.members.first();
        if(!member) {
            embedSender.sendMessageToUser(message, 'Unmute Command', 'Couldn\'t find the specified user.');
            return;
        }
    }

    // Check if the user is actually muted
    const mutedRole = message.guild.roles.find('name', settings.roles.mutedRole);
    if(!member.roles.has(mutedRole.id)) {
        embedSender.sendMessageToUser(message, 'Unmute Command', 'The specified user isn\'t muted.\nList all muted users via "~whosmuted".');
        return;
    }

    // __dirname leads to the commands folder
    const dbPath = path.resolve(__dirname, '../../database/main.db');
    let database = new sqlite3.Database(dbPath, (error) => {
        if(error){ console.log(error.stack); return; }
    });

    // Remove the entry from the database table
    database.get('SELECT * FROM mutedUsers WHERE userID = ?', [member.id], (error, row) => {
        if(error){ console.log(error.stack); return; }

        if(row) {
            database.run('DELETE FROM mutedUsers WHERE userID = ?', [member.id], (error) => {
                if(error){ console.log(error.stack); return; }

                // Remove the role from the user, so they can freely spam again
                member.removeRole(mutedRole.id).then(() => {
                    if(error){ console.log(error.stack); return; }

                    embedSender.logModerator(message, 'Unmute User Command', `__Message__: Unmuted user <@${member.id}>.`);
                }).catch(console.error);
            });
        } else {
            embedSender.sendMessageToUser(message, 'Unmute Command', 'The specified user isn\'t listed in the database.\nList all muted users via "~whosmuted".');
        }
    });

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
    name: 'unmute',
    description: 'Tries to unmute a muted user.',
    usage: 'unmute <user>\n\n' +
        '<user>: Tagged user you wish to unmute.'
};
