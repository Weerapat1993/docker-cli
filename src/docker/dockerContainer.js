const fs = require('fs-extra')
const shell = require('shelljs')
const chalk = require('chalk')
const inquirer = require('inquirer')
const { HEADER, INQUIRER } = require('../config/command-list')
const { createTable, path, runConfirm, validate } = require('../utils');
const dockerJSON = path('./src/docker/docker.json');

const dockerTableContainer = (containers) => {
  const headerColor = chalk.red
  const onColor = chalk.green
  const offColor = chalk.default
  const tableContainer = createTable([
    '',
    headerColor(HEADER.CONTAINER_ID),
    headerColor(HEADER.IMAGE),
    // headerColor(HEADER.COMMAND),
    headerColor(HEADER.CREATED),
    headerColor(HEADER.STATUS),
    headerColor(HEADER.PORT),
    headerColor(HEADER.NAMES),
  ]);
  const dockerStatus = containers.map(item => {
    const status = item.status.split(' ')[0]
    if(status === 'Up') {
      return [
        onColor('✔'),
        onColor(item.containerID),
        onColor(item.image),
        // onColor(item.command),
        onColor(item.created),
        onColor(item.status),
        onColor(item.port),
        onColor(item.name),
      ]
    } else if(status === 'Exited') {
      return [
        offColor('✖'),
        offColor(item.containerID),
        offColor(item.image),
        // offColor(item.command),
        offColor(item.created),
        offColor(item.status),
        offColor(item.port),
        offColor(item.name),
      ]
    } else {
      return [
        '',
        item.containerID,
        item.image,
        // item.command,
        item.created,
        item.status,
        item.port,
        item.name,
      ]
    }
  });
  tableContainer.push(...dockerStatus);
  console.log(tableContainer.toString());
}

const dockerContainer = async (containers) => {
  dockerTableContainer(containers)

  // Menu
  const containersData = containers.map(item => ({
    name: item.name,
    checked: item.status_server
  })).reverse()
  if(containersData.length) {
    const dataJSON = await inquirer.prompt([
      {
        type: INQUIRER.checkbox,
        name: "containers",
        message: "Please Select Docker Container:",
        choices: [
          ...containersData,
          new inquirer.Separator(),
        ],
        filter: (value) => containers.map(item => {
          let changed = value.filter(name => item.name === name).length ? true : false
          if(changed !== item.status_server) {
            return {
              container: item.name,
              status: changed
            }
          } else {
            return {
              container: '',
              status: changed
            }
          }
        }),
      },
    ])
    const startServer = dataJSON.containers.filter(data => data.status === true).map(item => item.container).join(' ').trim()
    const stopServer = dataJSON.containers.filter(data => data.status === false).map(item => item.container).join(' ').trim()
    // console.log(JSON.stringify(startServer, null, '  '))
    // console.log(JSON.stringify(stopServer, null, '  '))
    
    const cmdStart = `docker start ${startServer}`
    const cmdStop = `docker stop ${stopServer}`
    if (startServer) {
      await runConfirm(cmdStart, () => {
        shell.exec(cmdStart, { async: true }, () => {
          console.log(`\n[RUN]: ${chalk.green(cmdStart)} success ...\n`)
          if (stopServer) {
            shell.exec(cmdStop, { async: true }, () => {
              console.log(`\n[RUN]: ${chalk.green(cmdStop)} success ...\n`)
            })
          }
        })
      }, true)
    } else if(stopServer) {
      await runConfirm(cmdStop, () => {
        shell.exec(cmdStop, { async: true }, () => {
          console.log(`\n[RUN]: ${chalk.green(cmdStop)} success ...\n`)
        })
      }, true)
    }
  } else {
    console.log(chalk.red('\nError: Cannot remove all container is running ..\n'))
  }
};

/**
 * Create Images JSON
 * @param {string} cmdName
 */
const dockerPsAll = async (cmdName, callback) => {
  const imagesJSON = []
  await shell.exec(cmdName, { async: true, silent: true }, (code, stdout, stderr) => {
    const dockerPull = fs.readJsonSync(dockerJSON)
    const data = stdout.split('\n')
    for(let i = 1; i < data.length - 1; i++) {
      const dataContainer = data[i].split('  ').slice(0,5)
      const dataCommand = data[i].split('"')
      const dataCreated = data[i].split('"')[2].trim().split('   ')[0]
      const dataStatusText = data[i].split('ago')[1].trim().split('  ')[0]
      const dataStatus = dataStatusText.split(' ')[0]
      let dataPort = data[i].split('ago')[1].trim().split('  ').slice(1).join('')
      const dataName = dataCommand[2].split('  ')[dataCommand[2].split('  ').length - 1].trim()
      dataPort = dataPort.replace(dataName, '').trim()
      const dataContainerTrim = dataContainer.map(item => item.trim())
      const dataJSON = {
        containerID: dataContainerTrim[0],
        image: dataContainerTrim[4],
        command: dataCommand[1],
        created: dataCreated,
        status: `${dataStatusText} ago`,
        status_server: dataStatus === 'Up',
        port: dataPort,
        name: dataName,
      }
      imagesJSON.push(dataJSON)
    }
    const fileJson = {
      ...dockerPull,
      containers: imagesJSON,
    }
    fs.writeFileSync(dockerJSON, JSON.stringify(fileJson, null, '  '))
    callback(imagesJSON)
  })
}

const dockerCreateContainer = async (imageName) => {
  const dockerPull = fs.readJsonSync(dockerJSON)
  let cmdName = ''
  let callback = () => null
  let isConfirm = true
  const dockers = dockerPull.images.map(item => ({
    name: item
  }))
  let menus = [
    {
      type: INQUIRER.input,
      name: "name",
      message: "Container Name:",
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
    // {
    //   type: INQUIRER.input,
    //   name: "publish_volume",
    //   message: "Publish Volume:",
    // },
    // {
    //   type: INQUIRER.input,
    //   name: "docker_volume",
    //   message: "Docker Volume:",
    // },
  ]
  if(!imageName) {
    menus = [
      ...menus,
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
    ]
  }
  const container = await inquirer.prompt(menus)
  const volume = (!container.publish_volume && !container.docker_volume) ? '' : `-v ${container.publish_volume}:${container.docker_volume}`
  const containerName = container.name ? `--name ${container.name}` : ''
  cmdName = `docker run ${containerName} -p ${container.publish_port}:${container.docker_port} ${volume} -d ${imageName || container.images}`
  callback = () => {
    shell.exec(cmdName, { async: true }, () => {
      console.log(chalk.green('\n[CREATE]: docker container success ...\n'))
    })
  }

  // Run Command
  await runConfirm(cmdName, callback, isConfirm)
}

exports.dockerContainer = dockerContainer;
exports.dockerPsAll = dockerPsAll;
exports.dockerTableContainer = dockerTableContainer;
exports.dockerCreateContainer = dockerCreateContainer;


