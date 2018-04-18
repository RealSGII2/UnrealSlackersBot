// Requirements
const embedSender = require('../../utilities/embedSender.js');
const base = require('../../utilities/base.js');

exports.run = async(client, message, args) => {
    const amountArgs = args.length;
    if(amountArgs < 1) {
        embedSender.sendMessageToAuthor(message, 'Purge Messages Command', 'Please specify the number of messages you wish to remove and optinally a user to target.\nE.g.: "~purge 42 @user#1234".');
        return;
    }

    const amountOfMessages = parseInt(args.shift());

    // Retrieve arguments
    // Test first, if the mention isn't broken/incorrect. Discord happens to tag wrong people on big Server
    let member;
    if(amountArgs == 2) {
        const memberName = args.shift();
        if(!base.isMentionValid(memberName)) {
            embedSender.sendMessageToAuthor(message, 'Purge Messages Command', 'It seems like the \'mention\' part of your message wasn\'t correct.\n' +
                'This can happen on Servers that have a lot of members. Retry later by trying to tag the person again.\n\n' +
                `Your message was: ${message.content}`);
            return;
        }

        // Member would be args[0], however we are not using it. Also shift the array to get rid of the argument
        if(!message.mentions.members) {
            embedSender.sendMessageToAuthor(message, 'Purge Messages Command', 'Specifying a user is not supported in Direct Messages.');
        } else {
            member = message.mentions.members.first();
            if(!member) {
                embedSender.sendMessageToAuthor(message, 'Purge Messages Command', 'Couldn\'t find the specified user.');
                return;
            }
        }
    }

    if(member) {
        // Delete the command itself too
        const finalAmountOfMessage = (member.id == message.author.id) ? amountOfMessages + 1 : amountOfMessages;

        // If we have a member specified, we want to make sure, that we only delete the messages that they wrote
        let memberMessageCount = 0;
        message.channel.fetchMessages({"limit" : 100}).then((messages) => {
            const messagesArray = messages.array();

            for(var i = 0; i < messagesArray.length; i++) {
                const localMessage = messagesArray[i];
                if(localMessage.author.id == member.id) {
                    localMessage.delete();
                    memberMessageCount++;
                }

                if(memberMessageCount >= finalAmountOfMessage) {
                    break;
                }
            }

            embedSender.logModerator(message, 'Purge Messages Command',
                `__Num Messages__: ${memberMessageCount}\n` +
                `__Target User__: <@${member.id}>\n` +
                `__Channel__: ${message.channel.name}`
            );
        });
    } else {
        // +1 to also delete the command message.
        // This kinda results in failing to clean up the command in onMessage, but whatever..
        const finalAmountOfMessage = Math.min(100, amountOfMessages + 1);
        message.channel.bulkDelete(finalAmountOfMessage).then(messages => {
            embedSender.logModerator(message, 'Purge Messages Command',
                `__Num Messages__: ${messages.size}\n` +
                `__Channel__: ${message.channel.name}`
            );
        }).catch(console.error);
    }
};

exports.config = {
    enabled: true,
    guildOnly: false,
    category: 'utility',
    aliases: [],
    permissionLevel: 2
};

exports.help = {
    name: 'purge',
    description: 'Tries to purge x amount of messages from the channel this command is posted in.',
    usage: 'purge <amount of messages> <user (optional)>\n\n' +
        '<amount of messages>: Amount of messages you want to purge (limit 100).\n' +
        '<user (optional)>: Can be use to specify a user to only delete their messages.\nCould result in less messages being deleted.'
};
