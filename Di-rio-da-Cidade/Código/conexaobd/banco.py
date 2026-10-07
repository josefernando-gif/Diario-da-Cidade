import sqlite3
import os

CAMINHO = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'reclamacoes.db')


def conectadb():
    conexao = sqlite3.connect(CAMINHO)
    conexao.row_factory = sqlite3.Row
    return conexao
