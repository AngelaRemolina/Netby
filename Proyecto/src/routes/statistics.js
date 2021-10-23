const express = require('express');
const router = express.Router();

const pool = require('../database');
const helpers = require('../lib/helpers');
const { isLoggedIn, isNotLoggedIn, isNotAdmin } = require('../lib/auth');

router.get('/statistics/graphic1', isLoggedIn, isNotAdmin, async (req, res) => {
    const captures_count = await pool.query('select count(*) from capture');
    var headers = Array.from({length: Object.values(captures_count[0])[0]}, (_, i) => i + 1)
    console.log(headers)
    //http
    http_list = []
    const http_set = await pool.query('SELECT sum(LENGTH(tcp_data)) as tcp, sum(LENGTH(http_data)) as http, sum(LENGTH(other_ipv4_data)) as other FROM frame where http_data is not NULL GROUP BY capture_id_c');
    for (let i = 0; i < http_set.length; i++) {
        const capture1 = http_set[i];
        var http_bytes = (Object.values(capture1)).reduce((a, b) => a + b, 0);
        var http_mbs = ((http_bytes*0.001)/1024)/30 //Megabyte per second
        http_list.push(http_mbs)
        headers.push(i+1)
    }
    //https
    https_list = []
    const https_set = await pool.query('SELECT sum(LENGTH(tcp_data)) as tcp, sum(LENGTH(https_data)) as https, sum(LENGTH(other_ipv4_data)) as other FROM frame where https_data is not NULL GROUP BY capture_id_c');
    for (let i = 0; i < https_set.length; i++) {
        const capture2 = https_set[i];
        var https_bytes = (Object.values(capture2)).reduce((a, b) => a + b, 0);
        var https_mbs = ((https_bytes*0.001)/1024)/30 //Megabyte per second
        https_list.push(https_mbs)
    }
    //ftp
    ftp_list = []
    const ftp_set = await pool.query('SELECT sum(LENGTH(tcp_data)) as tcp, sum(LENGTH(ftp_data)) as https, sum(LENGTH(other_ipv4_data)) as other FROM frame where ftp_data is not NULL GROUP BY capture_id_c');
    for (let i = 0; i < ftp_set.length; i++) {
        const capture3 = ftp_set[i];
        var ftp_bytes = (Object.values(capture3)).reduce((a, b) => a + b, 0);
        var ftp_mbs = ((ftp_bytes*0.001)/1024)/30 //Megabyte per second
        ftp_list.push(ftp_mbs)
    }

    var counts = [http_list,https_list,ftp_list] //[0.2,0.5,0.5,...],[],[],[]
    console.log(counts)
    /*
    var values = data_pie_graph[0];
    var counts = [values.http, values.https, values.ftp, values.dns, values.smtp, values.pop, values.dhcp]
    var full_100 = counts.reduce((a, b) => a + b, 0);
    var http = 'HTTP: ' + String(((values.http * 100) / full_100).toFixed(2)) + '%';
    var https = 'HTTPS: ' + String(((values.https * 100) / full_100).toFixed(2)) + '%';
    var ftp = 'FTP: ' + String(((values.ftp * 100) / full_100).toFixed(2)) + '%';
    var dns = 'DNS: ' + String(((values.dns * 100) / full_100).toFixed(2)) + '%';
    var smtp = 'SMTP: ' + String(((values.smtp * 100) / full_100).toFixed(2)) + '%';
    var pop = 'POP3: ' + String(((values.pop * 100) / full_100).toFixed(2)) + '%';
    var dhcp = 'DHCP: ' + String(((values.dhcp * 100) / full_100).toFixed(2)) + '%';
    var headers = [http, https, ftp, dns, smtp, pop, dhcp]
    res.render("dashboard/statistics/graphic3", { headers, counts });*/
});

router.get('/statistics/graphic2', isLoggedIn, isNotAdmin, async (req, res) => {
    const data_radar_graph = await pool.query('SELECT capture_id_c, count(*) as count FROM frame GROUP BY capture_id_c');
    var counts = data_radar_graph
    var id_list = []
    var counts_list = []
    for (let i = 0; i < counts.length; i++) {
        const element = counts[i];
        id_list.push(element.capture_id_c)
        counts_list.push(element.count)
    }

    console.log(id_list);
    console.log(counts_list);

    res.render("dashboard/statistics/graphic2", { id_list, counts_list });

});

router.get('/statistics/graphic3', isLoggedIn, isNotAdmin, async (req, res) => {
    const data_pie_graph = await pool.query('SELECT count(http_data) as http, count(https_data) as https, count(ftp_data) as ftp, count(dns_data) as dns, count(smtp_data) as smtp, count(pop3_data) as pop, count(dhcp_data) as dhcp FROM frame');
    var values = data_pie_graph[0];
    var counts = [values.http, values.https, values.ftp, values.dns, values.smtp, values.pop, values.dhcp]
    var full_100 = counts.reduce((a, b) => a + b, 0);
    var http = 'HTTP: ' + String(((values.http * 100) / full_100).toFixed(2)) + '%';
    var https = 'HTTPS: ' + String(((values.https * 100) / full_100).toFixed(2)) + '%';
    var ftp = 'FTP: ' + String(((values.ftp * 100) / full_100).toFixed(2)) + '%';
    var dns = 'DNS: ' + String(((values.dns * 100) / full_100).toFixed(2)) + '%';
    var smtp = 'SMTP: ' + String(((values.smtp * 100) / full_100).toFixed(2)) + '%';
    var pop = 'POP3: ' + String(((values.pop * 100) / full_100).toFixed(2)) + '%';
    var dhcp = 'DHCP: ' + String(((values.dhcp * 100) / full_100).toFixed(2)) + '%';
    var headers = [http, https, ftp, dns, smtp, pop, dhcp]
    res.render("dashboard/statistics/graphic3", { headers, counts });
});

module.exports = router;