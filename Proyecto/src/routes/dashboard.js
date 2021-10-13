const express = require('express');
const router = express.Router();

const pool = require('../database');
const helpers = require('../lib/helpers');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
var fs = require('fs');

//Only Dahsboard
router.get('/dashboard', isLoggedIn, async (req, res) => {
    // TODO: VIEW OF CAPTURES IN DASHBOARD 
    // something like SELECT * FROM captures, capture_has_device, device
    // res.render('dashboard/captures/list');
    res.render('dashboard/dashboard');
});


// Dashboard / captures

router.get('/dashboard/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    // TODO: get edit capture
    // select to show
});

router.post('/dashboard/edit/:id', isLoggedIn, async (req, res) => {
    // TODO: post edit capture
    // update to edit
});

router.get('/dashboard/delete/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;

    // TODO: delete capture 

});

router.get('/dashboard/capture', isLoggedIn, async (req, res) => {
    // TODO: VIEW OF CAPTURES IN DASHBOARD 
    // something like SELECT * FROM captures, capture_has_device, device
    // res.render('dashboard/captures/list');
    res.render('dashboard/dashboard');
});

router.post('/dashboard/capture', isLoggedIn, async (req, res) => {
    // execute sniffer python file to generate json
    const { spawn } = require('child_process');
    const childPython = spawn('python3', ['./packet_sniffer/sniffer.py']);

    // wait for file to be generated
    req.flash('sleeptime', 'Capturing network...');

    // show output in console and alert success or failure
    childPython.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    childPython.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
        req.flash('message', 'An error ocurred during the capture.');
    });
    childPython.on('close', (code) => {
        console.log(`Child process exited with code: ${code}`);
        req.flash('success', 'Capture generated');
    });

    // read json file
    fs.readFile('./capture.json', 'utf8', function (err, data) {
        if (err) throw err;
        var captures = JSON.parse(data); // array with captures
        for (let i = 0; i < captures.length; i++) {
            var frame = captures[i];
            //TODO: STRUCTURE AND SAVE CAPTURE
            console.log(Object.values(frame)[0]);
        }
    });

    //await pool.query('INSERT INTO captures set ?', [newUser]);
    //req.flash('success', 'Capture made succesfully!');
    res.redirect('/dashboard/dashboard');
});



//Dahsboard / users

router.get('/dashboard/users', isLoggedIn, async (req, res) => {
    const users = await pool.query('SELECT * FROM user');// It send to the list and create an array with the users
    res.render('dashboard/users/list', { users: users });
});

router.get('/dashboard/users/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const users = await pool.query('SELECT * FROM user WHERE ID_U = ?', [id]);
    res.render('./dashboard/users/edit', { user: users[0] });
});

router.post('/dashboard/users/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const editUser = {
        name,
        email,
        role
    };
    await pool.query('UPDATE user set ? WHERE ID_U = ?', [editUser, id]);
    req.flash('success', 'User updated successfully');
    res.redirect('/dashboard/users');
});

router.get('/dashboard/users/delete/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    if (id == req.user.ID_U) {
        req.flash('message', "You can't delete yourself!");
        res.redirect('/dashboard/users');
    } else {
        await pool.query('DELETE FROM user WHERE ID_U = ?', [id]);
        req.flash('success', 'User deleted successfully');
        res.redirect('/dashboard/users');
    }
});

router.get('/dashboard/users/add', isLoggedIn, (req, res) => {
    res.render('dashboard/users/add');
});

router.post('/dashboard/users/add', isLoggedIn, async (req, res) => {
    const { name, email, role, password } = req.body;
    const newUser = {
        name,
        email,
        password,
        role
    };
    newUser.password = await helpers.encryptPassword(password);
    await pool.query('INSERT INTO user set ?', [newUser]);
    req.flash('success', 'User saved successfully');
    res.redirect('/dashboard/users');
});


module.exports = router;