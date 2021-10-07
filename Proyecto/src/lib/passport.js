const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('./helpers');

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    const rows = await pool.query('SELECT * FROM User WHERE email = ?', [email]);
    if (rows.length > 0) {
        const user = rows[0];
        const validPassword = await helpers.matchPassword(password, user.password)
        console.log(validPassword);
        if (validPassword) {
            if(user.name == null){
                done(null, user, req.flash('success', 'Welcome!'));
            } else{
                done(null, user, req.flash('success', 'Welcome ' + user.name));
            }
        } else {
            done(null, false, req.flash('message', 'Incorrect  Email or Password'));
        }
    } else {
        return done(null, false, req.flash('message', 'Incorrect  Email or Password.'));
    }
}));

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {

    const { name } = req.body;
    let newUser = {
        email,
        password,
        name
    };
    newUser.password = await helpers.encryptPassword(password);
    // Saving in the Database
    const result = await pool.query('INSERT INTO User SET ? ', newUser);
    newUser.ID_U = result.insertId;
    return done(null, newUser);
}));

passport.serializeUser((user, done) => {
    done(null, user.ID_U);
});

passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('SELECT * FROM User WHERE ID_U = ?', [id]);
    done(null, rows[0]);
});