const inquirer = require('inquirer')
const shell = require('shelljs')
const { INQUIRER } = require('../config/command-list')

const dockerCompose = async (callback) => {
  let cmd = '';
  const data = await inquirer.prompt([
    {
      type: INQUIRER.list,
      name: "docker_compose",
      message: "What do you want to run command docker-compose ?",
      choices: ['UP', 'DOWN'],
      filter: (value) => value,
    }
  ])
  switch (data.docker_compose) {
    case 'UP':
      cmd = 'docker-compose up -d'
      break;
    case 'DOWN':
      cmd = 'docker-compose down'
      break;
    default:
      cmd = 'docker-compose down'
  }
  await shell.exec(cmd, { async: true, silent: false }, (code, stdout, stderr) => {
    if(!code) {
      callback()
    }
  })
}

exports.dockerCompose = dockerCompose;
