const express = require('express');
const bodyParser = require('body-parser')
const PORT = 2021;
const path = require('path')
const cors = require('cors')
// configuracoes para o aplicativo
const app = express();

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.resolve(__dirname, "app", "public")))

require('./app/controller/index')(app);

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})