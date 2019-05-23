const { dockerContainer, dockerPsAll, dockerTableContainer } = require('./dockerContainer');
const { dockerRemoveContainer } = require('./dockerRemoveContainer')
const { createDockerImages, dockerTableImages, dockerRemoveImages } = require('./dockerImage')
const { dockerCompose } = require('./dockerCompose')
const { dockerClean } = require('./dockerClean');

exports.dockerContainer = dockerContainer;
exports.dockerRemoveContainer = dockerRemoveContainer;
exports.dockerPsAll = dockerPsAll;
exports.dockerTableContainer = dockerTableContainer;
exports.createDockerImages = createDockerImages;
exports.dockerTableImages = dockerTableImages;
exports.dockerRemoveImages = dockerRemoveImages;
exports.dockerCompose = dockerCompose;
exports.dockerClean = dockerClean;

