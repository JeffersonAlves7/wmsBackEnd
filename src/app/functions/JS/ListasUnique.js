module.exports = function getValues(arr_obj, key, pedidoKeys, others) {
  const arr_obj_return = []

  for (let i = 0; i < arr_obj.length; i++) {
    const rp_values = arr_obj.filter(v => v[key] === arr_obj[i][key])
    if (!rp_values[0]) continue

    let is_repeated = arr_obj_return.filter(v => v[key] == rp_values[0][key])
    if (is_repeated[0]) continue

    const pedidos = []
    const obj = {}

    rp_values.forEach(v => {
      const pedido = {}
      pedidoKeys.forEach(_k => pedido[_k] = v[_k])
      pedidos.push(pedido)
    })

    obj[key] = rp_values[0][key]
    others.forEach(_key => obj[_key] = rp_values[0][_key])

    obj["pedidos"] = pedidos

    arr_obj_return.push(obj)
  }

  return arr_obj_return
}