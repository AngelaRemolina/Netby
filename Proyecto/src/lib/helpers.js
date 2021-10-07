const bcrypt = require('bcryptjs');

const helpers = {};

helpers.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hash(password, salt);//encrypt the password
    return hash;
};

helpers.matchPassword = async(password, savedPassword) =>{ //Login
    try {
        console.log(password);
        console.log(savedPassword);
        return await bcrypt.compare(password, savedPassword);
    } catch (error) {
        console.log(error);
    }
};

module.exports = helpers;