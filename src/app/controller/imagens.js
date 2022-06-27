const express = require("express")
const router = express.Router()
const fs = require("fs")
const path = require("path")
const projectConfig = require("../config/project.json")

router.get("/imagem", async (req, res) => {
    try {
        fs.readdir(path.resolve("src", "app", "public", "imagens"), (err, files) => {
            const { sku } = req.query
            if (!sku) {
                res.send(files)
                return
            }
            let retorno = false
            files.forEach((item, index) => {
                if (item.replace(".jpg", "").replace(".png", "") === sku) {
                    res.redirect(projectConfig.url + "/imagens/" + item)
                    retorno = true
                }
            })
            if (!retorno) res.send({
                message: "imagem não encontrada"
            })
        })
    } catch (e) {
        res.status(400).send({ error: "Algo não está certo" })
    }
})

module.exports = app => app.use("/", router)