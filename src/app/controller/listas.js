const express = require('express');
const router = express.Router();
const listaModule = require('../modules/listas')

router.get('/listas', async (req, res) => {
    try {
        const response = await listaModule.get(req.query)
        res.send({
            response
        })
    } catch (err) {
        console.log(err)
        return res.status(400).send({ error: 'Não foi possível coletar as informações' })
    }
})

router.put('/listas', async (req, res) => {
    const { id, situacao } = req.body
    if (id === undefined || situacao == undefined) {
        return res.status(400).send({ error: 'Não foram passadas as informações necessárias' })
    }
    try {
        await listaModule.put(req.body)
        res.send({
            response: "Atualizado com sucesso!"
        })
    } catch (err) {
        console.log(err)
        return res.status(400).send({ error: 'Não foi possível coletar as informações' })
    }
})
router.post('/listas', async (req, res) => {
    const { canal } = req.body
    if (canal === undefined) {
        return res.status(400).send({ error: 'Não foram passadas as informações necessárias' })
    }
    try {
        await listaModule.post(req.body)
        res.send({
            response: "Enviado com sucesso!"
        })
    } catch (err) {
        console.log(err)
        return res.status(400).send({ error: 'Não foi possível coletar as informações' })
    }
})

module.exports = app => app.use('/', router)