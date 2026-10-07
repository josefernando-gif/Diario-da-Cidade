from datetime import datetime, timezone
from banco import conectadb


def inserdados(tipo, descricao, endereco, lat, lng, termo_aceito=True):
    data_hora = datetime.now(timezone.utc).isoformat()
    conexao = conectadb()
    cursor = conexao.cursor()
    cursor.execute(
        '''INSERT INTO reclamacoes
           (tipo, descricao, endereco, lat, lng, termo_aceito, data_hora)
           VALUES (?, ?, ?, ?, ?, ?, ?)''',
        (tipo, descricao, endereco, lat, lng, int(termo_aceito), data_hora))
    novo_id = cursor.lastrowid
    conexao.commit()
    conexao.close()
    return novo_id, data_hora


def listardados():
    conexao = conectadb()
    cursor = conexao.cursor()
    cursor.execute('SELECT * FROM reclamacoes ORDER BY data_hora DESC, id DESC')
    dados = [dict(linha) for linha in cursor.fetchall()]
    conexao.close()
    return dados
