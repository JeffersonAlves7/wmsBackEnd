const imageModule = require("../../modules/imagens")

module.exports = async (pedidos, itens) => {
  const pedidosMapeados = pedidos.map(pedido => ({ ...pedido, itens: itens.filter(item => item.pedidoBling === pedido.pedidoBling) }))
  const response = []
  for (let i = 0; i < pedidosMapeados.length; i++) {
    const pedido = pedidosMapeados[i];
    const arrItens = []
    for (let j = 0; j < pedido.itens.length; j++) {
      const item = pedido.itens[j];
      item.imagem = await imageModule(item)
      arrItens.push(item)
    }
    response.push({ ...pedido, itens: arrItens })
  }
  return response
}