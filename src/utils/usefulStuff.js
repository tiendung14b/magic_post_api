

exports.checkField = (user) => {
    const importantFields = ['last_name', 'first_name', 'email', 'phone_number', 'role']
    const userModelFields = ['last_name', 'first_name', 'email', 'phone_number', 'password', 'urlAvatar']
    let hasEmptyField = false
    let emptyFieldMessage = 'Missing required field(s): '
    Object.keys(user).forEach((key) => {
        if (importantFields.includes(key) && !user[key]) {
          hasEmptyField = true
          emptyFieldMessage += `${key} `
        }
    })
    let hasInvalidField = false
    let invalidFieldMessage = 'Having invalid field(s): '
    const notLetterFound = /^[a-z]+$/i
    const onlyNumber = /^\d+$/
    Object.keys(user).forEach((key) => {
        if (userModelFields.includes(key) && user[key]) {
          switch (key) {
            case 'last_name':
                if (!notLetterFound.test(user[key])) {
                    hasInvalidField = true
                    invalidFieldMessage += `${key} `
                }
                break
            case 'first_name':
                if (!notLetterFound.test(user[key])) {
                    hasInvalidField = true
                    invalidFieldMessage += `${key} `
                }
                break
            case 'phone_number':
                if (!onlyNumber.test(user[key])) {
                    hasInvalidField = true
                    invalidFieldMessage += `${key} `
                }
                break
          }
        }
    })
    let checkResult = {}
    checkResult.hasWrongField = hasEmptyField || hasInvalidField
    checkResult.message = ''
    if (hasEmptyField) checkResult.message += emptyFieldMessage + '\\n'
    if (hasInvalidField) checkResult.message += invalidFieldMessage + '\\n'
    
    return checkResult
}

