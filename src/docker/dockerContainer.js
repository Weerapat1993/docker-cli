const fs = require('fs-extra')
const shell = require('shelljs')
const { createTable, path } = require('../utils');
const dockerJSON = path('./src/docker/docker.json');

const dockerContainer = (containers) => {
  const tableContainer = createTable(['CONTAINER ID', 'IMAGE', 'COMMAND', 'CREATE', 'STATUS','PORT', 'NAMES']);
  const dockerStatus = containers.map(item => ([
    item.containerID,
    item.image,
    item.command,
    item.created,
    item.status,
    item.port,
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
  await shell.exec(cmdName, { async: true, silent: true }, (code, stdout, stderr) => {
    const dockerPull = fs.readJsonSync(dockerJSON)
    const data = stdout.split('\n')
    for(let i = 1; i < data.length - 1; i++) {
      const dataContainer = data[i].split('  ').slice(0,5)
      const dataCommand = data[i].split('"')
      const dataCreated = data[i].split('"')[2].trim().split('   ')[0]
      const dataStatus = data[i].split('ago')[1].trim().split('  ')[0]
      let dataPort = data[i].split('ago')[1].trim().split('  ').slice(1).join('')
      const dataName = dataCommand[2].split('  ')[dataCommand[2].split('  ').length - 1].trim()
      dataPort = dataPort.replace(dataName, '').trim()
      const dataContainerTrim = dataContainer.map(item => item.trim())
      const dataJSON = {
        containerID: dataContainerTrim[0],
        image: dataContainerTrim[4],
        command: dataCommand[1],
        created: dataCreated,
        status: `${dataStatus} ago`,
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
    dockerContainer(imagesJSON)
  })
}

exports.dockerContainer = dockerContainer;
exports.createImagesJSON = createImagesJSON

