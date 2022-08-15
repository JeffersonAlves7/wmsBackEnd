const express = require("express")
const router = express.Router()
const fs = require("fs")
const path = require("path")
const projectConfig = require("../config/project.json")

router.get("/imagem", async (req, res) => {
    function getNoEnd(string) {
        let lastIndex = 0;

        for (var i = 0; i < string.length; i++) {
            if (string[i] === "_") lastIndex = i
        }
        return string.substring(0, lastIndex)
    }
    try {
        fs.readdir(path.resolve("src", "app", "public", "imagens"), (err, files) => {
            let { sku } = req.query
            if (!sku) {
                res.send(files)
                return
            }
            sku = sku.replaceAll("/", "")
            let retorno = false

            files.forEach((item, index) => {
                if (item.replace(".jpg", "").replace(".png", "") === sku) {
                    res.redirect(projectConfig.url + "/imagens/" + item)
                    retorno = true
                } else if (item.replace(".jpg", "").replace(".png", "") === getNoEnd(sku)) {
                    res.redirect({ url: projectConfig.url + "/imagens/" + item })
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