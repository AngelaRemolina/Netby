const express = require('express');
const router = express.Router();

const pool = require('../database');
const helpers = require('../lib/helpers');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
var fs = require('fs');

//Only Dahsboard
router.get('/dashboard', isLoggedIn, async (req, res) => {
    // TODO: VIEW OF CAPTURES IN DASHBOARD 
    const { id } = req.params;
    const captures = await pool.query('SELECT * FROM capture WHERE user_ID_U = ?', [id]);
    res.render('dashboard/captures/dashboard', {captures, myuser});
});

// Dashboard / captures

router.get('/dashboard/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    // TODO: get edit capture
    // select to show
    res.render('dashboard/captures/edit');
});

router.post('/dashboard/edit/:id', isLoggedIn, async (req, res) => {
    // TODO: post edit capture
    // update to edit
    res.redirect('dashboard/captures/dashboard');
});

router.get('/dashboard/delete/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;

    // TODO: delete capture 
    res.redirect('dashboard/captures/dashboard');
});

router.get('/dashboard/capture', isLoggedIn, async (req, res) => {

    // execute sniffer python file to generate json
    const { spawn } = require('child_process');
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


    /* TODO: wait for file to be generated
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    await sleep(35);
    */


    fs.readFile('./capture.json', 'utf8', async function (err, data) {
        if (err) {
            req.flash('message', 'An error ocurred during the capture.');
        } else {

            var captures = JSON.parse(data); // array with captures

            var times = Object.values(captures[0]);
            var start_time = times[0][0];
            var end_time = times[0][1];
            var last_id = await pool.query('SELECT max(ID_C) AS max_id FROM capture');
            var new_id = 0;
            if (last_id != null) {
                new_id = last_id[0].max_id;
                new_id = new_id + 1;
            }
            const newCapture = {
                ID_C: new_id,
                user_ID_U: req.user.ID_U,
                start_time: start_time,
                end_time: end_time
            }
            await pool.query('INSERT INTO capture set ?', [newCapture]);

            for (let i = 1; i < captures.length - 1; i++) {
                // initialize variables
                var mac_dest = null;
                var mac_source = null;
                var proto = null;
                var ipv4_source = null;
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
                var frame_dict = Object.values(frame)[0];
                if (Object.keys(frame_dict).includes('Description')) {
                    var dest_src_proto = String(frame_dict.Description).split(",");
                    mac_dest = dest_src_proto[0].substring(13, dest_src_proto[0].length)
                    mac_source = dest_src_proto[1].substring(9, dest_src_proto[1].length)
                    proto = dest_src_proto[2].substring(11, dest_src_proto[2].length)
                }
                if (Object.keys(frame_dict).includes('IPv4_Packet')) {
                    var ipv4_src_target = String(frame_dict.IPv4_Packet).split(",");
                    ipv4_source = ipv4_src_target[4].substring(9, ipv4_src_target[4].length)
                    ipv4_target = ipv4_src_target[5].substring(9, ipv4_src_target[5].length)
                }
                if (Object.keys(frame_dict).includes('ICMP_Packet')) {
                    icmp_packet = String(frame_dict.ICMP_Packet);
                    if(icmp_packet.length > 100){
                        icmp_packet = icmp_packet.substring(0,98);
                    }
                }
                if (Object.keys(frame_dict).includes('ICMP_Data')) {
                    icmp_data = String(frame_dict.ICMP_Data);
                    if(icmp_data.length > 200){
                        icmp_data = icmp_data.substring(0,198);
                    }
                }
                if (Object.keys(frame_dict).includes('TCP_Segment')) {
                    tcp_segment = String(frame_dict.TCP_Segment);
                    if(tcp_segment.length > 200){
                        tcp_segment = tcp_segment.substring(0,198);
                    }
                }
                if (Object.keys(frame_dict).includes('TCP_flags')) {
                    tcp_flags = String(frame_dict.tcp_flags);
                    if(tcp_flags.length > 200){
                        tcp_flags = tcp_flags.substring(0,198);
                    }
                }
                if (Object.keys(frame_dict).includes('TCP_Data')) {
                    tcp_data = String(frame_dict.TCP_Data);
                    if(tcp_data.length > 200){
                        tcp_data = tcp_data.substring(0,198);
                    }
                }
                if (Object.keys(frame_dict).includes('HTTP_Data')) {
                    http_data = String(frame_dict.HTTP_Data);
                    if(http_data.length > 200){
                        http_data = http_data.substring(0,198);
                    }
                }
                if (Object.keys(frame_dict).includes('UDP_Segment')) {
                    udp_segment = String(frame_dict.UDP_Segment);
                    if(udp_segment.length > 200){
                        udp_segment = udp_segment.substring(0,198);
                    }
                }
                if (Object.keys(frame_dict).includes('Other_IPv4_Data')) {
                    other_ipv4_data = String(frame_dict.Other_IPv4_Data);
                    if(other_ipv4_data.length > 200){
                        other_ipv4_data = other_ipv4_data.substring(0,198);
                    }
                }
                if (Object.keys(frame_dict).includes('Ethernet_Data')) {
                    ethernet_data = String(frame_dict.Ethernet_Data);
                    if(ethernet_data.length > 200){
                        ethernet_data = ethernet_data.substring(0,198);
                    }
                }
                const newFrame = {
                    capture_ID_C: new_id,
                    capture_user_ID_U: req.user.ID_U,
                    mac_dest: mac_dest,
                    mac_source: mac_source,
                    proto: proto,
                    ipv4_source: ipv4_source,
                    ipv4_target: ipv4_target,
                    icmp_packet: icmp_packet,
                    icmp_data: icmp_data,
                    tcp_segment: tcp_segment,
                    tcp_flags: tcp_flags,
                    tcp_data: tcp_data,
                    http_data: http_data,
                    udp_segment: udp_segment,
                    other_ipv4_data: other_ipv4_data,
                    ethernet_data: ethernet_data
                };

                await pool.query('INSERT INTO frame set ?', [newFrame]);

            }
        }
    });

    //req.flash('success', 'Capture made succesfully!');
    res.redirect('/dashboard');
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