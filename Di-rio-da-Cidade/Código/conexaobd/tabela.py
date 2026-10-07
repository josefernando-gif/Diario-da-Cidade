import sqlite3
import os

CAMINHO = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'reclamacoes.db')

conexao = sqlite3.connect(CAMINHO)
cursor = conexao.cursor()

# Remove as tabelas antigas (estavam vazias e com colunas inválidas)
cursor.execute('DROP TABLE IF EXISTS denuncias')
cursor.execute('DROP TABLE IF EXISTS reclamacoes')

cursor.execute(
    '''CREATE TABLE reclamacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT NOT NULL,
        descricao TEXT NOT NULL,
        endereco TEXT NOT NULL,
        lat REAL,
        lng REAL,
        termo_aceito INTEGER NOT NULL DEFAULT 1,
        data_hora TEXT NOT NULL
    )'''
)

conexao.commit()
conexao.close()
print("Tabela 'reclamacoes' criada com sucesso!")
