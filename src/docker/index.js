const { dockerContainer, dockerPsAll, dockerTableContainer, dockerCreateContainer } = require('./dockerContainer');
const { dockerRemoveContainer } = require('./dockerRemoveContainer')
const { createDockerImages, dockerTableImages, dockerRemoveImages } = require('./dockerImage')
const { dockerCompose } = require('./dockerCompose')
const { dockerClean } = require('./dockerClean');

exports.dockerContainer = dockerContainer;
exports.dockerRemoveContainer = dockerRemoveContainer;
exports.dockerCreateContainer = dockerCreateContainer;
exports.dockerPsAll = dockerPsAll;
exports.dockerTableContainer = dockerTableContainer;
exports.createDockerImages = createDockerImages;
exports.dockerTableImages = dockerTableImages;
exports.dockerRemoveImages = dockerRemoveImages;
exports.dockerCompose = dockerCompose;
exports.dockerClean = dockerClean;

