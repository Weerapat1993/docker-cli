const inquirer = require('inquirer')
const Case = require('case')
const chalk = require('chalk')
const shell = require('shelljs')
const fs = require('fs-extra')
const { INQUIRER, COMMANDS } = require('./src/config/command-list')
const { 
  createDockerImages, 
  dockerContainer,
  dockerPsAll, 
  dockerRemoveContainer, 
  dockerTableImages, 
  dockerRemoveImages,
  dockerCompose,
  dockerClean,
  dockerCreateContainer,
} = require('./src/docker')
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
    // Docker Clean
    case Case.snake(COMMANDS.CLEAN):
      cmdName = 'docker'
      callback = () => dockerClean(() => {
        console.log(chalk.green('Done.'))
      })
      isConfirm = false
      break
    // Docker Compose
    case Case.snake(COMMANDS.COMPOSE):
      cmdName = 'docker-compose'
      callback = () => dockerCompose(() => {
        dockerPsAll('docker ps -a', dockerContainer)
      })
      isConfirm = false
      break
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
        shell.exec(cmdName, { async: true }, () => {
          console.log(chalk.green('\ninstall docker image success ...\n'))
          createDockerImages('docker images', dockerTableImages)
          console.log(chalk.green('\nrun docker images lists success ...\n'))
        })
      }
      break
    // Docker Images
    case Case.snake(COMMANDS.IMAGES):
      cmdName = 'docker images'
      callback = () => {
        shell.exec(cmdName, { async: true }, () => {
          createDockerImages(cmdName, dockerRemoveImages)
          console.log(chalk.green('\nrun docker images lists success ...\n'))
        })
      }
      isConfirm = false
      break
    // Docker Build Image
    case Case.snake(COMMANDS.BUILD_IMAGE):
      const dockerImageNames = dockerPull.images.map(item => item)
      const buildImage = await inquirer.prompt([
        {
          type: INQUIRER.input,
          name: "name",
          message: "Build Docker Image Name:",
          validate: (answer) => {
            const name = validate.required(answer)
            if(name !== true) {
              return name;
            }
            const isTaken = dockerImageNames.includes(answer)
            if(isTaken) {
              return `'${answer}' has already been taken.`
            }
            return true;
          },
        }
      ])
      cmdName = `docker build -t ${buildImage.name} .`
      callback = () => {
        shell.exec(cmdName, { async: true }, async () => {
          await console.log(chalk.green('\nbuild docker image success ...\n'))
          const confirm = await inquirer.prompt([
            {
              type: INQUIRER.confirm,
              name: "isConfirm",
              message: `Do you want to create new container with ${buildImage.name} ?`,
            }
          ])
          if(confirm.isConfirm) {
            dockerCreateContainer(buildImage.name)
          } else {
            console.log(chalk.red('Error: Exit.'))
          }
        })
      }
      break
    // Create Docker Container
    case Case.snake(COMMANDS.CREATE_CONTAINER):
      dockerCreateContainer()
      return;
    default:
      cmdName = ''
  }
  // Run Command
  await runConfirm(cmdName, callback, isConfirm)
}

module.exports = runInquirer