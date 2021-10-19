const express = require('express');
const router = express.Router();

const pool = require('../database');
const helpers = require('../lib/helpers');
const { isLoggedIn, isNotLoggedIn, isNotAdmin } = require('../lib/auth');
var fs = require('fs');
const { json } = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

//Only Dahsboard
router.get('/dashboard', isLoggedIn, async (req, res) => {
    if (req.user.role === 0) {
        // Admin view code
        const captures = await pool.query('SELECT ID_C,email,start_time,end_time FROM user u, capture c WHERE c.user_id_u = u.id_u');
        const numberCaptures = await pool.query('SELECT COUNT(*) as count FROM capture');
        res.render('dashboard/captures/dashboard', { captures, numberCaptures: numberCaptures[0].count });
    } else if (req.user.role === 1) {
        // Client view code
        const captures = await pool.query('SELECT * FROM capture WHERE user_ID_U = ?', [req.user.ID_U]);
        const numberCaptures = await pool.query('SELECT COUNT(*) as count FROM capture WHERE user_ID_U = ?', [req.user.ID_U]);
        res.render('dashboard/captures/dashboard', { captures: captures, numberCaptures: numberCaptures[0].count });
    }
});
router.get('/dashboard/listframe/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params
    const frame = await pool.query('SELECT * FROM frame WHERE capture_ID_C = ?', [id]);
    res.render('dashboard/captures/listframe', { frame: frame });
});
// Dashboard / captures

router.get('/dashboard/deleteCapture/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;

    if (req.user.role == 1) {
        const isOwN = await pool.query('SELECT * FROM capture WHERE ID_C = ? AND user_id_u = ?', [id, req.user.ID_U]);
        console.log(isOwN)
        if (isOwN == '') {
            console.log('you cant delete this capture because no is yours')
            req.flash('message', 'You cant delete this capture because not is yours');
            res.redirect('/dashboard');
        }
    } else {
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        await pool.query('DELETE FROM frame WHERE capture_ID_C = ?', [id]);
        await pool.query('DELETE FROM capture WHERE ID_C = ?', [id]);
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');

        req.flash('success', 'Capture deleted successfully');
        res.redirect('/dashboard');
    }
});

router.get('/dashboard/capture', isLoggedIn, async (req, res) => {
    req.flash('sleeptime', 'Capturing network...');

    const getCapture = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/generate')
            const resp = await response.json();
            console.log("Obj returned from server", resp)
        } catch (error) {
            console.log('Fetch error: ', error);
        }
    }

    getCapture()
    res.redirect('/dashboard');
});

router.get('/dashboard/read_capture', isLoggedIn, async (req, res) => {

    //get capture from python

    fetch('http://127.0.0.1:5000/return_capture')
        .then(function (response) {
            return response.json(); // But parse it as JSON this time
        })
        .then(async function (captures) {
            console.log('JS got the capture!');
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
                var https_data = null;
                var ftp_data = null;
                var ftps_data = null;
                var smtp_data = null;
                var pop3_data = null;
                var udp_segment = null;
                var dns_data = null;
                var dhcp_data = null;
                var other_ipv4_data = null;
                var ethernet_data = null;

                var frame = captures[i];
                var frame_dict = Object.values(frame)[0];
                var frame_dict_keys = Object.keys(frame_dict);
                if (frame_dict_keys.includes('Description')) {
                    var dest_src_proto = String(frame_dict.Description).split(",");
                    mac_dest = dest_src_proto[0].substring(13, dest_src_proto[0].length)
                    mac_source = dest_src_proto[1].substring(9, dest_src_proto[1].length)
                    proto = dest_src_proto[2].substring(11, dest_src_proto[2].length)
                }
                if (frame_dict_keys.includes('IP_Packet')) {
                    var ipv4_src_target = String(frame_dict.IP_Packet).split(",");
                    ipv4_source = ipv4_src_target[4].substring(9, ipv4_src_target[4].length)
                    ipv4_target = ipv4_src_target[5].substring(9, ipv4_src_target[5].length)
                }
                if (frame_dict_keys.includes('ICMP_Packet')) {
                    icmp_packet = String(frame_dict.ICMP_Packet);
                    if (icmp_packet.length > 100) {
                        icmp_packet = icmp_packet.substring(0, 98);
                    }
                }
                if (frame_dict_keys.includes('ICMP_Data')) {
                    icmp_data = String(frame_dict.ICMP_Data);
                    if (icmp_data.length > 200) {
                        icmp_data = icmp_data.substring(0, 198);
                    }
                }
                if (frame_dict_keys.includes('TCP_Segment')) {
                    tcp_segment = String(frame_dict.TCP_Segment);
                    if (tcp_segment.length > 200) {
                        tcp_segment = tcp_segment.substring(0, 198);
                    }
                }
                if (frame_dict_keys.includes('TCP_flags')) {
                    tcp_flags = String(frame_dict.TCP_flags);
                    if (tcp_flags.length > 200) {
                        tcp_flags = tcp_flags.substring(0, 198);
                    }
                }
                if (frame_dict_keys.includes('TCP_Data')) {
                    tcp_data = String(frame_dict.TCP_Data);
                    if (tcp_data.length > 200) {
                        tcp_data = tcp_data.substring(0, 198);
                    }
                }
                if (frame_dict_keys.includes('HTTP_Data')) {
                    http_data = String(frame_dict.HTTP_Data);
                    if (http_data.length > 200) {
                        http_data = http_data.substring(0, 198);
                    }
                }
                if (frame_dict_keys.includes('HTTPS_Data')) {
                    https_data = String(frame_dict.HTTPS_Data);
                    if (https_data.length > 200) {
                        https_data = https_data.substring(0, 198);
                    }
                }
                if (frame_dict_keys.includes('FTP_Data')) {
                    ftp_data = String(frame_dict.FTP_Data);
                    if (ftp_data.length > 200) {
                        ftp_data = ftp_data.substring(0, 198);
                    }
                }
                if (frame_dict_keys.includes('FTPS_Data')) {
                    ftps_data = String(frame_dict.FTPS_Data);
                    if (ftps_data.length > 200) {
                        ftps_data = ftps_data.substring(0, 198);
                    }
                }
                if (frame_dict_keys.includes('SMTP_Data')) {
                    smtp_data = String(frame_dict.SMTP_Data);
                    if (smtp_data.length > 200) {
                        smtp_data = smtp_data.substring(0, 198);
                    }
                }
                if (frame_dict_keys.includes('POP3_Data')) {
                    pop3_data = String(frame_dict.POP3_Data);
                    if (pop3_data.length > 200) {
                        pop3_data = pop3_data.substring(0, 198);
                    }
                }
                if (frame_dict_keys.includes('UDP_Segment')) {
                    udp_segment = String(frame_dict.UDP_Segment);
                    if (udp_segment.length > 200) {
                        udp_segment = udp_segment.substring(0, 198);
                    }
                }
                if (frame_dict_keys.includes('DNS_Data')) {
                    dns_data = String(frame_dict.DNS_Data);
                    if (dns_data.length > 200) {
                        dns_data = dns_data.substring(0, 198);
                    }
                }
                if (frame_dict_keys.includes('DHCP_Data')) {
                    dhcp_data = String(frame_dict.DHCP_Data);
                    if (dhcp_data.length > 200) {
                        dhcp_data = dhcp_data.substring(0, 198);
                    }
                }
                if (frame_dict_keys.includes('Other_IPv4_Data')) {
                    other_ipv4_data = String(frame_dict.Other_IPv4_Data);
                    if (other_ipv4_data.length > 200) {
                        other_ipv4_data = other_ipv4_data.substring(0, 198);
                    }
                }
                if (frame_dict_keys.includes('Ethernet_Data')) {
                    ethernet_data = String(frame_dict.Ethernet_Data);
                    if (ethernet_data.length > 200) {
                        ethernet_data = ethernet_data.substring(0, 198);
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
                    https_data: https_data,
                    ftp_data: ftp_data,
                    ftps_data: ftps_data,
                    smtp_data: smtp_data,
                    pop3_data: pop3_data,
                    udp_segment: udp_segment,
                    dns_data: dns_data,
                    dhcp_data: dhcp_data,
                    udp_segment: udp_segment,
                    other_ipv4_data: other_ipv4_data,
                    ethernet_data: ethernet_data
                };

                await pool.query('INSERT INTO frame set ?', [newFrame]);

            }

        })

    res.redirect('/dashboard');
});
//Dahsboard / users

router.get('/dashboard/users', isLoggedIn, isNotAdmin, async (req, res) => {
    const users = await pool.query('SELECT * FROM user');// It send to the list and create an array with the users
    res.render('dashboard/users/list', { users: users });
});

router.get('/dashboard/users/edit/:id', isLoggedIn, isNotAdmin, async (req, res) => {
    const { id } = req.params;
    const users = await pool.query('SELECT * FROM user WHERE ID_U = ?', [id]);
    res.render('./dashboard/users/edit', { user: users[0] });
});

router.post('/dashboard/users/edit/:id', isLoggedIn, isNotAdmin, async (req, res) => {
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

router.get('/dashboard/users/delete/:id', isLoggedIn, isNotAdmin, async (req, res) => {
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

router.get('/dashboard/users/add', isLoggedIn, isNotAdmin, (req, res) => {
    res.render('dashboard/users/add');
});

router.post('/dashboard/users/add', isLoggedIn, isNotAdmin, async (req, res) => {
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