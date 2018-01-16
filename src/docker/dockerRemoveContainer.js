const { dockerTableContainer } = require('./dockerContainer')

const dockerRemoveContainer = async (containers) => {
  dockerTableContainer(containers)
}

exports.dockerRemoveContainer = dockerRemoveContainer