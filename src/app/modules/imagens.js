const path = require('path')
const fs = require('fs')
const projectConfig = require('../config/project.json')

module.exports = (params) => {
    return new Promise((resolve, reject) => {
        const { sku } = params
        
        fs.readdir(path.resolve("src", "app", "public", "imagens"), (err, files) => {
            let retorno = false

            files.forEach((item, index) => {
                if (item.replace(".jpg", "").replace(".png", "") === sku) {
                    resolve({ url: projectConfig.url + "/imagens/" + item })
                    retorno = true
                }
            })

            if (!retorno) resolve({
                message: "imagem não encontrada"
            })
        })
    })
}
