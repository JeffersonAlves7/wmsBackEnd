const express = require('express');
const router = express.Router();
const pedidosModule = require('../modules/pedidos')

router.get('/pedidos', async (req, res) => {
    try {
        const response = await pedidosModule.get(req.query)
        res.send({
            response
        })
    } catch (e) {
        res.status(400).send({ error: "Algo não está certo" })
    }
})
router.put('/pedidos', async (req, res) => {
    const { chavedeacesso, situacao } = req.body
    if (chavedeacesso === undefined || situacao == undefined) {
        return res.status(400).send({ error: 'Não foram passadas as informações necessárias' })
    }
    try {
        const { response } = await pedidosModule.put(req.body)

        if (response.affectedRows != 1) return res.send({
            response: "Chave de acesso invalida"
        })

        res.send({
            response: "Informações enviadas com sucesso"
        })
    } catch (e) {
        res.status(400).send({ error: "Algo não está certo" })
    }
})
router.post('/pedidos', async (req, res) => {
    const { numPedido } = req.body

    if (numPedido === undefined) {
        return res.status(400).send({ error: 'Não foram passadas as informações necessárias' })
    }

    try {
        const response = await pedidosModule.post(req.body)
        res.send({ numPedido, response })
    } catch (e) {
        res.status(400).send({ error: "Algo não está certo" })
    }
})

module.exports = app => app.use('/', router)
