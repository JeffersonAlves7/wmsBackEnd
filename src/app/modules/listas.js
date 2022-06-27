const connectionDB = require("../database/index")

async function get(params) {
    const { situacao, id } = params
    let myquery = `SELECT * FROM principal `

    if (situacao != undefined && id != undefined) myquery += `where situacao='${situacao}' and id=${id}`;
    else if (id != undefined) myquery += `where id=${id}`;
    else if (situacao != undefined) myquery += `where situacao='${situacao}'`;

    const connection = await connectionDB()
    const [response] = await connection.query(myquery)

    for (let i = 0; i < response.length; i++) {
        const [length] = await connection.query(`SELECT COUNT(*) FROM pedidos WHERE idLista=${response[i].id}`)
        response[i].pedidos = length[0]['COUNT(*)']
    }
    connection.end()
    return response
}

async function post(params) { //The params must be {idprincipal:int, canal, situacal}
    // insert into principal (canal) values ("ml");
    const { canal } = params

    if (!(["Correios", "Shopee", "IntegraCommerce", "AmazonFulfillment", "MercadoLivre"].indexOf(canal) > -1)) return

    const connection = await connectionDB()
    let myquery = `INSERT INTO principal (canal) values ("${canal}")`
    const [response] = await connection.query(myquery)
    connection.end()
    return response
}
async function put(params) {
    const { id, situacao } = params
    let myquery = `UPDATE principal SET situacao='${situacao}' WHERE id=${id}`

    const connection = await connectionDB()
    const [response] = await connection.query(myquery)
    connection.end()

    return response
}

module.exports = { get, post, put }