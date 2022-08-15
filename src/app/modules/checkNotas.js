const database = require('../database/index')
const fs = require("fs")
const path = require("path")

function check(element, key) {
  return new Promise((resolve, reject) => {
    fs.readdir(path.resolve("src", "app", "public", "notas"), (err, files) => {
      if (err) reject(err)

      const retorno = { data: false, setData: function (n) { this.data = n } }

      files.forEach((nota, j) => nota.replace(".pdf", "") === element[key] ? retorno.setData(true) : null)

      resolve(retorno.data)
    })
  })
}

module.exports = async function checkNotas() {
  const db = await database()

  const [response] = await db.query("SELECT nf FROM pedidos WHERE situacao='processando'")
  if (!response[0]) return

  const key = "nf"

  for (let i = 0; i < response.length; i++) {
    const element = response[i]

    const exists = await check(element, key)
    if (!exists) continue

    db.query(`UPDATE pedidos SET situacao="emaberto", alterado=now() where nf="${element[key]}"`)
  }
}
