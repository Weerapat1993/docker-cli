const inquirer = require('inquirer')
const Case = require('case')
const chalk = require('chalk')
const shell = require('shelljs')
const fs = require('fs-extra')
const { INQUIRER, COMMANDS } = require('./src/config/command-list')
const { createDockerImages, dockerContainer, dockerPsAll, dockerRemoveContainer } = require('./src/docker')
const { validate, path, runConfirm } = require('./src/utils')
const dockerJSON = path('./src/docker/docker.json')

const runInquirer = async () => {
  const dockerPull = fs.readJsonSync(dockerJSON)
  const data = await inquirer.prompt([
    {
      type: INQUIRER.list,
      name: "docker_type",
      message: "What do you want?",
      choices: Object.keys(COMMANDS).map((key) => COMMANDS[key]),
      filter: (value) => Case.snake(value)
    }
  ])
  let cmdName = ''
  let callback = () => null
  let isConfirm = true
  switch(data.docker_type) {
    // Docker Status
    case Case.snake(COMMANDS.PS_ALL):
      cmdName = 'docker ps -a'
      callback = () => dockerPsAll(cmdName, dockerContainer)
      isConfirm = false
      break
    // Remove Docker Container
    case Case.snake(COMMANDS.REMOVE):
      cmdName = 'docker ps -a'
      callback = () => dockerPsAll(cmdName, dockerRemoveContainer)
      isConfirm = false
      break
    // Docker Pull Image
    case Case.snake(COMMANDS.PULL):
      const image = await inquirer.prompt([
        {
          type: INQUIRER.input,
          name: "name",
          message: "Docker Image Name:",
        }
      ])
      cmdName = `docker pull ${image.name}`
      callback = () => {
        let checkPull = false
        dockerPull.images.forEach(item => {
          if(checkPull) checkPull = item === image.name
        })
        let fileJson = {}
        if(!checkPull) {
          fileJson = {
            ...dockerPull,
            images: [
              ...dockerPull.images,
              image.name,
            ]
          }
        } else {
          fileJson = dockerPull
        }
        fs.writeFileSync(dockerJSON, JSON.stringify(fileJson, null, '  '))
        shell.exec(cmdName, { async: true }, () => {
          console.log(chalk.green('\ninstall docker image success ...\n'))
        })
      }
      break
    // Docker Pull Image
    case Case.snake(COMMANDS.IMAGES):
      cmdName = 'docker images'
      callback = () => {
        shell.exec(cmdName, { async: true }, () => {
          createDockerImages(cmdName)
          console.log(chalk.green('\nrun docker images lists success ...\n'))
        })
      }
      isConfirm = false
      break
    // Create Docker Container
    case Case.snake(COMMANDS.CREATE_CONTAINER):
      const dockers = dockerPull.images.map(item => ({
        name: item
      }))
      const container = await inquirer.prompt([
        {
          type: INQUIRER.input,
          name: "name",
          message: "Container Name:",
          filter: (value) => Case.snake(value) || 'container_name'
        },
        {
          type: INQUIRER.input,
          name: "publish_port",
          message: "Publish Port:",
          validate: (value) => validate.number(value),
        },
        {
          type: INQUIRER.input,
          name: "docker_port",
          message: "Docker Port:",
          validate: (value) => validate.number(value),
        },
        {
          type: INQUIRER.input,
          name: "publish_volume",
          message: "Publish Volume:",
        },
        {
          type: INQUIRER.input,
          name: "docker_volume",
          message: "Docker Volume:",
        },
        {
          type: INQUIRER.checkbox,
          name: "images",
          message: "Docker Images:",
          choices: dockers,
          filter: (value) => value.join(' '),
          validate: (answer) => {
            if (answer.length < 1) {
              return 'You must choose at least one.';
            }
            return true;
          }
        },
      ])
      const volume = (!container.publish_volume && !container.docker_volume) ? '' : `-v ${container.publish_volume}:${container.docker_volume}`
      cmdName = `docker run --name ${container.name} -p ${container.publish_port}:${container.docker_port} ${volume} -d ${container.images}`
      callback = () => {
        shell.exec(cmdName, { async: true }, () => {
          console.log(chalk.green('\n[CREATE]: docker container success ...\n'))
        })
      }
      break
    default:
      cmdName = ''
  }
  // Run Command
  await runConfirm(cmdName, callback, isConfirm)
}

module.exports = runInquirer