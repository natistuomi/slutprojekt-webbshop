const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../utils/database');
const session = require('express-session');
const { render } = require('nunjucks');
const validator = require('validator');
const promisePool = pool.promise();



module.exports = router;