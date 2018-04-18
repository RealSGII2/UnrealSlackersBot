// Requirements
const embedSender = require('../../utilities/embedSender.js');
const settings = require('../../settings.json');
const base = require('../../utilities/base.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const moment = require('moment');
const app = require('../../app.js');

exports.tryUnmuteUsers = function (client) {
    // Open the DataBase
    const dbPath = path.resolve(__dirname, '../../database/main.db');
    let database = new sqlite3.Database(dbPath, (error) => {
        if(error){ console.log(error.stack); return; }
    });

    // Retrieve the current time to compare to
    const dateNow = moment().utc();
    var results = new Array();

    database.serialize(() => {
        // Fetch all entries from the mutedUsers table
        database.each('SELECT * FROM mutedUsers', (error, row) => {
            if(error) { console.log(error.stack); return; }

            if(row) {
                app.logMessage('Found Row with User.');
                // Get the time at which they should get unmuted again
                const unMuteTime = moment(`${row.unMuteTime} +0000`, 'YYYY-MM-DD HH:mm:ss Z');
                app.logMessage(`Unmuted Time: ${unMuteTime}.`);
                results.push({ 'row' : row, 'unMuteTime' : unMuteTime });
            }
        }, () => {
            for(var i = 0; i < results.length; i++) {
                const currentRow = results[i].row;
                const currentUnMuteTime = results[i].unMuteTime;

                // If we are past that time...
                if(dateNow.isAfter(currentUnMuteTime)) {
                    app.logMessage('Should unmute user.');
                    // Remove the entry from the database table
                    database.run('DELETE FROM mutedUsers WHERE userID = ?', [currentRow.userID], (error) => {
                        if(error) { console.log(error.stack); return; }

                        app.logMessage('Deleted mute entry from database.');

                        // Remove the role from the user, so they can freely spam again
                        const guild = client.guilds.first();
                        const mutedRole = guild.roles.find('name', settings.roles.mutedRole);
                        guild.members.get(currentRow.userID).removeRole(mutedRole.id).then(() => {
                            // Tell the user, that they got unmuted
                            embedSender.sendMessageToUser(guild.members.get(currentRow.userID), 'You were automatically unmuted.',
                                `Please don't make us mute you again!`
                            );

                            // Send a message to the moderator channel
                            embedSender.logModeratorAsBot(client, 'Unmute User Command',
                                `__Message__: Automatically unmuted user <@${currentRow.userID}>.\n` +
                                `__Was Muted By__: <@${currentRow.moderatorID}>\n` +
                                `__Reason__: ${currentRow.reason}`
                            );
                        }).catch((error) => {
                            console.log(error.stack);
                        });
                    });

                    app.logMessage('Past DELETE');
                }
            }
            database.close();
        });
    });


};

exports.run = async(client, message, args) => {
    if(args.length != 1) {
        embedSender.sendMessageToAuthor(message, 'Unmute Command', 'Please specify the user you want to unmute.\nE.g.: "~unmute @user#1234".');
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
        embedSender.sendMessageToAuthor(message, 'Unmute Command', 'Specifying a user is not supported in Direct Messages.');
    } else {
        member = message.mentions.members.first();
        if(!member) {
            embedSender.sendMessageToAuthor(message, 'Unmute Command', 'Couldn\'t find the specified user.');
            return;
        }
    }

    // Check if the user is actually muted
    const mutedRole = message.guild.roles.find('name', settings.roles.mutedRole);
    if(!member.roles.has(mutedRole.id)) {
        embedSender.sendMessageToAuthor(message, 'Unmute Command', 'The specified user isn\'t muted.\nList all muted users via "~whosmuted".');
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

                    // Tell the user, that they got unmuted
                    embedSender.sendMessageToUser(message.guild.members.get(row.userID), 'You were unmuted by a moderator.',
                        `Please don't make us mute you again!`
                    );

                    // Tell the Moderator Log Channel
                    embedSender.logModerator(message, 'Unmute User Command', `__Message__: Unmuted user <@${member.id}>.`);
                }).catch(console.error);
            });
        } else {
            embedSender.sendMessageToAuthor(message, 'Unmute Command', 'The specified user isn\'t listed in the database.\nList all muted users via "~whosmuted".');
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
