const isEmpty = require('lodash/isEmpty')

const validate = {
  /**
   * Validate Number
   * @param {string} value
   * @return {string}
   */
  number: (value) => {
    const pass = value.match(
      /^[1-9]\d*$/gm
    )
    if (!value) return 'Please enter a valid number' 
    if (pass) return true
    return 'Please enter a valid number'
  },
  min: (value, number = 1) => value.length < number,
  email: (value) =>
    (!isEmpty(value) && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) ?
      'Please enter a valid email address.' : true
}

module.exports = validate