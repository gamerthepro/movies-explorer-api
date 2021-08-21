const User = require('../models/user');
const NotFoundError = require('../errors/404-NotFoundError');
const BadRequestError = require('../errors/400-BadRequestError');

module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new Error('Такого пользователя не существует');
    })
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Некорректный Id');
      }
      throw new NotFoundError(err.message);
    })
    .catch(next);
};

module.exports.updateUserInfo = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new BadRequestError('Введенные данные о пользователе некорректны');
  }

  User.findByIdAndUpdate(req.user._id, { name, email, password }, {
    new: true,
    runValidators: true,
  })
    .orFail(() => {
      throw new Error('invalidUserId');
    })
    .then((data) => res.status(200).send({ data }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new BadRequestError('Введенные данные некорректны');
      }
      throw new NotFoundError(err.message);
    })
    .catch(next);
};
