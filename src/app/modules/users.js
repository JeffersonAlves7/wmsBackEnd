const database = require('../database/index')

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

        return { nome }
    },
    login: async function ({ nome, senha }) {
        if (nome === undefined || senha === undefined) throw new Error({ message: "Os parâmetros não foram passados corretamente" })

        const db = await database()

        const [user] = await db.query(`SELECT * FROM usuarios WHERE nome = "${nome}"`)

        if (user[0] === undefined) throw new Error({ message: "O usuário não existe no sistema" })
        if (user[0].senha !== senha) throw new Error({ message: "Senha incorreta" })

        if (user[0].isLogged > 0) return true

        await db.query(`UPDATE usuarios SET isLogged = 1 WHERE nome = "${nome}" AND senha = "${senha}"`)

        return true
    },
    isLoggedIn: async function ({ nome, senha }) {
        if (nome === undefined || senha === undefined) throw new Error({ message: "Os parâmetros não foram passados corretamente" })
        const db = await database()
        const [user] = await db.query(`SELECT * FROM usuarios WHERE nome = "${nome}" AND senha = "${senha}"`)

        if (user[0] === undefined) throw new Error({ message: "Usuário não existe" })

        return user[0].isLogged
    },
    logOut: async function ({ nome, senha }) {
        if (nome === undefined || senha === undefined) throw new Error({ message: "Os parâmetros não foram passados corretamente" })
        const db = await database()

        const [user] = await db.query(`SELECT * FROM usuarios WHERE nome = "${nome}" AND senha = "${senha}"`)

        if (user[0] === undefined) throw new Error({ message: "Usuário não existe" })
        if (user[0].isLogged === 0) return true

        await db.query(`UPDATE usuarios SET isLogged = 0 WHERE id = ${user[0].id}`)
        return true
    }
}