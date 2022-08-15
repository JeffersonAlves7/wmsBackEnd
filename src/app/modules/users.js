const database = require('../database/index')

async function getUserByName({ name }) {

}

module.exports = {
    get: async function () {
        const db = await database()
        const [response] = await db.query("SELECT * FROM usuarios");
        return response
    },
    post: async function ({ nome, senha }) {
        if (nome === undefined || senha === undefined) throw new Error({ message: "Os parâmetros não foram passados corretamente" })
        let myquery = `INSERT INTO usuarios (nome, senha) VALUES ("${nome}", "${senha}")`

        const db = await database()
        await db.query(myquery)
        db.end()

        return { nome }
    },
    login: async function ({ nome, senha }) {
        if (nome === undefined || senha === undefined) return { message: "Os parâmetros não foram passados corretamente" }

        const db = await database()

        const [user] = await db.query(`SELECT * FROM usuarios WHERE nome = "${nome}"`)

        if (user[0] === undefined) return { message: "O usuário não existe no sistema" }
        if (user[0].senha !== senha) return { message: "Senha incorreta" }

        if (user[0].isLogged > 0) return true

        await db.query(`UPDATE usuarios SET isLogged = 1 WHERE nome = "${nome}" AND senha = "${senha}"`)
        db.end()

        return true
    },
    isLoggedIn: async function ({ nome }) {
        if (nome === undefined) return { message: "Os parâmetros não foram passados corretamente" }
        const db = await database()
        const [user] = await db.query(`SELECT * FROM usuarios WHERE nome = "${nome}"`)
        db.end()

        if (user[0] === undefined) return false

        return user[0].isLogged
    },
    logOut: async function ({ nome, senha }) {
        if (nome === undefined || senha === undefined) throw new Error({ message: "Os parâmetros não foram passados corretamente" })
        const db = await database()

        const [user] = await db.query(`SELECT * FROM usuarios WHERE nome = "${nome}"`)

        if (user[0] === undefined) throw new Error({ message: "Usuário não existe" })
        if (user[0].isLogged === 0) return true

        await db.query(`UPDATE usuarios SET isLogged = 0 WHERE id = ${user[0].id}`)

        db.end()
        return true
    }
}