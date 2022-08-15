const express = require('express');
const bodyParser = require('body-parser')
const config = require('./app/config/project.json')
const path = require('path')
const cors = require('cors')
const fs = require('fs')
const checkNotas = require("./app/modules/checkNotas")

// configuracoes para o aplicativo
const app = express();
const { spawn } = require('child_process');

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.resolve(__dirname, "app", "public")))
app.use("styles", express.static(path.resolve(__dirname, "app", "styles")))

require('./app/controller/index')(app);

fs.watch(path.resolve(__dirname, "app", "public", "notas-etiquetas"), (eventType, filename) => {
  if (eventType.toLowerCase() === "rename" || eventType.toLowerCase() === "change") {
    console.log(eventType)
    checkNotas()

    const child = spawn("python", ["./src/pdfModule.py"])

    child.stdout.on('data', function (data) {
      const retorno = data.toString()
      console.log(retorno)
      child.kill()
    })
  }
})

app.listen(config.port, () => {
  console.log(`listening on port ${config.port}`)
})
