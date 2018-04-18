// Requirements
const embedSender = require('../../utilities/embedSender.js');
const settings = require('../../settings.json');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const moment = require('moment');

exports.run = async(client, message, args) => {
    const author = message.author;

    if(author) {
        // __dirname leads to the commands folder
        const dbPath = path.resolve(__dirname, '../../database/main.db');
        let database = new sqlite3.Database(dbPath, (error) => {
            if(error) { console.log(error.stack); return; }
        });

        database.get('SELECT * FROM mutedUsers WHERE userID = ?', [author.id], (error, row) => {
            if(error) { console.log(error.stack); return; }

            if(row) {
                const unMuteTime = moment(`${row.unMuteTime} +0000`, 'YYYY-MM-DD HH:mm:ss Z');

                embedSender.sendMessageToAuthor(message, 'Your Mute Status',
                    `You are currently muted!\n` +
                    `You'll be automatically unmuted at: ${unMuteTime} (UTC)`
                );
            } else {
                embedSender.sendMessageToAuthor(message, 'Your Mute Status', `You are not muted at this point.`);
            }
        });
    }
};

exports.config = {
    enabled: true,
    guildOnly: false,
    category: 'muting',
    aliases: [],
    permissionLevel: 0
};

exports.help = {
    name: 'amimuted',
    description: 'Returns if you are currently muted or not.',
    usage: 'amimuted'
};
