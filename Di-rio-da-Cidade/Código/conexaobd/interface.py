import streamlit as st
import pandas as pd
import funcoes

conexao = funcoes.conectadb()   # criada uma vez, no topo

st.title("Sistema de Reclamações")

with st.form("form_reclamacao"):
    tipo_problema = st.text_input("Tipo de Problema")
    dia = st.text_input("Dia")
    descricao = st.text_area("Descrição")
    endereco = st.text_input("Endereço")
    data_hora = st.text_input("Data e Hora")

    submitted = st.form_submit_button("Enviar Reclamação")

if submitted:
    funcoes.inserdados(conexao, tipo_problema, dia, descricao, endereco, data_hora)
    st.success("Reclamação enviada com sucesso!")

if st.button("Listar Reclamações"):
    dados = funcoes.listardados(conexao)
    tb = pd.DataFrame(dados, columns=["ID", "Tipo de Problema", "Dia", "Descrição", "Endereço", "Data e Hora"])
    st.header("Lista de reclamações")
    st.dataframe(tb)