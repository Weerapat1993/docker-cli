const inquirer = require('inquirer');
const chalk = require('chalk')
const { INQUIRER } = require('../config/command-list')

/**
 * Confirm Before Run Command
 * @param {string} cmdName 
 * @param {function} callback 
 */
const runConfirm = async (cmdName, callback) => {
  if(cmdName) {
    console.log(`\nCommand: ${chalk.green(`${cmdName}\n`)}`)
    const confirm = await inquirer.prompt([
      {
        type: INQUIRER.confirm,
        name: "isConfirm",
        message: "Do you want to start docker command?",
      }
    ])
    if(confirm.isConfirm) {
      callback()
    } else {
      console.log(chalk.red('Error: Exit.'))
    }
  } else {
    console.log(chalk.red('Error: Command is not found.'))
  }
}

module.exports = runConfirm