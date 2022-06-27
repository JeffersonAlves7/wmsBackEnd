const projectConfig = require('../config/project.json');
const axios = require('axios')

async function separa(pedido) {
    const url = projectConfig.bling.start + '/pedido/' + pedido + projectConfig.bling.end
    const { data } = await axios.get(url)

    const malFormated = data.retorno.pedidos[0].pedido;

    return {
        chavedeacesso: malFormated.nota.chaveAcesso,
        nf: malFormated.nota.numero,
        serie: malFormated.nota.serie,
        pedidoBling: malFormated.numero,
        pedido: malFormated.numeroPedidoLoja,
        integracao: malFormated.tipoIntegracao,
        qntItens: malFormated.itens.length,
        itens: malFormated.itens,
    }
}

module.exports = separa