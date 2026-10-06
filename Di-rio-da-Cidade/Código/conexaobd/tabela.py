import sqlite3

conexao = sqlite3.connect('reclamacoes.db')
cursor = conexao.cursor()

cursor.execute(
    '''CREATE TABLE denuncias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo  Problema TEXT NOT NULL,
        dia TEXT NOT NULL,
        descricao TEXT NOT NULL,
        endereço TEXT NOT NULL,
        data_hora TEXT NOT NULL
    
    )'''
)
cursor.close()
print("Tabela 'reclamacoes' criada com sucesso!")