const express = require('express');
const router = express.Router();
const itensModule = require('../modules/itens')

router.get('/itens', async (req, res) => {
    const { pedidoBling } = req.query
    if (pedidoBling == undefined) return res.status(402).send({ message: "Preciso que envie um número referente a bling" })

    try {
        const itens = await itensModule.get(req.query)
        res.send({
            response: {
                itens
            }
        })
    } catch (e) {
        res.status(400).send({ error: "Algo não está certo" })
    }
})

module.exports = app => app.use('/', router)
