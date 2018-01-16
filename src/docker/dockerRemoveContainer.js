const inquirer = require('inquirer')
const shell = require('shelljs')
const chalk = require('chalk')
const { INQUIRER } = require('../config/command-list')
const { runConfirm } = require('../utils')
const { dockerTableContainer } = require('./dockerContainer')

const dockerRemoveContainer = async (containers) => {
  dockerTableContainer(containers)

  // Menu
  const containersData = containers.filter(item => item.status_server === false).map(item => ({
    name: item.name,
    checked: item.status_server
  }))
  if(containersData.length) {
    const dataJSON = await inquirer.prompt([
      {
        type: INQUIRER.checkbox,
        name: "containers",
        message: "Please Select for Remove Docker Container:",
        choices: containersData,
      },
    ])
    const containerName = dataJSON.containers.join(' ')
    if(containerName) {
      const cmdName = `docker rm ${containerName}`
      const callback = () => {
        shell.exec(cmdName, { async: true }, () => {
          console.log(`\n[RUN]: ${chalk.green(cmdName)} success ...\n`)
        })
      }
      const isConfrim = true
      runConfirm(cmdName, callback, isConfrim)
    }
  } else {
    console.log(chalk.red('\nError: Cannot remove all container is running ..\n'))
  }
}

exports.dockerRemoveContainer = dockerRemoveContainer