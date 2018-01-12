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
  }
}

module.exports = validate