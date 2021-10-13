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
    var end, start;

    // execute sniffer python file to generate json
    const { spawn } = require('child_process');
    start = new Date();
    console.log("INICIOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO")
    console.log(start);
    const childPython = await spawn('python3', ['./packet_sniffer/sniffer.py']);


    // wait for file to be generated
    //show load bar while waiting
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

    end = new Date();

    console.log("FINNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN")
    console.log(end);
    // await pool.query(`INSERT INTO capture (user_ID_U, start_time, end_time) VALUES (${req.user.ID_U},"${start.toJSON()}","${end.toJSON()}")`);

    /*// TODO: wait for file to be generated
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    await sleep(35);
    */


    fs.readFile('./capture.json', 'utf8', async function (err, data) {
        if (err) {

            req.flash('message', 'An error ocurred during the capture.');
        };
        var captures = JSON.parse(data); // array with captures
        for (let i = 0; i < captures.length; i++) {
            // initialize variables
            var mac_dest = null;
            var mac_source = null;
            var proto = null;
            var ipv4_sorce = null;
            var ipv4_target = null;
            var icmp_packet = null;
            var icmp_data = null;
            var tcp_segment = null;
            var tcp_flags = null;
            var tcp_data = null;
            var http_data = null;
            var udp_segment = null;
            var other_ipv4_data = null;
            var ethernet_data = null;

            var frame = captures[i];
            //TODO: STRUCTURE AND SAVE CAPTURE
            var dest_src_proto = String(Object.values(frame)[0].Description).split(",");
            var mac_dest = dest_src_proto[0].substring(13, dest_src_proto[0].length)
            var mac_source = dest_src_proto[1].substring(9, dest_src_proto[1].length)
            var proto = dest_src_proto[2].substring(11, dest_src_proto[2].length)

            var dest_src_proto = String(Object.values(frame)[0].IPv4_Packet).split(",");
            console.log(mac_dest);
            console.log(mac_source);
            console.log(proto);
            const newCapture = {
                user_ID_U: req.user.ID_U,
                start_time: start.toJSON(),
                end_time: end.toJSON(),
                mac_dest: mac_dest,
                mac_source: mac_source,
                proto: proto/*,
                    ipv4_sorce : ipv4_sorce,
                    ipv4_target : ipv4_target,
                    icmp_packet : icmp_packet,
                    icmp_data : icmp_data,
                    tcp_segment : tcp_segment,
                    tcp_flags : tcp_flags,
                    tcp_data : tcp_data,
                    http_data : http_data,
                    udp_segment : udp_segment,
                    other_ipv4_data : other_ipv4_data,
                    ethernet_data : ethernet_data*/
            };

            await pool.query('INSERT INTO capture set ?', [newCapture]);

        }
    });


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