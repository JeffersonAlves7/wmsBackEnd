const api = require('../api/index')
const imageModule = require('./imagens')
const database = require('../database/index')

async function get( params ){
  const { pedidoBling } = params
  const db =  await database();
  const [ response ] = await db.query(`SELECT * FROM itens WHERE pedidoBling = ${pedidoBling}`)

  for (var i = 0; i < response.length; i++) {
    response[i].imagem = await imageModule(response[i])
  }
  return  response
}

async function post( params ){
  const { itens, pedidoBling } = params
  const db =  await database();

  for (var i = 0; i < itens.length; i++) {
    await db.query(`INSERT INTO itens
      (pedidoBling, sku, quantidade, descricao)
      VALUES ('${pedidoBling}','${itens[i].item.codigo}',${itens[i].item.quantidade.split('.')[0]},'${itens[i].item.descricao.substr(0, 29)}')`)
  }
  db.end()
}

module.exports = { get, post }
