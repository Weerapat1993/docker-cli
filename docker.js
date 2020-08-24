const inquirer = require('inquirer')
const chalk = require('chalk')
const shell = require('shelljs')
const fs = require('fs-extra')
const { INQUIRER } = require('./src/config/command-list')
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

const MENUS = {
  STATUS: 'Docker Status',
  IMAGES: 'Docker Images',
  CONTAINER: 'Docker Container',
  COMPOSE: 'Docker Compose',
  CLEAN: 'Clean Docker',
  DASH: '-------------',
}

const runInquirer = async () => {
  const dockerPull = fs.readJsonSync(dockerJSON)
  const menus = await inquirer.prompt([
    {
      type: INQUIRER.list,
      name: "docker_type",
      message: "What do you want?",
      choices: Object.keys(MENUS).map((key) => MENUS[key]),
    }
  ]);
  let cmdName = ''
  let callback = () => null
  let isConfirm = true
  switch(menus.docker_type) {
    case MENUS.STATUS: {
      cmdName = 'docker ps -a'
      callback = () => dockerPsAll(cmdName, dockerContainer)
      isConfirm = false
      break
    }
    case MENUS.IMAGES: {
      const DOCKER_IMAGE_MENUS = {
        LIST: 'Docker Image Lists',
        PULL: 'Docker Pull Image',
        BUILD: 'Docker Build Image',
      }
      const dockerImageMenu = await inquirer.prompt([
        {
          type: INQUIRER.list,
          name: "docker_type",
          message: `${MENUS.IMAGES}, you want to do it?`,
          choices: Object.keys(DOCKER_IMAGE_MENUS).map((key) => DOCKER_IMAGE_MENUS[key]),
        }
      ])
      switch(dockerImageMenu.docker_type) {
        case DOCKER_IMAGE_MENUS.LIST: {
          console.log(DOCKER_IMAGE_MENUS.LIST)
          cmdName = 'docker images'
          callback = () => {
            shell.exec(cmdName, { async: true }, () => {
              createDockerImages(cmdName, dockerRemoveImages)
              console.log(chalk.green('\nrun docker images lists success ...\n'))
            })
          }
          isConfirm = false
          break
        }
        case DOCKER_IMAGE_MENUS.PULL: {
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
        }
        case DOCKER_IMAGE_MENUS.BUILD: {
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
          break;
        }
        default:
      }
      break
    }
    case MENUS.CONTAINER: {
      const DOCKER_CONTAINER_MENUS = {
        CREATE: 'Docker Create Container',
        REMOVE: 'Docker Remove Container',
      }
      const dockerContainerMenu = await inquirer.prompt([
        {
          type: INQUIRER.list,
          name: "docker_type",
          message: `${MENUS.CONTAINER}, you want to do it?`,
          choices: Object.keys(DOCKER_CONTAINER_MENUS).map((key) => DOCKER_CONTAINER_MENUS[key]),
        }
      ])
      switch(dockerContainerMenu.docker_type) {
        case DOCKER_CONTAINER_MENUS.CREATE: {
          dockerCreateContainer()
          return;
        }
        case DOCKER_CONTAINER_MENUS.REMOVE: {
          cmdName = 'docker ps -a'
          callback = () => dockerPsAll(cmdName, dockerRemoveContainer)
          isConfirm = false
          break
        }
        default: {}
      }
      break;
    }
    case MENUS.COMPOSE: {
      cmdName = 'docker-compose'
      callback = () => dockerCompose(() => {
        dockerPsAll('docker ps -a', dockerContainer)
      });
      isConfirm = false
      break
    }
    case MENUS.CLEAN: {
      cmdName = 'docker'
      callback = () => dockerClean(() => {
        console.log(chalk.green('Done.'))
      })
      isConfirm = false
      break
    }
    default:
  }
  // Run Command
  await runConfirm(cmdName, callback, isConfirm)
}

module.exports = runInquirer