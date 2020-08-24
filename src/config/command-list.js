const INQUIRER = {
  list: 'list',
  rawlist: 'rawlist',
  expand: 'expand',
  checkbox: 'checkbox',
  confirm: 'confirm',
  input: 'input',
  password: 'password',
}

const COMMANDS = {
  PS_ALL: "Docker Container Status",
  COMPOSE: "Docker Compose",
  REMOVE: "Docker Remove Container",
  BUILD_IMAGE: "Build Docker Image",
  PULL: "Docker Pull Images",
  IMAGES: "Docker Remove Images",
  CREATE_CONTAINER: "Create Docker Container",
  CLEAN: "Docker Clean",
}

const HEADER = {
  CONTAINER_ID: 'CONTAINER ID',
  IMAGE: 'IMAGE',
  COMMAND: 'COMMAND',
  CREATED: 'CREATED',
  STATUS: 'STATUS',
  PORT: 'PORT',
  NAMES: 'NAMES',
}

exports.INQUIRER = INQUIRER
exports.COMMANDS = COMMANDS
exports.HEADER = HEADER
