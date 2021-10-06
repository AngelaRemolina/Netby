const express = require('express');
const router = express.Router();

const pool = require('../database');
const {isLoggedIn, isNotLoggedIn} = require('../lib/auth');

//Only Dahsboard
router.get('/dashboard', isLoggedIn, async(req, res) => {
    res.render('dashboard/dashboard');
});

//Dahsboard users

router.get('/dashboard/users', isLoggedIn, async(req, res) => {
    const users = await pool.query('SELECT * FROM users');// It send to the list and create an array with the users
    res.render('dashboard/users/list',{ users: users});
});

router.get('/dashboard/users/edit/:id',isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const users = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    res.render('./dashboard/users/edit', { user: users[0] });
});

router.post('/dashboard/users/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { fullname, username, email, role, status } = req.body;
    const editUser = {
        fullname,
        username,
        email,
        role,
        status
    };
    await pool.query('UPDATE users set ? WHERE id = ?', [editUser, id]);
    req.flash('success', 'User updated successfully');
    res.redirect('/dashboard/users');
});

router.get('/dashboard/users/delete/:id',isLoggedIn, async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM links WHERE user_id = ?', [id]);
    await pool.query('DELETE FROM users WHERE ID = ?', [id]);
    req.flash('success', 'User deleted successfully');
    res.redirect('/dashboard/users');
});

router.get('/dashboard/users/add', isLoggedIn, (req, res) => {
    res.render('dashboard/users/add');
});

router.post('/dashboard/users/add', isLoggedIn, async (req, res) => {
    const { fullname, username, email, role, status,password} = req.body;
    const newUser = {
        fullname,
        username,
        email,
        role,
        status,
        password
    };
    await pool.query('INSERT INTO users set ?', [newUser]);
    req.flash('success', 'User saved successfully');
    res.redirect('/dashboard/users');
});
module.exports = router;