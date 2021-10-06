// @ts-nocheck
const express = require('express');
const router = express.Router();

const pool = require('../database');
const {isLoggedIn} = require('../lib/auth')


router.get('/', isLoggedIn, async (req, res) => {
    const releases = await pool.query('SELECT * FROM releases WHERE user_id = ?', [req.user.id]);
    res.render('releases/list', { releases });// It send to the list and create an array with the releases
});

router.get('/add', isLoggedIn, (req, res) => {
    res.render('releases/add');
});

router.post('/add', isLoggedIn, async (req, res) => {
    const { release_type, title, artists, genre  } = req.body;
    const newRelease = {
        release_type,
        title,
        artists,
        genre,
        user_id:req.user.id,
    };
    await pool.query('INSERT INTO releases set ?', [newRelease]);
    req.flash('success', 'Released saved successfully');
    res.redirect('/releases');
});


router.get('/delete/:id',isLoggedIn, async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM releases WHERE ID = ?', [id]);
    req.flash('success', 'Release deleted successfully');
    res.redirect('/releases');
});

router.get('/edit/:id',isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const releases = await pool.query('SELECT * FROM releases WHERE id = ?', [id]);
    res.render('releases/edit', { release: releases[0] });
});

router.post('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { release_type, title, artists, genre  } = req.body;
    const newRelease = {
        release_type,
        title,
        artists,
        genre,
        user_id:req.user.id,
    };
    await pool.query('UPDATE releases set ? WHERE id = ?', [newRelease, id]);
    req.flash('success', 'Release updated successfully');
    res.redirect('/releases');
});

module.exports = router;