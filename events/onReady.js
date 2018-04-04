// Requirements
const chalk = require('chalk');
const unmute = require('../commands/unmute.js');

module.exports = client => {
    console.log(chalk.green(`### AICharacter is ready. ###`));

    client.setInterval(() => {
        unmute.tryUnmuteUsers(client);
    }, 5000);
};
