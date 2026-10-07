import sqlite3

def conectadb():
    conexao = sqlite3.connect('reclamacoes.db')
    return conexao

def inserdados(conexao, tipo_problema, dia, descricao, endereco, data_hora):
    conexao=conectadb()
    cursor = conexao.cursor()
    cursor.execute(
        '''INSERT INTO reclamacoes (tipo_problema, dia, descricao, endereco, data_hora)
           VALUES (?, ?, ?, ?, ?)''',
        (tipo_problema, dia, descricao, endereco, data_hora))
    conexao.commit()
    conexao.close()

def listardados(conexao):
    conexao=conectadb()
    cursor = conexao.cursor()
    cursor.execute('SELECT * FROM reclamacoes')
    dados = cursor.fetchall()
    cursor.close()
    conexao.close()
    return dados    
