# UnrealSlackersBot
Bot for the Discord Server 'UnrealSlackers', written in Node.js, using Discord.js.
You can find a list of supported events and commands at the end of the readme file.

How does the bot work?
----------------------

**Events**

Events are loaded through the '/utilities/eventLoader'. Each event requires a matching 'eventName.js' file to be available in 'events/'.
The event file simply overrides it's exports to react to the call. Check out '/events/onReady.js' for an example.

**Commands**

Commands are loaded through 'app.js'. Each command is represented by a script in '/commands/<category>commandName.js'.
Commands are running async and have to export 'run'. They are called through the '/events/onMessage.js' event, given the command was found. A list of commands is generated in 'app.js', by reading all scriptfiles from '/commands/<category>/'.
In addition to 'run', a command also needs to export 'config' and 'help'.

* Config is used to enable/disable, set aliases, category and permissionLevel.
* help is used for the 'commands/help.js' script to show a user all available commands (limited to permissionLevel).

**Database**

Some events and commands require to save data, such as the mute event. For this the bot uses an sqlite3 database.
The database file is called 'main.db' and can be found in the '/database/' folder.

**Settings**

Settings, such as the token etc. are obviously not meant for everyone to be seen. The bot makes use of a 'settings.json' file, which is not uploaded to the repo, to not openly show the token and other secret settings.

**node_modules**

There are several node_modules used, which aren't uploaded to the repo. I'll update this point with a list of modules, once I find the time.

Currently Supported Events
--------------------------

* onReady
* onDisconnect
* onReconnecting
* onMessage
* onMessageUpdate
* onMessageDelete

Currently Supported Commands
----------------------------

**Bot Category**

* ping - Pong.
* reload - Reloads a command file requirement, in case a command was changed and the bot shouldn't be stopped.

**General Category**

* help - Listes all commands or specific info to a specified command.

**Utility Category**

* purge - Removes the x amount of messages in the it was posted in.

**Muting Category**

* mute - Mutes the specified user for x seconds and reason.
* unmute - Unmutes a muted user.
* whosmuted - Lists all muted users or the muted users filted by a specified moderator.

**Infractions Category**

* addInfraction
* removeInfraction
* listInfractions
* addInfractionType
* removeInfractionType
* updateInfractionType
* listInfractionTypes
