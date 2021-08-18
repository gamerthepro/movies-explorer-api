const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/404-NotFoundError');
const BadRequestError = require('../errors/400-BadRequestError');
const AuthorizedError = require('../errors/401-UnauthorizedError');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.signUp = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  if (!email || !password || !name) {
    throw new NotFoundError('Отсутсвуют обязательные данные');
  }

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res
      .status(200)
      .send({ data: { _id: user._id, email: user.email } }))
    .catch((err) => {
      if (err.name === 'MongoError' || err.code === 11000) {
        throw new BadRequestError('Пользователь с таким email уже существует');
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new BadRequestError('Пароль или почта некорректны');
      }
    })
    .catch(next);
};

module.exports.signIn = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Введенные данные о пользователе некорректны');
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'super-secret', { expiresIn: '7d' });
      const data = {
        _id: user._id,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      };
      res
        .status(200)
        .send({ data, token });
    })
    .catch((err) => {
      throw new AuthorizedError(err.message);
    })
    .catch(next);
};