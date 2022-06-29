const express = require('express');
const bodyParser = require('body-parser')
const PORT = 2021;
const path = require('path')
const cors = require('cors')
const fs = require('fs')
// configuracoes para o aplicativo
const app = express();
const { spawn } = require('child_process');

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.resolve(__dirname, "app", "public")))

require('./app/controller/index')(app);

fs.watch(path.resolve(__dirname, "app", "public", "notas-etiquetas"), (eventType, filename) => {
    if (eventType === "rename") {
        // const caminho = path.resolve(__dirname, "app", "public", "notas-etiquetas", filename);
        console.log(eventType, filename)

        const child = spawn("python", ["./src/pdfModule.py"])

        child.stdout.on('data', function (data) {
            const retorno = data.toString()
            console.log(retorno)

        })
    }
})

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})