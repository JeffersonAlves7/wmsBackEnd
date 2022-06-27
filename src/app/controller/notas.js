const express = require("express")
const router = express.Router()
const fs = require("fs")
const path = require("path")
const projectConfig = require("../config/project.json")

router.get("/notas", async (req, res) => {
    try {
        fs.readdir(path.resolve("src", "app", "public", "notas"), (err, files) => {
            const { nf } = req.query
            if (!nf) {
                res.send(files)
                return
            }
            let retorno = false

            files.forEach((notaFiscal, index) => {
                if (notaFiscal.replace(".pdf", "") === nf) {
                    res.redirect(projectConfig.url + "/notas/" + notaFiscal)
                    retorno = true
                }
            })

            if (!retorno) res.send({
                message: "Nota não encontrada"
            })
        })
    } catch (e) {
        res.status(400).send({ error: "Algo não está certo" })
    }
})

module.exports = app => app.use("/", router)