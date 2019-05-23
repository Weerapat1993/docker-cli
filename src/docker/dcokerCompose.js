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
      choices: ['docker-compose up -d', 'docker-compose down'],
      filter: (value) => value,
    }
  ])
  cmd = data.docker_compose
  await shell.exec(cmd, { async: true, silent: false }, (code, stdout, stderr) => {
    if(!code) {
      callback()
    }
  })
}

exports.dockerCompose = dockerCompose;
