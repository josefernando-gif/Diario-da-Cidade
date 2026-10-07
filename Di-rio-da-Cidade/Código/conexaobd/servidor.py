import os
from flask import Flask, jsonify, request, send_from_directory
from funcoes import inserdados, listardados

PASTA_HTML = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

app = Flask(__name__)


@app.after_request
def cors(resp):
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return resp


@app.route('/api/reclamacoes', methods=['GET'])
def api_listar():
    return jsonify(listardados())


@app.route('/api/reclamacoes', methods=['POST', 'OPTIONS'])
def api_criar():
    if request.method == 'OPTIONS':
        return '', 204
    d = request.get_json(silent=True) or {}
    tipo = str(d.get('tipo', '')).strip()[:100]
    descricao = str(d.get('descricao', '')).strip()[:1000]
    endereco = str(d.get('endereco', '')).strip()[:500]
    try:
        lat, lng = float(d['lat']), float(d['lng'])
    except (KeyError, TypeError, ValueError):
        return jsonify(erro='Coordenadas inválidas'), 400
    if not (tipo and descricao and endereco):
        return jsonify(erro='Preencha tipo, descrição e localização'), 400
    if not d.get('termoAceito'):
        return jsonify(erro='É necessário aceitar os termos'), 400
    novo_id, data_hora = inserdados(tipo, descricao, endereco, lat, lng)
    return jsonify(id=novo_id, data_hora=data_hora), 201


# Serve as páginas HTML (Index, Principal, cadastrar, Termos de Uso)
@app.route('/')
def raiz():
    return send_from_directory(PASTA_HTML, 'Index.html')


@app.route('/<path:nome>')
def arquivos(nome):
    return send_from_directory(PASTA_HTML, nome)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
