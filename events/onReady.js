// Requirements
const chalk = require('chalk');
const unmute = require('../commands/muting/unmute.js');
const removeInfraction = require('../commands/infractions/removeInfraction.js');
const app = require('../app.js');

module.exports = client => {
    app.logMessage('AICharacter::BeginPlay()');

    client.setInterval(() => {
        unmute.tryUnmuteUsers(client);
        removeInfraction.tryToRemoveInfraction(client);
    }, 5000);
};
