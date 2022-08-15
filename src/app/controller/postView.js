const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/postagem', function (req, res) {
    const { usuario, senha } = req.query
    console.log(req)
    if (usuario !== "pedro" || senha !== "123456") res.status(404).send("Cannot GET " + req.route.path)

    res.sendFile(path.join(__dirname, '..', 'view', 'index.html'));
})

module.exports = app => app.use("/", router);