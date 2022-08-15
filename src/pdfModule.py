import sys
from numpy import empty
import textract
import os
import PyPDF2
import shutil

CARACTERES = [' ', '\n', '\\', '\r', '\\\\', 'LU-', 'NF:', '-', ':', "Sub"]    #Essa variável não pode conter números mesmo que dentro da string

class Marketplace:
    def __init__(self, nome, nfs, etiquetas):
        self.nome = nome
        self.nfs = nfs
        self.etiquetas = etiquetas
        pass

class Pdf:
    def __init__(self, pdf):
        self.pdf = pdf #Precisa ser um caminho

    def readPdf(self):
        text = textract.process(self.pdf)
        conteudo = str(text[0:len(text)])
        return conteudo

    def separarPdf(self, save_local = f"./src/app/public/paginas/page"):
        arch= open(self.pdf, 'rb')
        #Irei separar o arquivo pdf em vários outros,
        #levando em consideração o caminho passado em save_local
        inputpdf = PyPDF2.PdfFileReader(arch)
        for i in range(inputpdf.numPages):
            outputpdf = PyPDF2.PdfFileWriter()
            outputpdf.addPage(inputpdf.getPage(i))
            with open(f'{save_local}{i+1}.pdf',"wb") as outputStream:
                outputpdf.write(outputStream)
        arch.close()
        return 0

    def juntarPdf(nomePdf, path_to_save): #Caminho precisa ser um array contendo [ nf, etq ]
        merge = PyPDF2.PdfFileMerger()
        for i in [NotaFiscal().caminho, Etiqueta().caminho]:
            arq = open(f'{i}/{nomePdf}', 'rb')
            dado = PyPDF2.PdfFileReader(arq)
            merge.append(dado)
            arq.close()
        merge.write(path_to_save)

class Path:
    def readNotasEtiquetas():
        return os.listdir(f"{os.path.dirname(__file__)}\\app\\public\\notas-etiquetas")
    def readPdfCaminho(caminho):
        return os.listdir(f"{os.path.dirname(__file__)}\\app\\public\\notas-etiquetas\\{caminho}")
    def readPdfCaminhoFiles(path, file):
        return f"./src/app/public/notas-etiquetas/{path}/{file}"
    def eraseCaminhos(caminhos):
        for i in caminhos:
            files = os.listdir(i)
            for a in files:
                os.remove(i + "/" + a)
        return 0
    def eraseNotasEtiquetas():
        for i in os.listdir("./src/app/public/notas-etiquetas"):
            shutil.rmtree("./src/app/public/notas-etiquetas/" + i, ignore_errors=False, onerror=None)
        return 0

class NotaFiscal:
    def __init__(self):
        self.caminho = "./src/app/public/paginas/nfs"
        pass

    def Number(text_extracted):
        position = text_extracted.find("NF-e:")
        nf_num = text_extracted[position:position+12]

        nf_num = nf_num.replace("NF-e:", '')
        for i in str(CARACTERES):
            nf_num = nf_num.replace(i, '')
        return nf_num

    def NF(text_extracted):
        position = text_extracted.find("NF-e: 0")
        nf_num = text_extracted[position:position+12]

        nf_num = nf_num.replace("NF-e: 0", '')
        for i in str(CARACTERES):
            nf_num = nf_num.replace(i, '')
        return nf_num

    def Pedido(text_extracted):
        position = text_extracted.find('Pedido:')
        nf_pedido = text_extracted[position:position+35]

        nf_pedido = nf_pedido.replace('Pedido:', '')
        for i in str(CARACTERES):
            nf_pedido = nf_pedido.replace(i, '')
        return nf_pedido

    def b2w(text_extracted):
        position = text_extracted.find('Pedido:')
        nf_pedido = text_extracted[position:position+100]

        nf_pedido = nf_pedido.replace('Pedido:', '')
        nf_pedido = nf_pedido.replace('Shoptime', '')

        for v in "Lojas_Americanas":
            nf_pedido = nf_pedido.replace(v, "")


        for i in str(CARACTERES):
            nf_pedido = nf_pedido.replace(i, '')
        return nf_pedido

class Etiqueta:
    def __init__(self):
        self.caminho = "./src/app/public/paginas/etqs"
        pass

    def Fiscal(text_extracted):
        position = text_extracted.find("Fiscal:")
        etq_fiscal = text_extracted[position:position+15]

        etq_fiscal = etq_fiscal.replace("Fiscal:", '')
        for i in str(CARACTERES):
            etq_fiscal = etq_fiscal.replace(i, '')
        return etq_fiscal

    def NF(text_extracted):
        position = text_extracted.find("NF:")
        etq_nf = text_extracted[position:position+10]

        etq_nf = etq_nf.replace("NF:", '')
        for i in str(CARACTERES):
            etq_nf = etq_nf.replace(i, '')
        return etq_nf

    def Pedido(text_extracted):
        position = text_extracted.find('Pedido:')
        etq_pedido = text_extracted[position:position+25]

        etq_pedido = etq_pedido.replace('Pedido:', '')
        for i in str(CARACTERES):
            etq_pedido = etq_pedido.replace(i, '')
        return etq_pedido
    
    def b2w(text_extracted):
        position = text_extracted.find('Pedido:')
        etq_pedido = text_extracted[position:position+24]

        etq_pedido = etq_pedido.replace('Pedido:', '')
        etq_pedido = etq_pedido.replace('PLP', '')

        for i in str(CARACTERES):
            etq_pedido = etq_pedido.replace(i, '')
        return etq_pedido
    
def indexOf(str, value):
    try:
        str.index(value)
    except:
        return -1
    return str.index(value)

CAMINHOS = [NotaFiscal().caminho, Etiqueta().caminho]

def main():
    #Checando se existe algo dentro da pasta
    if len(Path.readNotasEtiquetas()) > 0:
        for i in range(0, len(Path.readNotasEtiquetas())):              #Passando por todas as pastas
            Path.eraseCaminhos(CAMINHOS)

            caminho = Path.readNotasEtiquetas()[i]                      #Essa é a pasta que tem dentro da pasta principal
            marketplace = ""
            #-------------------------------------------------#
                #Trecho que irá checar o nome do marketplace
            if indexOf(caminho.lower(), "shop") > -1:
                marketplace = "shopee"
            elif indexOf(caminho.lower(), "maga") > -1:
                marketplace = "magalu"
            elif indexOf(caminho.lower(), "merc") > -1:
                marketplace = "ml"
            elif indexOf(caminho.lower(), "b2w") > -1:
                marketplace = "b2w"
            elif indexOf(caminho.lower(), "mel") > -1 or indexOf(caminho.lower(), "corr") > -1:
                marketplace = "me"
            else:
                continue
            #-------------------------------------------------#
                #Aqui estarei separando a etiqueta da nota fiscal
            pdfs = Path.readPdfCaminho(caminho)     #Retornando o todos os arquivos da pasta

            indexNf = 0
            indexEtiqueta = 0

            for pdf in pdfs:
                if(indexOf(pdf, "NF") > -1):        #Definido qual é a nf
                    break
                indexNf += 1

            if(indexNf == 0):
                indexEtiqueta = 1                   #Definido qual é a etiqueta

            #Após coletar a etiqueta e a nota fiscal, preciso passá-los para uma variável junto da classe Marketplace
            marketplace = Marketplace(nome = marketplace, nfs=Path.readPdfCaminhoFiles(caminho, pdfs[indexNf]), etiquetas = Path.readPdfCaminhoFiles(caminho, pdfs[indexEtiqueta]))
            #-----------------------------------------------------------------------------------#
                #Separando o pdf em outros pdfs
            arrPdfs = [Pdf(marketplace.nfs), Pdf(marketplace.etiquetas)]        #esse array guarda os pdfs que possuem todas as etiquetas e todas as notas fiscais
            for i in range(len(arrPdfs)):                                       #aqui eu passo por caad pdf e executo a função de separar o pdf
                #A condicional abaixo leva em consiração o posicionamento do pdf no Array
                #O primeiro precisa ser as nfs e o segundo as etiquetas por conta do caminho passado
                arrPdfs[i].separarPdf(save_local = f"{NotaFiscal().caminho}/page") if i == 0 else  arrPdfs[i].separarPdf(save_local = f"{Etiqueta().caminho}/page")

            del arrPdfs
            #-----------------------------------------------------------------------------------#
                #Ler pdfs que foram salvos
                    #estou seguindo a mesma lógica que estava acima
            arrPages = [os.listdir(CAMINHOS[0]), os.listdir(CAMINHOS[1])]

                    #Total de pfs na pasta nfs !== #Total de pfs na pasta etqs
            if len(arrPages[0]) != len(arrPages[1]):                #Loop deverá continuar nas outras pastas e ignorar essas notas/etiquetas
                continue

            for i in range(len(arrPages[0])):                       #Poderia ser qualquer variável arrPages[0] || arrPages[1]
                nf = Pdf(CAMINHOS[0] + "/" + arrPages[0][i])        #Separando os pdfs em variáveis para serem usadas abaixo
                etq = Pdf(CAMINHOS[1] + "/" + arrPages[1][i])
            #----------------------------- Continuing the loop ---------------------------------#
                    #Com todas essav variáveis salvas e o loop em execução, agora precisarei trocar os nomes das páginas
                    #para um nome que eu consiga fazê-las se jungar mais pra frente
                nfNome = ""
                etqNome = ""

                    #Código que retorna um número do pedido ou nota fiscal se for necessário
                if indexOf(["ml", "me", "olist"], marketplace.nome) > -1:
                    nfNome = NotaFiscal.NF( nf.readPdf() )
                    etqNome = Etiqueta.NF( etq.readPdf() )
                elif indexOf(["shopee", "magalu"], marketplace.nome) > -1:
                    nfNome = NotaFiscal.Pedido( nf.readPdf() )
                    etqNome = Etiqueta.Pedido( etq.readPdf() )
                elif indexOf(["b2w"], marketplace.nome) > -1:
                    nfNome = NotaFiscal.b2w( nf.readPdf() )
                    etqNome = Etiqueta.b2w( etq.readPdf() )
                else:
                    continue
                    #Trocando o nome das etiquetas e das notas fiscais
                    #Renomeando os arquivos para seus respectivos nomes
                os.rename(nf.pdf, CAMINHOS[0] + '/' + nfNome + ".pdf")
                os.rename(etq.pdf, CAMINHOS[1] + '/' + etqNome + ".pdf")

            #----------------------------- Juntando os pdfs em um só ---------------------------------#
            for i in os.listdir(CAMINHOS[0]):
                nf = Pdf(CAMINHOS[0] + "/" + i)
                Pdf.juntarPdf(i, "./src/app/public/notas/" + NotaFiscal.Number( nf.readPdf() ) + ".pdf") #já inserindo o nome certo

        Path.eraseNotasEtiquetas()              #Apaganto todas as notas fiscais e as etiquetas
    return 0

if __name__ == '__main__':
    main()
