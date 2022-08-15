const database = require('../database/index')
const bling = require('../api/index')
const config = require("../config/project.json")

const listaModule = require('./listas');
const itensModule = require('./itens');

const dateInformations = require("../functions/SQL/dateInformations")
const where_and = require("../functions/SQL/where_and")
const ItensInPedidos = require('../functions/JS/ItensInPedidos');
const arrToQuery = require('../functions/JS/arrToQuery');

const SHEET = "pedidos"

module.exports = {
  async get(params) {
    //Adicionar gerado=true e alterado=true
    const { idLista, nf, integracao, situacao, chavedeacesso, pedido, page, itens } = params
    const limit = 50

    let myquery = `${dateInformations(params)}`
    console.log(situacao)

    if (pedido != undefined) myquery += where_and(myquery) + ` pedido='${pedido}'`;
    if (nf != undefined) myquery += where_and(myquery) + ` nf='${nf}'`;
    if (integracao != undefined) {
      if (integracao.toLowerCase() == "correios") myquery += where_and(myquery) + ` (integracao='Kabum' OR integracao ='SkyHub')`;
      else myquery += where_and(myquery) + ` integracao='${integracao}'`;
    }
    if (idLista != undefined) myquery += where_and(myquery) + ` idLista=${idLista}`;
    if (situacao != undefined) myquery += where_and(myquery) + ` situacao='${situacao.toLowerCase()}'`;
    if (chavedeacesso != undefined) myquery += where_and(myquery) + ` chavedeacesso='${chavedeacesso}'`;

    const db = await database()

    //Obtendo a quantidade de páginas e adicionando isso na query
    const [[pages]] = await db.query(`SELECT COUNT(*) FROM ${SHEET} ${myquery}`)

    //Ultimo incremento de texto
    myquery += " ORDER by gerado DESC"

    //Se a página não for indefinida eu preciso fazer com que haja um limite nas informações
    if (page !== undefined) myquery += ` LIMIT ${(page - 1) * limit},${limit};`;
    const pagesTrate = Math.floor(pages["COUNT(*)"] / limit + 1) >= 1 ? Math.floor(pages["COUNT(*)"] / limit + 1) : 1

    const [response] = await db.query(`SELECT * FROM ${SHEET} ` + myquery)

    if (itens === "true") {
      const pedidoBlingString = arrToQuery(response.map(a => a.pedidoBling))

      //Retornando caso não tenha resposta alguma, ou seja, nenhuma nota fiscal no array
      if (pedidoBlingString === "()") return { response: [], pages: [1] }

      //Se houver, posso pegar os itens a partir do array transformado em string
      const [pedidosItens] = await db.query(`SELECT * FROM itens WHERE pedidoBling in ${pedidoBlingString}`)

      //Assim eu possuo a nova resposta e as trato passando os itens para seus devidos pedidos
      const newResp = await ItensInPedidos(response, pedidosItens)

      db.end()
      return { response: newResp, pages: pagesTrate }
    }

    db.end()
    return { response, pages: pagesTrate }
  },

  async buscar(params) {
    const { busca } = params
    if (busca === undefined) return false

    const query = `SELECT * FROM pedidos WHERE nf like "${busca}%" or pedido like "${busca}%"  order by idLista desc`
    const db = await database()
    const [res] = await db.query(query)
    //Obtendo a quantidade de páginas e adicionando isso na query
    const pedidoBlingString = arrToQuery(res.map(a => a.pedidoBling))

    //Retornando caso não tenha resposta alguma, ou seja, nenhuma nota fiscal no array
    if (pedidoBlingString === "") return { response: [] }

    //Se houver, posso pegar os itens a partir do array transformado em string
    const [pedidosItens] = await db.query(`SELECT * FROM itens WHERE pedidoBling in ${pedidoBlingString}`)

    //Assim eu possuo a nova resposta e as trato passando os itens para seus devidos pedidos
    const response = await ItensInPedidos(res, pedidosItens)

    db.end()
    return { response }
  },

  async post(params) {
    const { numPedido } = params
    const pedido = await bling(numPedido)

    if (pedido.erros) return pedido;
    if (pedido.integracao == "AmazonFulfillment") return "Problema no pedido" + numPedido

    const db = await database()

    const { marketplaces } = config
    const correios = marketplaces.filter(a => a.name.toLowerCase() == "correios")[0].sub

    async function idLista(db, integracao) { //Retorna o id da lista para realizar o post, sempre sera o que estiver disponivel
      const select_where_and = (val1, val2) => `SELECT * FROM principal WHERE lista_situacao='${val1}' and lista_integracao='${val2}'`

      const [response] = await db.query(select_where_and("criar", `${integracao}`))
      if (response[0]) return response[0].id

      await listaModule.post({ integracao }) //Caso não tenha uma referente a este marketplace nós iremos criar um com esse canal
      const [newResponse] = await db.query(select_where_and("criar", `${integracao}`))
      return newResponse[0].id
    }

    pedido.idLista = await idLista(db, correios.indexOf(pedido.integracao) > -1 ? "Correios" : pedido.integracao)

    await db.query(
      `INSERT INTO ${SHEET}
      (chavedeacesso, nf, serie, idLista, pedidoBling, pedido, integracao, qntItens, alterado)
      VALUES
      ( '${pedido.chavedeacesso}', '${pedido.nf}', ${pedido.serie}, ${pedido.idLista}, '${pedido.pedidoBling}', '${pedido.pedido}', '${pedido.integracao}', ${pedido.qntItens}, now() )`
    )

    await itensModule.post(pedido)
    db.end()

    return pedido
  },

  async put(params) {
    const { chavedeacesso, situacao } = params
    const db = await database()               //Stabilish connection 

    //Query
    let myquery = `UPDATE ${SHEET} SET situacao='${situacao.toLowerCase()}', alterado=now() WHERE chavedeacesso="${chavedeacesso}"`

    //First Rsponse -> just update a row
    const [response] = await db.query(myquery)

    //Get the rou updated values
    const [newRes] = await db.query(`SELECT * FROM ${SHEET} WHERE chavedeacesso="${chavedeacesso}"`)
    const idLista = newRes[0].idLista

    const [count] = await db.query(`SELECT COUNT(*) FROM pedidos WHERE idLista = ${idLista}`)
    const [res] = await db.query(`SELECT COUNT(*) FROM pedidos WHERE situacao="Embalado" AND idLista = ${idLista}`)

    if (count[0]['COUNT(*)'] === res[0]['COUNT(*)']) {
      await db.query(`UPDATE pedidos SET situacao="finalizado" WHERE situacao="embalado" AND idLista=${idLista}`)
      await db.query(`UPDATE principal SET lista_situacao="finalizado"WHERE id=${idLista}`)
    }

    db.end()
    return { response }
  }
}
