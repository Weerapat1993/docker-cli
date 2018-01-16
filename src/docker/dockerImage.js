const fs = require('fs-extra')
const shell = require('shelljs')
const inquirer = require('inquirer')
const chalk = require('chalk')
const { INQUIRER } = require('../config/command-list')
const { createTable, path, runConfirm } = require('../utils');
const dockerJSON = path('./src/docker/docker.json');

const dockerTableImages = (images) => {
  const tableContainer = createTable(['REPOSITORY']);
  const dockerStatus = images.map(item => ([
    item
  ]));
  tableContainer.push(...dockerStatus);
  console.log(tableContainer.toString());
};

const createDockerImages = async (cmdName, callback) => {
  const dataJSON = []
  const dockerPull = fs.readJsonSync(dockerJSON)
  await shell.exec(cmdName, { async: true, silent: true }, (code, stdout, stderr) => {
    const data = stdout.split('\n')
    for(let i = 1; i < data.length - 1; i++) {
      const dataRepo = data[i].split(' ')[0]
      dataJSON.push(dataRepo)
    }
    const fileJSON = {
      ...dockerPull,
      images: dataJSON
    }
    fs.writeFileSync(dockerJSON, JSON.stringify(fileJSON, null, '  '))
    callback(dataJSON)
  })
}

const dockerRemoveImages = async (images) => {
  dockerTableImages(images)
  // Menu
  const imagesData = images.map(item => item)
  
  if(imagesData.length) {
    const dataJSON = await inquirer.prompt([
      {
        type: INQUIRER.list,
        name: "images",
        message: "Please Select for Remove Docker Images:",
        choices: [
          ...imagesData,
          new inquirer.Separator()
        ],
      },
    ])
    const imageName = dataJSON.images
    if(imageName) {
      const cmdName = `docker rmi ${imageName}`
      const callback = () => {
        shell.exec(cmdName, { async: true }, () => {
          console.log(`\n[RUN]: ${chalk.green(cmdName)} success ...\n`)
        })
      }
      const isConfrim = true
      runConfirm(cmdName, callback, isConfrim)
    }
  } else {
    console.log(chalk.red('\nError: Docker images is none.\n'))
  }
}

exports.dockerTableImages = dockerTableImages
exports.dockerRemoveImages = dockerRemoveImages
exports.createDockerImages = createDockerImages 