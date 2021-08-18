const users = require('express').Router();
const {updateUserInfo} = require('../controllers/users');
const {userInfoValidation} = require('../middlewares/validation');

users.get('/me', idValidation, getUserInfo);
users.patch('/me', userInfoValidation, updateUserInfo);

module.exports = users;
