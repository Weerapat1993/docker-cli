const inquirer = require('inquirer')
const shell = require('shelljs')
const { INQUIRER } = require('../config/command-list')

const dockerClean = async (callback) => {
  let cmd = '';
  const data = await inquirer.prompt([
    {
      type: INQUIRER.list,
      name: "cmd",
      message: "What do you want to remove old and unused Docker ?",
      choices: [
        'docker container prune', 
        'docker image prune',
        'docker network prune',
        'docker volume prune',
      ],
      filter: (value) => value,
    }
  ])
  cmd = data.cmd
  await shell.exec(cmd, { async: true, silent: false }, (code, stdout, stderr) => {
    if(!code) {
      callback()
    }
  })
}

exports.dockerClean = dockerClean;
