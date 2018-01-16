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
  REMOVE: "Docker Remove Container",
  PULL: "Docker Pull Image",
  IMAGES: "Docker Images",
  CREATE_CONTAINER: "Create Docker Container",
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
