const express = require('express');
const router = express.Router();

const pool = require('../database');
const helpers = require('../lib/helpers');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

router.get('/statistics/graphic1', isLoggedIn, async (req, res) => {
    const data_bar_graph = await pool.query('SELECT email, count(*) as count FROM capture, user WHERE user_id_u = id_u GROUP BY user_id_u');
    var counts = data_bar_graph
    var users_list = []
    var counts_list = []
    for (let i = 0; i < counts.length; i++) {
        const element = counts[i];
        users_list.push(element.email)
        counts_list.push(element.count)
    }

    console.log(users_list);
    console.log(counts_list);

    res.render("dashboard/statistics/graphic1", { users_list, counts_list });
});

router.get('/statistics/graphic2', isLoggedIn, async (req, res) => {
    const data_pie_graph = await pool.query('SELECT capture_id_c, count(*) as count FROM frame GROUP BY capture_id_c');
    var counts = data_pie_graph
    var id_list = []
    var counts_list = []
    for (let i = 0; i < counts.length; i++) {
        const element = counts[i];
        id_list.push(element.capture_id_c)
        counts_list.push(element.count)
    }

    console.log(id_list);
    console.log(counts_list);

    res.render("dashboard/statistics/graphic2", {id_list, counts_list});

});

router.get('/statistics/graphic3', isLoggedIn, async (req, res) => {

});

module.exports = router;