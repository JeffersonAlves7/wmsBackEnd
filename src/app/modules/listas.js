const connectionDB = require("../database/index")

async function get(params) {
    const { situacao, id, date, page, interval, now } = params
    let myquery = `SELECT * FROM principal `

    if (interval != undefined && now != undefined) {
        const [y, m, d] = now.split("-")
        let [year, month, day] = now.split("-")

        if (interval == "semana") {
            day = Number(day) - 7
            if (Number(day) - 7 < 1) { month = Number(month) - 1 }
        }

        if (interval == "mes") {
            month = Number(month) - 1
        }
        myquery += `WHERE date BETWEEN "${year}-${month}-${day}" AND "${y}-${m}-${Number(d) + 1}"`
    }
    else if (date != undefined) {
        if (date === "true") {
            myquery += `WHERE DATE(date) > DATE(CURRENT_DATE() - INTERVAL 10 HOUR) AND DATE(date) < DATE(CURRENT_DATE() + INTERVAL 1 DAY)`;
        } else {
            myquery += `WHERE DATE(date) = '${date}'`;
        }
    }
    else if (interval !== undefined) {
        if (interval == "semana") {
            myquery += `WHERE DATE(date) > DATE(current_date() - INTERVAL 1 WEEK) AND DATE(date)  < DATE(current_date() + INTERVAL 1 DAY);`;
        }
        if (interval == "mes") {
            month = `WHERE DATE(date) > DATE(current_date() - INTERVAL 1 MONTH) AND DATE(date)  < DATE(current_date() + INTERVAL 1 DAY);`;
        }
    }
    if (id != undefined) myquery.indexOf("where") > -1 || myquery.indexOf("WHERE") > -1 ? myquery += ` AND id=${id}` : myquery += ` WHERE id=${id}`;
    if (situacao != undefined) myquery.indexOf("where") > -1 || myquery.indexOf("WHERE") > -1 ? myquery += ` AND situacao='${situacao}'` : myquery += ` WHERE situacao='${situacao}'`;

    myquery += " ORDER BY id DESC"
    if (page !== undefined) myquery += ` LIMIT ${(page - 1) * 15},15;`;

    console.log(myquery);
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

    if (["Correios", "Shopee", "IntegraCommerce", "AmazonFulfillment", "MercadoLivre"].indexOf(canal) < 0) return

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
