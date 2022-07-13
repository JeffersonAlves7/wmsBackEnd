const database = require('../database/index')
const bling = require('../api/index')
const listaModule = require('./listas');
const itensModule = require('./itens');

module.exports = {
    async get(params) {
        const { idLista, situacao, chavedeacesso, pedido, date, page, interval, now } = params

        let myquery = `SELECT * FROM pedidos `

        if (situacao != undefined && idLista != undefined) myquery += `WHERE situacao='${situacao}' AND idLista=${idLista}`;
        else if (interval != undefined && now != undefined) {
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
        else if (interval !== undefined) {
            if (interval == "semana") {
                myquery += `WHERE DATE(date) > DATE(current_date() - INTERVAL 1 WEEK) AND DATE(date)  < DATE(current_date() + INTERVAL 1 DAY)`;
            }
            if (interval == "mes") {
                myquery += `WHERE DATE(date) > DATE(current_date() - INTERVAL 1 MONTH) AND DATE(date)  < DATE(current_date() + INTERVAL 1 DAY)`;
            }
        }
        else if (date != undefined) date === "true" ? myquery += `WHERE DATE(date) > DATE(CURRENT_DATE() - INTERVAL 10 HOUR) AND DATE(date) < DATE(CURRENT_DATE() + INTERVAL 1 DAY)` : myquery += `WHERE DATE(date) = '${date}'`;

        if (pedido != undefined) myquery.indexOf("where") > -1 || myquery.indexOf("WHERE") > -1 ? myquery += ` AND pedido='${pedido}'` : myquery += ` WHERE pedido='${pedido}'`;
        if (idLista != undefined) myquery.indexOf("where") > -1 || myquery.indexOf("WHERE") > -1 ? myquery += ` AND idLista=${idLista}` : myquery += ` WHERE idLista=${idLista}`;
        if (situacao != undefined) myquery.indexOf("where") > -1 || myquery.indexOf("WHERE") > -1 ? myquery += ` AND situacao='${situacao}'` : myquery += ` WHERE situacao='${situacao}'`;
        if (chavedeacesso != undefined) myquery.indexOf("where") > -1 || myquery.indexOf("WHERE") > -1 ? myquery += ` AND chavedeacesso='${chavedeacesso}'` : myquery += ` WHERE chavedeacesso='${chavedeacesso}'`;

        myquery += " ORDER by idLista DESC"
        if (page !== undefined) myquery += ` LIMIT ${(page - 1) * 15},15;`;

        const db = await database()
        const [response] = await db.query(myquery)
        if (params.itens === 'true') {
            for (let i = 0; i < response.length; i++) {
                const itens = await itensModule.get(response[i])
                response[i].itens = itens
            }
        }
        db.end()
        return response
    },
    async post(params) {
        const { numPedido } = params
        const pedido = await bling(numPedido)

        if (pedido.erros) return pedido;
        if (pedido.integracao == "AmazonFulfillment") return "Problema no pedido" + numPedido

        const db = await database()

        const correios = ["Olist", "SkyHub", "Kabum", "LojaIntegrada"];

        async function idLista(db, integracao) { //Retorna o id da lista para realizar o post, sempre sera o que estiver disponivel
            // Comentario abaixo para visualizar o funcionamento das chegadas de requisi;'ao
            if (correios.indexOf(integracao) > -1) {

                const [response] = await db.query(`SELECT * FROM principal WHERE situacao = 'criar' and canal = 'Correios'`)
                if (response[0]) return response[0].id

                await listaModule.post({ canal: "Correios" }) //Caso não tenha uma referente a este marketplace nós iremos criar um com esse canal
                const [newResponse] = await db.query(`SELECT * FROM principal WHERE situacao = 'criar' and canal = 'Correios'`)
                return newResponse[0].id

            } else {
                const [response] = await db.query(`SELECT * FROM principal WHERE situacao = 'criar' and canal = '${integracao}'`)
                if (response[0]) return response[0].id

                await listaModule.post({ canal: integracao }) //Caso não tenha uma referente a este marketplace nós iremos criar um com esse canal
                const [newResponse] = await db.query(`SELECT * FROM principal WHERE situacao = 'criar' and canal = '${integracao}'`)
                console.log(response, newResponse)
                return newResponse[0].id
            }
        }
        pedido.idLista = await idLista(db, pedido.integracao)

        await db.query(
            `INSERT INTO pedidos
            (chavedeacesso, nf, serie, idLista, pedidoBling, pedido, integracao, qntItens, date)
            VALUES
            ('${pedido.chavedeacesso}', '${pedido.nf}', ${pedido.serie}, ${pedido.idLista}, '${pedido.pedidoBling}', '${pedido.pedido}','${pedido.integracao}', ${pedido.qntItens}, now())
        `)

        await itensModule.post(pedido)
        db.end()

        return pedido
    },
    async put(params) {
        const { chavedeacesso, situacao } = params
        const db = await database()

        let myquery = `UPDATE pedidos SET situacao = "${situacao.toLowerCase()}", date = now() WHERE chavedeacesso = "${chavedeacesso}"`

        const [response] = await db.query(myquery)

        const [newRes] = await db.query(`SELECT * FROM pedidos WHERE chavedeacesso = "${chavedeacesso}"`)
        const idLista = newRes[0].idLista

        const [count] = await db.query(`SELECT COUNT(*) FROM pedidos WHERE idLista = ${idLista}`)
        const [res] = await db.query(`SELECT COUNT(*) FROM pedidos WHERE situacao="Embalado" AND idLista = ${idLista}`)

        if (count[0]['COUNT(*)'] === res[0]['COUNT(*)']) {
            await db.query(`UPDATE pedidos SET situacao = "finalizado" WHERE situacao="Embalado" AND idLista=${idLista}`)
            await db.query(`UPDATE principal SET situacao = "finalizado" WHERE id=${idLista}`)
        }

        db.end()
        return { response }
    }
}
