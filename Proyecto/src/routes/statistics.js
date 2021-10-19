const express = require('express');
const router = express.Router();

const pool = require('../database');
const helpers = require('../lib/helpers');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

router.get('/statistics', isLoggedIn, async (req, res) => {
    const { id } = req.params
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
    
    res.render("dashboard/statistics/graphics",{users_list,counts_list});
});

module.exports = router;