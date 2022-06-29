const express = require('express');
const router = express.Router();
const path = require('path');
router.get('/postagem', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'view', 'index.html'));
})

module.exports = app => app.use("/", router);