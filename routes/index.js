const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../utils/database');
const session = require('express-session');
const { render } = require('nunjucks');
const validator = require('validator');
const { runInNewContext } = require('vm');
const promisePool = pool.promise();

//router för förstasidan
router.get('/', async function(req, res, next){
    const [rows] = await promisePool.query("SELECT * FROM nt19products");
    res.render('index.njk', {
        title: 'Homepage',
        rows: rows,
        loggedIn: req.session.userId||0
    });
});

//router för loginsidan
router.get('/login', function(req, res, next){
    res.render('login.njk', {
        title: 'Login',
        loggedIn: req.session.userId||0
    });
});

router.post('/login', async function (req, res, next) {
    const { username, password } = req.body;
    if(username.length === 0){
        res.json('Username is Required');
    }
    else if(password.length === 0){
        res.json('Password is Required');
    }
    else{
        const [rowsname, query] = await promisePool.query('SELECT username FROM nt19loginInfo WHERE username = ?', [username]);
        if(rowsname.length > 0 ){
            const [rows, query] = await promisePool.query('SELECT password FROM nt19loginInfo WHERE username = ?', [username]);
            const bcryptPassword = rows[0].password
            const userId = await promisePool.query("SELECT nt19loginInfo.id FROM nt19loginInfo WHERE username = ?", [username]);
            bcrypt.compare(password, bcryptPassword , function(err, result) {
                if(result){
                    req.session.loggedin = true;
                    req.session.username = username;
                    req.session.userId = userId[0][0].id;
                    res.redirect('/');
                }
                else{ 
                    res.json('Invalid username or password');
                }
            });
        }
        else{
            res.json('Invalid username or password');
        }
    }
});

router.get('/bcrypt/:pwd', function (req, res ,next){
    bcrypt.hash(req.params.pwd, 10, function (err, hash) {
        return res.json(hash);
    });
});

//router för registersidan
router.get('/register', function(req, res, next){
    res.render('register.njk', {
        title: 'Register',
        loggedIn: req.session.userId||0
    });
});

router.post('/register', async function(req, res, next){
    const { firstname, lastname, username, password, passwordConfirmation, } = req.body;
    if(username.length < 6) {
        res.json('Username must be at least 6 characters');
    }
    else if(password.length < 8){
        res.json('Password must be at least 8 characters');
    }
    else if(firstname.length == 0){
        res.json('Firstname is missing');
    }
    else if(lastname.length == 0){
        res.json('Lastname is missing');
    }
    else if(passwordConfirmation !== password){
        res.json('Passwords do not match');
    } 
    else if(password === username){
        res.json('Username and password can not be identical');
    }
    else {
        const [user, query] = await promisePool.query('SELECT username FROM nt19loginInfo WHERE username = ?', [username]);
        if(user.length > 0 ){
            res.json('Username is already taken')
        }
        else{
            bcrypt.hash (password, 10, async function(err, hash){
                await promisePool.query('INSERT INTO nt19loginInfo (firstname, lastname, username, password, accessLevel) VALUES (?, ?, ?, ?, ?)', [firstname, lastname, username, hash, 0]);
                res.redirect('/login');
            });                
        }
    }
});

//router för varukorgen
router.get('/cart', async function(req, res, next){
    const [rows] = await promisePool.query("SELECT nt19cart.* WHERE nt19userId = ?, nt19products.name AS product FROM nt19cart JOIN nt19products on nt19cart.productId = nt19products.id", [req.session.userId]);
    res.render('cart.njk', {
        title: 'Varukorg',
        loggedIn: req.session.userId||0,
        rows: rows
    });
});

router.post('/addToCart', async function(req, res, next){
    req.session.userId
    const {productId} = req.body;
    if(req.session.loggedIn){
        const [rows] = await promisePool.query("INSERT INTO nt19cart (userId, productId) VALUES (?, ?)', [req.session.userId, productId]");
        res.redirect('/');
    }
    else{
        res.redirect('/login');
    }
});

module.exports = router;