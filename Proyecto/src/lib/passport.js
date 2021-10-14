const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('./helpers');

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    const rows = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
    if (rows.length > 0) {
        const user = rows[0];
        const validPassword = await helpers.matchPassword(password, user.password)
        if (validPassword) {
            if (user.name == null) {
                done(null, user, req.flash('success', 'Welcome!'));
            } else {
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
        name,
        role: 1 //the user is created as a client by default, need permission from an admin, to become one.
    };
    newUser.password = await helpers.encryptPassword(password);

    const rows = await pool.query('SELECT * FROM user WHERE email = ?', [newUser.email]);
    if (rows.length == 0) { //if email is unique
        // Saving in the Database
        const result = await pool.query('INSERT INTO user SET ? ', newUser);
        newUser.ID_U = result.insertId;
        return done(null, newUser);
    } else {
        
        return done(null, false, req.flash('message',"This email has an account registered."));
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.ID_U);
});

passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('SELECT * FROM user WHERE ID_U = ?', [id]);
    done(null, rows[0]);
});