const fs = require('fs-extra')
const shell = require('shelljs')
const { createTable, path } = require('../utils');
const dockerJSON = path('./src/docker/docker.json');

const getDockerImages = (images) => {
  const tableContainer = createTable(['REPOSITORY']);
  const dockerStatus = images.map(item => ([
    item
  ]));
  tableContainer.push(...dockerStatus);
  console.log(tableContainer.toString());
};

const createDockerImages = async (cmdName) => {
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
    getDockerImages(dataJSON)
  })
}

exports.getDockerImages = getDockerImages
exports.createDockerImages = createDockerImages 