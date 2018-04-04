// Requirements
const discord = require('discord.js');
const client = new discord.Client();
const settings = require('./settings.json');
const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment');

require('./utilities/eventLoader.js')(client);

// Login the Bot to the Server
client.login(settings.serverSettings.botToken);

// Function to manually reload a command file
exports.reload = async function(message, command) {
    delete require.cache[require.resolve('./commands/' + command)];
    let commandFile = require('./commands/' + command);
};

// General Logging Event
var logMessage = (message) => {
    console.log(chalk.green(`### [${moment().format('DD-MM-YYYY HH:mm:ss')}] ${message} ###`));
};
exports.logMessage = logMessage;

// Collections holding commands and aliases for commands
client.commands = new discord.Collection();
client.aliases = new discord.Collection();

// Reads all files found in the commands folder and fills in the collections
fs.readdir("./commands/", (error, files) => {
    if (error) console.error(error);
    logMessage(`Loading a total of ${files.length} commands.`);
    files.forEach(file => {
        let properties = require(`./commands/${file}`);
        logMessage(`Loading Command: ${properties.help.name}.`);
        client.commands.set(properties.help.name, properties);
        properties.config.aliases.forEach(alias => {
            client.aliases.set(alias, properties.help.name);
        });
    });
});

// Has to be async, so that we can probably wait for the fetchMember function (?)
client.getPermissionLevel = async function(message) {
    var permissionLevel = 0;
    // Assuming we only have one Guild for this Bot
    const guild = client.guilds.first();

    if(guild) {
        // Grab the member from the bot's guild
        const userID = message.author.id;
        const member = await guild.fetchMember(userID);

        //const botRole = guild.roles.find('name', settings.roles.botRole);
        // if(botRole && member.roles.has(botRole.id)) {
        //     permissionLevel = 1;
        // }

        const modRole = guild.roles.find('name', settings.roles.moderatorRole);
        if(modRole && member.roles.has(modRole.id)) {
            permissionLevel = 2;
        }
        const adminRole = guild.roles.find('name', settings.roles.adminRole);
        if(adminRole && member.roles.has(adminRole.id)) {
            permissionLevel = 3;
        }
        if(message.author.id === require('./settings.json').ownerID) {
            permissionLevel = 4;
        }
    }
    return permissionLevel;
};

// LOG DELETED MESSAGES!
