const fs = require('fs-extra')
const shell = require('shelljs')
const { createTable, path } = require('../utils');
const dockerJSON = path('./src/docker/docker.json');

const dockerContainer = () => {
  const dockerPull = fs.readJsonSync(dockerJSON)
  const tableContainer = createTable(['CONTAINER ID', 'IMAGE', 'COMMAND', 'CREATE', 'NAMES']);
  const dockerStatus = dockerPull.containers.map(item => ([
    item.containerID,
    item.image,
    item.command,
    item.created,
    item.name,
  ]));
  tableContainer.push(...dockerStatus);
  console.log(tableContainer.toString());
};

/**
 * Create Images JSON
 * @param {string} cmdName
 */
const createImagesJSON = async (cmdName) => {
  const imagesJSON = []
  const dockerPull = fs.readJsonSync(dockerJSON)
  await shell.exec(cmdName, { async: true, silent: true }, (code, stdout, stderr) => {
    const data = stdout.split('\n')
    for(let i = 1; i < data.length - 1; i++) {
      const dataContainer = data[i].split('  ').slice(0,5)
      const dataCommand = data[i].split('"')
      const dataCreated = data[i].split('"')[2].trim().split('   ')[0]
      const dataStatus = data[i].split('ago')[1].trim()
      const dataName = dataCommand[2].split('  ')[dataCommand[2].split('  ').length - 1].trim()
      const dataContainerTrim = dataContainer.map(item => item.trim())
      const dataJSON = {
        containerID: dataContainerTrim[0],
        image: dataContainerTrim[4],
        command: dataCommand[1],
        created: dataCreated,
        status: `${dataStatus} ago`,
        name: dataName,
      }
      imagesJSON.push(dataJSON)
    }
    const fileJson = {
      ...dockerPull,
      containers: imagesJSON,
    }
    fs.writeFileSync(dockerJSON, JSON.stringify(fileJson, null, '  '))
  })
  await dockerContainer()
}

exports.dockerContainer = dockerContainer;
exports.createImagesJSON = createImagesJSON

