const connectionDB = require("../database/index")
const ListasUnique = require("../functions/JS/ListasUnique")

const dateInformations = require("../functions/SQL/dateInformations")
const where_and = require("../functions/SQL/where_and")

const SHEET = "principal"

module.exports = {
  async get(params) {
    const { situacao, id, page, integracao } = params

    let myquery = ` ${dateInformations(params)}`

    if (id != undefined) myquery += where_and(myquery) + ` id='${id}'`;
    if (situacao != undefined) myquery += where_and(myquery) + ` lista_situacao='${situacao}'`;
    if (integracao != undefined) myquery += where_and(myquery) + ` lista_integracao='${integracao}'`;

    myquery += " ORDER BY id DESC"
    if (page !== undefined) myquery += ` LIMIT ${(page - 1) * 15},15;`;

    const connection = await connectionDB()
    const finalQuery = `SELECT * FROM ${SHEET} INNER JOIN pedidos ON ${SHEET}.id = pedidos.idLista ${myquery}`

    const [response] = await connection.query(finalQuery)

    const lastResponse = ListasUnique(response, "id", [
      "chavedeacesso",
      "alterado",
      "gerado",
      "nf",
      "serie",
      "integracao",
      "situacao",
      "idLista",
      "qntItens",
    ], ["lista_integracao", "lista_situacao", "lista_alterada", "lista_gerada"])

    connection.end()

    return { response: lastResponse }
  },

  async post(params) { //The params must be {idprincipal:int, canal, situacao}
    // insert into principal (canal) values ("MercadoLivre");
    const { integracao } = params
    if (!integracao) return

    const connection = await connectionDB()

    let myquery = `INSERT INTO ${SHEET} (lista_integracao) values ("${integracao}")`
    const [response] = await connection.query(myquery)

    connection.end()
    return response
  },

  async put(params) {
    const { id, situacao } = params
    let myquery = `UPDATE ${SHEET} SET lista_situacao='${situacao}' WHERE id=${id}`

    const connection = await connectionDB()
    const [response] = await connection.query(myquery)
    connection.end()

    return response
  }
}