import sqlite3

conexao = sqlite3.connect('reclamacoes.db')
cursor = conexao.cursor()

cursor.execute('DROP TABLE IF EXISTS reclamacoes')

cursor.execute(
    '''CREATE TABLE reclamacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo_problema TEXT NOT NULL,
        dia TEXT NOT NULL,
        descricao TEXT NOT NULL,
        endereco TEXT NOT NULL,
        data_hora TEXT NOT NULL
    )'''
)

conexao.commit()
conexao.close()
print("Tabela 'reclamacoes' criada com sucesso!")