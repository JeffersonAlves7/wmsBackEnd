import requests
import pandas as pd
import json
import dataframe_image as dfi
from datetime import datetime

def buscar_dados():
    request = requests.get('http://localhost:2021/pedidos?date=true')
    retorno =  json.loads(request.content)
    return retorno['response']

df = pd.DataFrame(buscar_dados())
filename = "./src/app/public/relatorio/" +  datetime.now().strftime("%d_%m_%Y_%Hh%Mm") + ".png"

dfi.export(df, filename)

print("feito")
