from flask import Flask
from flask import jsonify  
from flask import request  

app = Flask(__name__)

@app.route("/")
def hello():
    return "Vaga Sender funcionando! 🚀"

@app.route("/enviar", methods=["POST"])
def enviar():
    dados = request.json  # pega o JSON que a extensão mandou

    texto = dados.get("texto", "")
    destino = dados.get("destino", "")

    # Por enquanto só imprime no terminal
    print(f"Texto recebido: {texto}")
    print(f"Destino: {destino}")

    return jsonify({
        "status": "recebido",
        "texto": texto,
        "destino": destino
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)