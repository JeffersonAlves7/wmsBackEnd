module.exports = function dateInformations({ date, interval, now, gerado }) {
  const dateInterval = (s1, s2) => (
    `WHERE DATE(alterado) > DATE(current_date() - INTERVAL ${s1}) AND DATE(alterado) < DATE(current_date() + INTERVAL ${s2})`
  )
  const geradoInterval = (s1, s2) => (
    `WHERE DATE(gerado) > DATE(current_date() - INTERVAL ${s1}) AND DATE(gerado) < DATE(current_date() + INTERVAL ${s2})`
  )

  //Intervalo e data atual definidos
  if (interval != undefined && undefined != now) {
    const [y, m, d] = now.split("-")
    let [year, month, day] = [y, m, d]

    if (interval == "semana") {
      day = Number(day) - 7
      if (day < 1) month = Number(month) - 1
    }

    if (interval == "mes") month = Number(month) - 1
    return `WHERE alterado BETWEEN "${year}-${month}-${day}" AND "${y}-${m}-${Number(d) + 1}"`
  }

  //Caso apenas o intervalo esteja definido
  if (interval !== undefined) {
    if (interval == "semana") return dateInterval("1 WEEK", "1 DAY")
    if (interval == "mes") return dateInterval("1 MONTH", "1 DAY")
  }

  //Caso apenas a data seja true
  if (gerado != undefined)
    if (gerado === "true")
      return geradoInterval("10 HOUR", "1 DAY")
    else if (gerado === "false")
      return `WHERE DATE(gerado) < DATE(current_date())`
    else
      return `WHERE DATE(gerado) = '${gerado}'`;

  if (date != undefined)
    if (date === "true")
      return dateInterval("10 HOUR", "1 DAY")
    else if (date === "false")
      return `WHERE DATE(alterado) < DATE(current_date())`
    else
      return `WHERE DATE(alterado) = '${date}'`;

  return ""
}