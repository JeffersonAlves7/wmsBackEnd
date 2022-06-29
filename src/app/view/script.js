const buttonEnviar = document.getElementById('enviar')
const textArea = document.getElementById('textArea')
const listas = document.getElementById('listas')
const errorArea = document.getElementById('error')
const completeArea = document.getElementById('complete')

class Numeros {
  constructor() {
    this.charLen = 5;
    this.numbers = textArea.value.split(" ");
  }
  sendNumbers(numbers) {
    fetch("/pedidos", {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify({ numPedido: numbers })
    }).then(res => { console.log(res) }).catch(e => console.error(e))
  }

  throwErr(numbers) {
    errorArea.innerText = "Erro nos seguintes números:"
    for (let num of numbers) {
      const paragraph = document.createElement('p')
      paragraph.innerText = num

      const list = document.createElement('li')
      list.appendChild(paragraph)
      listas.appendChild(list)
    }
  }

  eraseList() {
    listas.childNodes.forEach((li, i) => {
      if (li.nodeName != "LI") return
      listas.removeChild(li)
    });
  }
}

function main() {
  errorArea.innerText = ""
  completeArea.innerText = ""

  const NUMBERS = new Numeros()
  NUMBERS.eraseList()

  const first_word = NUMBERS.numbers[0]
  if (first_word.length !== NUMBERS.charLen) NUMBERS.charLen = first_word.length
  const erros_in_numbers = []

  for (let num of NUMBERS.numbers) {
    if (num.length !== NUMBERS.charLen) erros_in_numbers.push(num);
  }

  if (erros_in_numbers[0]) { NUMBERS.throwErr(erros_in_numbers); return }
  errorArea.innerText = ""

  NUMBERS.sendNumbers(NUMBERS.numbers)
  completeArea.innerText = "Enviado com sucesso!"
}

buttonEnviar.onclick = () => main()
