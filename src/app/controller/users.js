const express = require('express')
const router = express.Router()
const usersModule = require('../modules/users')
router.get("/users", async function (req, res) {
    try {
        const response = await usersModule.get()
        res.send(response)
    } catch (err) {
        res.status(400).send({ error: "Não consegui coletar os usuários" })
    }
})
router.post("/register", async function (req, res) {
    try {
        const response = await usersModule.post(req.body)

        res.send({ response: `Usuário ${response.nome} criado com sucesso!` })
    } catch ({ code }) {
        if (code == "ER_DUP_ENTRY") return res.status(400).send({ error: "Este usuário já existe" })
        res.status(400).send({ error: "As informações não foram passadas corretamente" })
    }
})
router.post("/login", async (req, res) => {
    try {
        const response = await usersModule.login(req.body)
        const isLoggedIn = await usersModule.isLoggedIn(req.body)
        res.status(200).send({ isLoggedIn })
    } catch (err) {
        console.log(err)
        res.status(400).send({ error: "Não foi possivel fazer login" })
    }
})
router.post("/isLoggedIn", async (req, res) => {
    try {
        const response = await usersModule.isLoggedIn(req.body)

        res.send({ response })
    } catch (e) {
        res.status(400).send({ error: "Não foi possível fazer a requisição!" })
    }
})
router.post("/logout", async (req, res) => {
    try {
        const response = await usersModule.logOut(req.body)

        res.send({ response })
    } catch (e) {
        res.status(400).send({ error: "Não foi possível fazer a requisição!" })
    }
})
module.exports = app => app.use("/", router)