const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../utils/database');
const session = require('express-session');
const { render } = require('nunjucks');
const validator = require('validator');
const { runInNewContext } = require('vm');
const { Console } = require('console');
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
    const [rows] = await promisePool.query('SELECT * FROM nt19cart WHERE nt19cart.userId = ?', [req.session.userId]);
    const [name] = await promisePool.query('SELECT * FROM nt19products');
    res.render('cart.njk', {
        title: 'Varukorg',
        loggedIn: req.session.userId||0,
        rows: rows,
        name: name
    });
});

router.post('/addToCart', async function(req, res, next){
    const productId = req.body.productId;
    if(req.session.loggedin){
        // if userId AND productId already exists in cart -> add amount
        const oldCart = await promisePool.query('SELECT * FROM nt19cart WHERE userId = ? AND productId = ?', [req.session.userId, productId]);
        if(oldCart.length > 0){
            const newAmount = oldCart[0][0].amount + 1;
            await promisePool.query('UPDATE nt19cart SET amount = ? WHERE userID = ? AND productId = ?', [newAmount, req.session.userId, productId]);
        }
        else{
            await promisePool.query('INSERT INTO nt19cart (userId, productId) VALUES (?, ?)', [req.session.userId, productId]);
        }
        res.redirect('/');
    }
    else{
        res.redirect('/login');
    }
});

router.post('/removeFromCart', async function(req, res, next){
    const cartId = req.body.id;
    console.log(cartId);
    if(req.session.loggedin){
        await promisePool.query('DELETE FROM nt19cart WHERE id = ?', [cartId]);
        res.redirect('/cart');
    }
    else{
        res.redirect('/login');
    }
});

//router för beställningar

router.post('/placeOrder', async function(req, res, next){
    //customer X, customerId X, total
    //orderId ^, productId, amount
    const customerId = req.session.userId;
    const names = await promisePool.query('SELECT * FROM nt19loginInfo WHERE id = ?', [customerId]);
    const customer = names[0][0].firstname + " " + names[0][0].lastname;
    const products = await promisePool.query('SELECT * FROM nt19cart WHERE userId = ?', [req.session.userId]);
    let total = 0;
    for(let i = 0; i < products.length; i++){
        total += (products[0][i].amount * products[0][i].price);
    }
    if(req.session.loggedin){
        //INSERT order
        await promisePool.query('INSERT INTO nt19orders (customer, total, customerId) VALUES (?,?,?)', [customer, total, req.session.userId]);
        //INSERT orderedProducts
        const orderId = await promisePool.query('SELECT id FROM nt19orders WHERE customerId = ? ORDER BY dated DESC', [req.session.userId]);
        for(let i = 0; i < products.length; i++){
            await promisePool.query('INSERT INTO nt19orderedProducts (orderId, productId, amount) VALUES (?,?,?)', [orderId[0], product[0][i].id, product[0][i].amount]);
        }
        //Empty cart
        res.redirect('/cart');
    }
    else{
        res.redirect('/login');
    }
});

module.exports = router;