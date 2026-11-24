/* =========================================================
   DIÁRIO DA CIDADE - TEMA E IDIOMA
   Português (BR), English (US), Español
========================================================= */

(function () {
    "use strict";

    var IDIOMAS = ["pt", "en", "es"];

    var LOCALES = {
        pt: "pt-BR",
        en: "en-US",
        es: "es-ES"
    };

    var NOMES_IDIOMAS = {
        pt: "Português (Brasil)",
        en: "English (USA)",
        es: "Español"
    };

    var TRADUCOES = {
        pt: {
            "tema.alternar": "Alternar tema",
            "marca.titulo": "DIÁRIO DA CIDADE",
            "marca.subtitulo": "Barra do Garças - MT",
            "titulo.principal": "Diário da Cidade - Barra do Garças",
            "titulo.index": "Diário da Cidade - Login",
            "titulo.cadastro": "Diário da Cidade - Cadastro",
            "titulo.termos": "Termo de Autorização e Responsabilidade",

            "index.slogan": "Sua cidade, sua voz.",
            "index.titulo": "Acesse sua Conta",
            "index.email": "E-mail:",
            "index.email.placeholder": "Digite seu e-mail",
            "index.senha": "Senha:",
            "index.senha.placeholder": "Digite sua senha",
            "index.entrar": "Entrar",
            "index.semAcesso": "Ainda não tem acesso?",
            "index.criarConta": "Criar Nova Conta",
            "index.termos": "Termos de Uso",
            "index.privacidade": "Privacidade",
            "index.copyright": "© 2026 Diário da Cidade - Oficial",
            "index.avisoTermos": "Ao acessar o site estou ciente dos termos de uso",
            "index.erroLogin": "❌ E-mail ou senha incorretos!",

            "cadastro.titulo": "Criar Conta",
            "cadastro.nome": "Nome Completo:",
            "cadastro.nome.placeholder": "Digite seu nome completo",
            "cadastro.email": "E-mail:",
            "cadastro.email.placeholder": "exemplo@email.com",
            "cadastro.senha": "Senha:",
            "cadastro.senha.placeholder": "Crie uma senha",
            "cadastro.confirmar": "Confirme a Senha:",
            "cadastro.confirmar.placeholder": "Repita a senha",
            "cadastro.botao": "Cadastrar",
            "cadastro.sucesso": "✅ Cadastro realizado com sucesso!",
            "cadastro.erroSenha": "❌ As senhas não correspondem!",

            "termos.titulo": "Termo de Autorização, Uso de Dados e Responsabilidade",
            "termos.alerta": "ATENÇÃO: A aceitação deste termo é obrigatória para a publicação de qualquer manifesto ou denúncia neste portal.",
            "termos.intro": "Ao enviar seu relato para o portal <strong>Diário da Cidade</strong>, você declara estar ciente e em total concordância com as condições legais descritas a seguir:",
            "termos.h1": "1. Autorização de Publicação e Difusão",
            "termos.p1": "Você concede ao Diário da Cidade o direito gratuito, irrevogável e não exclusivo de publicar, hospedar, reproduzir e indexar em motores de busca (como o Google) o texto integral da sua manifestação, bem como eventuais imagens ou documentos anexados voluntariamente.",
            "termos.h2": "2. Responsabilidade Civil e Penal Exclusiva",
            "termos.p2": "Você atesta, sob as penas da lei, que é o autor legítimo do relato e que todos os fatos narrados são rigorosamente verdadeiros. Você assume total e exclusiva responsabilidade jurídica (civil e criminal) por eventuais danos morais ou materiais causados a terceiros, isentando o portal Diário da Cidade de qualquer cumplicidade, processo judicial ou pedido de indenização movido pela parte reclamada.",
            "termos.h3": "3. Critérios de Moderação e Exclusão",
            "termos.p3": "O portal reserva-se o direito de não publicar ou remover, a qualquer momento e sem aviso prévio, manifestações que contenham palavras de baixo calão, ofensas estritamente pessoais, termos discriminatórios, ameaças, ou que exponham dados sensíveis de terceiros (como CPF, RG ou endereço residencial) que não sejam estritamente necessários para a compreensão do fato.",
            "termos.h4": "4. Garantia do Direito de Resposta",
            "termos.p4": "Em conformidade com a legislação vigente, a empresa, autarquia ou órgão público citado na reclamação terá o direito garantido de publicar uma resposta formal ou contestação na mesma página, prezando pelo equilíbrio informativo e pela transparência.",
            "termos.h5": "5. Sigilo de Identidade e LGPD",
            "termos.p5": "Seus dados de cadastro (e-mail, telefone e documento de identidade) serão mantidos em ambiente seguro e criptografado, conforme as diretrizes da Lei Geral de Proteção de Dados (LGPD). Eles serão utilizados exclusivamente para validação interna da moderação, nunca sendo exibidos publicamente no site ou repassados a terceiros, exceto por expressa determinação judicial.",
            "termos.continuar": "Continuar",

            "principal.botao.reportar": "📍 Reportar Problema",
            "principal.botao.localizacao": "🎯 Minha Localização",
            "principal.botao.cancelarSelecao": "❌ Cancelar Seleção",
            "principal.status.inicial": "Clique em \"Reportar Problema\" para escolher um local no mapa.",
            "principal.mapa.titulo": "🗺️ Mapa de Problemas da Cidade",
            "principal.mapa.mensagem": "📍 Clique no mapa para escolher o local do problema",
            "principal.painel.titulo": "📢 Relatar Problema",
            "principal.tipo.label": "Tipo de Problema:",
            "principal.tipo.selecione": "Selecione",
            "principal.tipo.buraco": "🕳️ Buraco na rua",
            "principal.tipo.lixo": "🗑️ Lixo acumulado",
            "principal.tipo.luz": "💡 Luz apagada",
            "principal.tipo.agua": "💧 Água parada",
            "principal.tipo.outro": "⚠️ Outro",
            "principal.outro.label": "Descreva o tipo de problema:",
            "principal.outro.placeholder": "Digite o tipo de problema",
            "principal.descricao.label": "Descrição:",
            "principal.descricao.placeholder": "Descreva os detalhes do problema...",
            "principal.local.label": "Localização selecionada:",
            "principal.local.placeholder": "Selecione um ponto no mapa",
            "principal.termo.titulo": "Autorização de Publicação e Termo de Responsabilidade",
            "principal.termo.p1": "Ao enviar esta reclamação ao portal <strong>Diário da Cidade - Barra do Garças</strong>, você concorda com as regras abaixo:",
            "principal.termo.p2": "<strong>1. Autorização:</strong> Você concede direito gratuito e não exclusivo para o portal exibir publicamente este relato e sua localização.",
            "principal.termo.p3": "<strong>2. Veracidade:</strong> Você declara que as informações fornecidas são verdadeiras.",
            "principal.termo.p4": "<strong>3. Dados Pessoais:</strong> Dados pessoais eventualmente coletados devem ser tratados conforme a legislação aplicável, incluindo a LGPD.",
            "principal.termo.checkbox": "Declaro que sou o autor do relato e aceito os termos acima.",
            "principal.enviar": "🚀 Enviar Relato",
            "principal.enviando": "⏳ Enviando...",
            "principal.cancelar": "Cancelar",
            "principal.lista.titulo": "📋 Problemas registrados",
            "principal.contador.carregando": "Carregando...",
            "principal.contador": "{n} problema(s) registrado(s)",
            "principal.loading": "🔄 Carregando relatos...",
            "principal.lista.vazio": "📭 Nenhum problema registrado ainda.",
            "principal.lista.erro": "❌ Não foi possível carregar os relatos.",
            "principal.lista.erroContador": "Erro ao carregar",
            "principal.card.enviado": "📅 Enviado em:",
            "principal.data.indisponivel": "Data não disponível",
            "principal.popup.selecionado": "📍 Local selecionado",
            "principal.popup.arraste": "Arraste o marcador para ajustar o ponto.",
            "principal.popup.suaLocalizacao": "📍 Sua localização",
            "principal.status.agoraClique": "📍 Agora clique no mapa para marcar o local do problema.",
            "principal.status.localAtualizado": "📍 Local atualizado!",
            "principal.status.localSelecionado": "✅ Local selecionado! Preencha o formulário.",
            "principal.status.salvando": "⏳ Salvando seu relato no Firebase...",
            "principal.status.sucesso": "✅ Relato registrado com sucesso!",
            "principal.status.erroSalvar": "❌ Erro ao salvar o relato.",
            "principal.status.obtendoLocal": "📡 Obtendo sua localização...",
            "principal.status.localEncontrada": "✅ Sua localização foi encontrada!",
            "principal.status.localNaoEncontrada": "Não foi possível obter sua localização.",
            "principal.status.cancelado": "Clique em 'Reportar Problema' para selecionar um local.",
            "principal.status.firebaseErro": "❌ Erro ao conectar ao Firebase.",
            "principal.alerta.firebase": "❌ Firebase não está conectado.",
            "principal.alerta.selecioneLocal": "📍 Primeiro selecione o local no mapa.",
            "principal.alerta.aceiteTermos": "Você precisa aceitar os termos.",
            "principal.alerta.informeTipo": "Informe o tipo de problema.",
            "principal.alerta.digiteDescricao": "Digite uma descrição.",
            "principal.alerta.sucesso": "✅ Relato enviado com sucesso!",
            "principal.alerta.erroEnviar": "❌ Não foi possível enviar o relato.\n\nVerifique as regras do Firestore e a configuração do Firebase.",
            "principal.alerta.semGeo": "Seu navegador não suporta geolocalização.",
            "principal.alerta.geoNegada": "❌ Permissão de localização negada. Autorize a localização no navegador.",
            "principal.alerta.geoErro": "❌ Não foi possível obter sua localização."
        },

        en: {
            "tema.alternar": "Toggle theme",
            "marca.titulo": "DIÁRIO DA CIDADE",
            "marca.subtitulo": "Barra do Garças - MT",
            "titulo.principal": "Diário da Cidade - Barra do Garças",
            "titulo.index": "Diário da Cidade - Sign in",
            "titulo.cadastro": "Diário da Cidade - Registration",
            "titulo.termos": "Authorization and Liability Terms",

            "index.slogan": "Your city, your voice.",
            "index.titulo": "Access your Account",
            "index.email": "Email:",
            "index.email.placeholder": "Enter your email",
            "index.senha": "Password:",
            "index.senha.placeholder": "Enter your password",
            "index.entrar": "Sign in",
            "index.semAcesso": "Don't have access yet?",
            "index.criarConta": "Create New Account",
            "index.termos": "Terms of Use",
            "index.privacidade": "Privacy",
            "index.copyright": "© 2026 Diário da Cidade - Official",
            "index.avisoTermos": "By accessing the site I am aware of the terms of use",
            "index.erroLogin": "❌ Incorrect email or password!",

            "cadastro.titulo": "Create Account",
            "cadastro.nome": "Full Name:",
            "cadastro.nome.placeholder": "Enter your full name",
            "cadastro.email": "Email:",
            "cadastro.email.placeholder": "example@email.com",
            "cadastro.senha": "Password:",
            "cadastro.senha.placeholder": "Create a password",
            "cadastro.confirmar": "Confirm Password:",
            "cadastro.confirmar.placeholder": "Repeat the password",
            "cadastro.botao": "Register",
            "cadastro.sucesso": "✅ Registration completed successfully!",
            "cadastro.erroSenha": "❌ Passwords do not match!",

            "termos.titulo": "Authorization, Data Use and Liability Terms",
            "termos.alerta": "ATTENTION: Acceptance of these terms is mandatory for publishing any manifesto or complaint on this portal.",
            "termos.intro": "By submitting your report to the <strong>Diário da Cidade</strong> portal, you declare that you are aware of and fully agree to the legal conditions described below:",
            "termos.h1": "1. Authorization for Publication and Dissemination",
            "termos.p1": "You grant Diário da Cidade the free, irrevocable and non-exclusive right to publish, host, reproduce and index in search engines (such as Google) the full text of your statement, as well as any images or documents voluntarily attached.",
            "termos.h2": "2. Exclusive Civil and Criminal Liability",
            "termos.p2": "You attest, under penalty of law, that you are the legitimate author of the report and that all facts narrated are strictly true. You assume full and exclusive legal liability (civil and criminal) for any moral or material damages caused to third parties, releasing the Diário da Cidade portal from any complicity, judicial process or indemnification claim filed by the reported party.",
            "termos.h3": "3. Moderation and Removal Criteria",
            "termos.p3": "The portal reserves the right not to publish or to remove, at any time and without prior notice, statements containing profanity, strictly personal offenses, discriminatory terms, threats, or that expose sensitive third-party data (such as ID numbers or home address) that are not strictly necessary to understand the fact.",
            "termos.h4": "4. Guarantee of the Right of Reply",
            "termos.p4": "In accordance with current legislation, the company, authority or public body mentioned in the complaint will be guaranteed the right to publish a formal response or rebuttal on the same page, prioritizing informational balance and transparency.",
            "termos.h5": "5. Identity Confidentiality and LGPD",
            "termos.p5": "Your registration data (email, phone and identity document) will be kept in a secure and encrypted environment, in accordance with the guidelines of the General Data Protection Law (LGPD). They will be used exclusively for internal moderation validation, never being publicly displayed on the site or shared with third parties, except by express judicial determination.",
            "termos.continuar": "Continue",

            "principal.botao.reportar": "📍 Report Issue",
            "principal.botao.localizacao": "🎯 My Location",
            "principal.botao.cancelarSelecao": "❌ Cancel Selection",
            "principal.status.inicial": "Click \"Report Issue\" to choose a location on the map.",
            "principal.mapa.titulo": "🗺️ City Issues Map",
            "principal.mapa.mensagem": "📍 Click on the map to choose the issue location",
            "principal.painel.titulo": "📢 Report an Issue",
            "principal.tipo.label": "Issue Type:",
            "principal.tipo.selecione": "Select",
            "principal.tipo.buraco": "🕳️ Pothole in the street",
            "principal.tipo.lixo": "🗑️ Accumulated garbage",
            "principal.tipo.luz": "💡 Streetlight out",
            "principal.tipo.agua": "💧 Standing water",
            "principal.tipo.outro": "⚠️ Other",
            "principal.outro.label": "Describe the issue type:",
            "principal.outro.placeholder": "Enter the issue type",
            "principal.descricao.label": "Description:",
            "principal.descricao.placeholder": "Describe the details of the issue...",
            "principal.local.label": "Selected location:",
            "principal.local.placeholder": "Select a point on the map",
            "principal.termo.titulo": "Publication Authorization and Liability Terms",
            "principal.termo.p1": "By submitting this complaint to the <strong>Diário da Cidade - Barra do Garças</strong> portal, you agree to the rules below:",
            "principal.termo.p2": "<strong>1. Authorization:</strong> You grant the portal the free and non-exclusive right to publicly display this report and its location.",
            "principal.termo.p3": "<strong>2. Truthfulness:</strong> You declare that the information provided is true.",
            "principal.termo.p4": "<strong>3. Personal Data:</strong> Any personal data collected must be handled in accordance with applicable legislation, including the LGPD.",
            "principal.termo.checkbox": "I declare that I am the author of the report and accept the terms above.",
            "principal.enviar": "🚀 Send Report",
            "principal.enviando": "⏳ Sending...",
            "principal.cancelar": "Cancel",
            "principal.lista.titulo": "📋 Registered issues",
            "principal.contador.carregando": "Loading...",
            "principal.contador": "{n} issue(s) registered",
            "principal.loading": "🔄 Loading reports...",
            "principal.lista.vazio": "📭 No issues registered yet.",
            "principal.lista.erro": "❌ Could not load the reports.",
            "principal.lista.erroContador": "Error loading",
            "principal.card.enviado": "📅 Sent on:",
            "principal.data.indisponivel": "Date unavailable",
            "principal.popup.selecionado": "📍 Selected location",
            "principal.popup.arraste": "Drag the marker to adjust the point.",
            "principal.popup.suaLocalizacao": "📍 Your location",
            "principal.status.agoraClique": "📍 Now click on the map to mark the issue location.",
            "principal.status.localAtualizado": "📍 Location updated!",
            "principal.status.localSelecionado": "✅ Location selected! Fill in the form.",
            "principal.status.salvando": "⏳ Saving your report to Firebase...",
            "principal.status.sucesso": "✅ Report registered successfully!",
            "principal.status.erroSalvar": "❌ Error saving the report.",
            "principal.status.obtendoLocal": "📡 Getting your location...",
            "principal.status.localEncontrada": "✅ Your location was found!",
            "principal.status.localNaoEncontrada": "Could not get your location.",
            "principal.status.cancelado": "Click 'Report Issue' to select a location.",
            "principal.status.firebaseErro": "❌ Error connecting to Firebase.",
            "principal.alerta.firebase": "❌ Firebase is not connected.",
            "principal.alerta.selecioneLocal": "📍 First select the location on the map.",
            "principal.alerta.aceiteTermos": "You must accept the terms.",
            "principal.alerta.informeTipo": "Enter the issue type.",
            "principal.alerta.digiteDescricao": "Enter a description.",
            "principal.alerta.sucesso": "✅ Report sent successfully!",
            "principal.alerta.erroEnviar": "❌ Could not send the report.\n\nCheck the Firestore rules and the Firebase configuration.",
            "principal.alerta.semGeo": "Your browser does not support geolocation.",
            "principal.alerta.geoNegada": "❌ Location permission denied. Allow location access in your browser.",
            "principal.alerta.geoErro": "❌ Could not get your location."
        },

        es: {
            "tema.alternar": "Cambiar tema",
            "marca.titulo": "DIÁRIO DA CIDADE",
            "marca.subtitulo": "Barra do Garças - MT",
            "titulo.principal": "Diário da Cidade - Barra do Garças",
            "titulo.index": "Diário da Cidade - Iniciar sesión",
            "titulo.cadastro": "Diário da Cidade - Registro",
            "titulo.termos": "Términos de Autorización y Responsabilidad",

            "index.slogan": "Tu ciudad, tu voz.",
            "index.titulo": "Accede a tu Cuenta",
            "index.email": "Correo electrónico:",
            "index.email.placeholder": "Ingresa tu correo electrónico",
            "index.senha": "Contraseña:",
            "index.senha.placeholder": "Ingresa tu contraseña",
            "index.entrar": "Iniciar sesión",
            "index.semAcesso": "¿Aún no tienes acceso?",
            "index.criarConta": "Crear Nueva Cuenta",
            "index.termos": "Términos de Uso",
            "index.privacidade": "Privacidad",
            "index.copyright": "© 2026 Diário da Cidade - Oficial",
            "index.avisoTermos": "Al acceder al sitio soy consciente de los términos de uso",
            "index.erroLogin": "❌ ¡Correo o contraseña incorrectos!",

            "cadastro.titulo": "Crear Cuenta",
            "cadastro.nome": "Nombre Completo:",
            "cadastro.nome.placeholder": "Escribe tu nombre completo",
            "cadastro.email": "Correo electrónico:",
            "cadastro.email.placeholder": "ejemplo@email.com",
            "cadastro.senha": "Contraseña:",
            "cadastro.senha.placeholder": "Crea una contraseña",
            "cadastro.confirmar": "Confirma la Contraseña:",
            "cadastro.confirmar.placeholder": "Repite la contraseña",
            "cadastro.botao": "Registrarse",
            "cadastro.sucesso": "✅ ¡Registro realizado con éxito!",
            "cadastro.erroSenha": "❌ ¡Las contraseñas no coinciden!",

            "termos.titulo": "Términos de Autorización, Uso de Datos y Responsabilidad",
            "termos.alerta": "ATENCIÓN: La aceptación de estos términos es obligatoria para la publicación de cualquier manifiesto o denuncia en este portal.",
            "termos.intro": "Al enviar tu relato al portal <strong>Diário da Cidade</strong>, declaras estar consciente y totalmente de acuerdo con las condiciones legales descritas a continuación:",
            "termos.h1": "1. Autorización de Publicación y Difusión",
            "termos.p1": "Otorgas a Diário da Cidade el derecho gratuito, irrevocable y no exclusivo de publicar, alojar, reproducir e indexar en motores de búsqueda (como Google) el texto íntegro de tu manifestación, así como las posibles imágenes o documentos adjuntados voluntariamente.",
            "termos.h2": "2. Responsabilidad Civil y Penal Exclusiva",
            "termos.p2": "Certificas, bajo pena de ley, que eres el autor legítimo del relato y que todos los hechos narrados son rigurosamente verdaderos. Asumes total y exclusiva responsabilidad jurídica (civil y penal) por eventuales daños morales o materiales causados a terceros, eximiendo al portal Diário da Cidade de cualquier complicidad, proceso judicial o solicitud de indemnización presentada por la parte denunciada.",
            "termos.h3": "3. Criterios de Moderación y Exclusión",
            "termos.p3": "El portal se reserva el derecho de no publicar o eliminar, en cualquier momento y sin aviso previo, manifestaciones que contengan palabras obscenas, ofensas estrictamente personales, términos discriminatorios, amenazas, o que expongan datos sensibles de terceros (como documento de identidad o dirección residencial) que no sean estrictamente necesarios para comprender el hecho.",
            "termos.h4": "4. Garantía del Derecho de Réplica",
            "termos.p4": "De conformidad con la legislación vigente, la empresa, autoridad u organismo público citado en la reclamación tendrá garantizado el derecho de publicar una respuesta formal o réplica en la misma página, priorizando el equilibrio informativo y la transparencia.",
            "termos.h5": "5. Confidencialidad de Identidad y LGPD",
            "termos.p5": "Tus datos de registro (correo electrónico, teléfono y documento de identidad) se mantendrán en un entorno seguro y cifrado, de acuerdo con las directrices de la Ley General de Protección de Datos (LGPD). Se utilizarán exclusivamente para la validación interna de la moderación, nunca se mostrarán públicamente en el sitio ni se compartirán con terceros, salvo por determinación judicial expresa.",
            "termos.continuar": "Continuar",

            "principal.botao.reportar": "📍 Reportar Problema",
            "principal.botao.localizacao": "🎯 Mi Ubicación",
            "principal.botao.cancelarSelecao": "❌ Cancelar Selección",
            "principal.status.inicial": "Haz clic en \"Reportar Problema\" para elegir un lugar en el mapa.",
            "principal.mapa.titulo": "🗺️ Mapa de Problemas de la Ciudad",
            "principal.mapa.mensagem": "📍 Haz clic en el mapa para elegir el lugar del problema",
            "principal.painel.titulo": "📢 Reportar Problema",
            "principal.tipo.label": "Tipo de Problema:",
            "principal.tipo.selecione": "Selecciona",
            "principal.tipo.buraco": "🕳️ Bache en la calle",
            "principal.tipo.lixo": "🗑️ Basura acumulada",
            "principal.tipo.luz": "💡 Luz apagada",
            "principal.tipo.agua": "💧 Agua estancada",
            "principal.tipo.outro": "⚠️ Otro",
            "principal.outro.label": "Describe el tipo de problema:",
            "principal.outro.placeholder": "Escribe el tipo de problema",
            "principal.descricao.label": "Descripción:",
            "principal.descricao.placeholder": "Describe los detalles del problema...",
            "principal.local.label": "Ubicación seleccionada:",
            "principal.local.placeholder": "Selecciona un punto en el mapa",
            "principal.termo.titulo": "Autorización de Publicación y Términos de Responsabilidad",
            "principal.termo.p1": "Al enviar esta reclamación al portal <strong>Diário da Cidade - Barra do Garças</strong>, aceptas las reglas a continuación:",
            "principal.termo.p2": "<strong>1. Autorización:</strong> Otorgas al portal el derecho gratuito y no exclusivo de mostrar públicamente este relato y su ubicación.",
            "principal.termo.p3": "<strong>2. Veracidad:</strong> Declaras que la información proporcionada es verdadera.",
            "principal.termo.p4": "<strong>3. Datos Personales:</strong> Los datos personales eventualmente recopilados deben tratarse de acuerdo con la legislación aplicable, incluida la LGPD.",
            "principal.termo.checkbox": "Declaro que soy el autor del relato y acepto los términos anteriores.",
            "principal.enviar": "🚀 Enviar Relato",
            "principal.enviando": "⏳ Enviando...",
            "principal.cancelar": "Cancelar",
            "principal.lista.titulo": "📋 Problemas registrados",
            "principal.contador.carregando": "Cargando...",
            "principal.contador": "{n} problema(s) registrado(s)",
            "principal.loading": "🔄 Cargando relatos...",
            "principal.lista.vazio": "📭 Aún no hay problemas registrados.",
            "principal.lista.erro": "❌ No fue posible cargar los relatos.",
            "principal.lista.erroContador": "Error al cargar",
            "principal.card.enviado": "📅 Enviado el:",
            "principal.data.indisponivel": "Fecha no disponible",
            "principal.popup.selecionado": "📍 Lugar seleccionado",
            "principal.popup.arraste": "Arrastra el marcador para ajustar el punto.",
            "principal.popup.suaLocalizacao": "📍 Tu ubicación",
            "principal.status.agoraClique": "📍 Ahora haz clic en el mapa para marcar el lugar del problema.",
            "principal.status.localAtualizado": "📍 ¡Lugar actualizado!",
            "principal.status.localSelecionado": "✅ ¡Lugar seleccionado! Completa el formulario.",
            "principal.status.salvando": "⏳ Guardando tu relato en Firebase...",
            "principal.status.sucesso": "✅ ¡Relato registrado con éxito!",
            "principal.status.erroSalvar": "❌ Error al guardar el relato.",
            "principal.status.obtendoLocal": "📡 Obteniendo tu ubicación...",
            "principal.status.localEncontrada": "✅ ¡Tu ubicación fue encontrada!",
            "principal.status.localNaoEncontrada": "No fue posible obtener tu ubicación.",
            "principal.status.cancelado": "Haz clic en 'Reportar Problema' para seleccionar un lugar.",
            "principal.status.firebaseErro": "❌ Error al conectar con Firebase.",
            "principal.alerta.firebase": "❌ Firebase no está conectado.",
            "principal.alerta.selecioneLocal": "📍 Primero selecciona el lugar en el mapa.",
            "principal.alerta.aceiteTermos": "Debes aceptar los términos.",
            "principal.alerta.informeTipo": "Informa el tipo de problema.",
            "principal.alerta.digiteDescricao": "Escribe una descripción.",
            "principal.alerta.sucesso": "✅ ¡Relato enviado con éxito!",
            "principal.alerta.erroEnviar": "❌ No fue posible enviar el relato.\n\nVerifica las reglas de Firestore y la configuración de Firebase.",
            "principal.alerta.semGeo": "Tu navegador no admite geolocalización.",
            "principal.alerta.geoNegada": "❌ Permiso de ubicación denegado. Autoriza la ubicación en el navegador.",
            "principal.alerta.geoErro": "❌ No fue posible obtener tu ubicación."
        }
    };

    var idiomaAtual = "pt";

    function idiomaSalvo() {
        var salvo = null;

        try {
            salvo = localStorage.getItem("dg-idioma");
        }
        catch (erro) {
            salvo = null;
        }

        if (salvo && IDIOMAS.indexOf(salvo) !== -1) {
            return salvo;
        }

        var navegador = (navigator.language || "pt").toLowerCase();

        if (navegador.indexOf("en") === 0) {
            return "en";
        }

        if (navegador.indexOf("es") === 0) {
            return "es";
        }

        return "pt";
    }

    function temaSalvo() {
        var salvo = null;

        try {
            salvo = localStorage.getItem("dg-tema");
        }
        catch (erro) {
            salvo = null;
        }

        if (salvo === "dark" || salvo === "light") {
            return salvo;
        }

        if (
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
        ) {
            return "dark";
        }

        return "light";
    }

    function t(chave, variaveis) {
        var dicionario = TRADUCOES[idiomaAtual] || TRADUCOES.pt;
        var texto = dicionario[chave];

        if (texto === undefined) {
            texto = TRADUCOES.pt[chave];
        }

        if (texto === undefined) {
            return chave;
        }

        if (variaveis) {
            Object.keys(variaveis).forEach(function (nome) {
                texto = texto.replace(
                    new RegExp("\\{" + nome + "\\}", "g"),
                    variaveis[nome]
                );
            });
        }

        return texto;
    }

    function atualizarBotoesIdioma() {
        document
            .querySelectorAll("[data-dg-lang]")
            .forEach(function (botao) {
                var codigo = botao.getAttribute("data-dg-lang");
                var ativo = codigo === idiomaAtual;

                botao.classList.toggle("ativo", ativo);
                botao.setAttribute(
                    "aria-pressed",
                    ativo ? "true" : "false"
                );
                botao.setAttribute(
                    "title",
                    NOMES_IDIOMAS[codigo] || codigo
                );
            });
    }

    function atualizarBotaoTema() {
        var botao = document.querySelector(".dg-switch");

        if (!botao) {
            return;
        }

        var escuro =
            document.documentElement.getAttribute("data-theme") === "dark";

        botao.setAttribute(
            "aria-checked",
            escuro ? "true" : "false"
        );
        botao.setAttribute("aria-label", t("tema.alternar"));
        botao.setAttribute("title", t("tema.alternar"));
    }

    function aplicarIdioma(novoIdioma) {
        if (IDIOMAS.indexOf(novoIdioma) === -1) {
            return;
        }

        idiomaAtual = novoIdioma;

        try {
            localStorage.setItem("dg-idioma", idiomaAtual);
        }
        catch (erro) {
            /* armazenamento indisponível */
        }

        document.documentElement.setAttribute(
            "lang",
            LOCALES[idiomaAtual]
        );
        document.documentElement.setAttribute(
            "data-lang",
            idiomaAtual
        );

        document
            .querySelectorAll("[data-i18n]")
            .forEach(function (elemento) {
                elemento.textContent = t(
                    elemento.getAttribute("data-i18n")
                );
            });

        document
            .querySelectorAll("[data-i18n-html]")
            .forEach(function (elemento) {
                elemento.innerHTML = t(
                    elemento.getAttribute("data-i18n-html")
                );
            });

        document
            .querySelectorAll("[data-i18n-placeholder]")
            .forEach(function (elemento) {
                elemento.setAttribute(
                    "placeholder",
                    t(
                        elemento.getAttribute(
                            "data-i18n-placeholder"
                        )
                    )
                );
            });

        document
            .querySelectorAll("[data-i18n-title]")
            .forEach(function (elemento) {
                elemento.setAttribute(
                    "title",
                    t(
                        elemento.getAttribute("data-i18n-title")
                    )
                );
            });

        atualizarBotoesIdioma();
        atualizarBotaoTema();

        window.dispatchEvent(
            new CustomEvent("dg:idioma", {
                detail: { lang: idiomaAtual }
            })
        );
    }

    function aplicarTema(novoTema) {
        var tema = novoTema === "dark" ? "dark" : "light";

        document.documentElement.setAttribute("data-theme", tema);

        try {
            localStorage.setItem("dg-tema", tema);
        }
        catch (erro) {
            /* armazenamento indisponível */
        }

        atualizarBotaoTema();
    }

    function alternarTema() {
        var atual =
            document.documentElement.getAttribute("data-theme");

        aplicarTema(atual === "dark" ? "light" : "dark");
    }

    function criarControles() {
        var controles = document.createElement("div");

        controles.className = "dg-controles";
        controles.setAttribute("role", "group");
        controles.setAttribute("aria-label", "Preferências");

        controles.innerHTML =
            '<div class="dg-idiomas" role="group" aria-label="Idioma">' +
                '<button type="button" data-dg-lang="pt">🇧🇷 <span>PT</span></button>' +
                '<button type="button" data-dg-lang="en">🇺🇸 <span>EN</span></button>' +
                '<button type="button" data-dg-lang="es">🇪🇸 <span>ES</span></button>' +
            '</div>' +
            '<button type="button" class="dg-switch" role="switch" aria-checked="false">' +
                '<span class="dg-switch-trilho">' +
                    '<span class="dg-switch-icone dg-sol">☀️</span>' +
                    '<span class="dg-switch-icone dg-lua">🌙</span>' +
                    '<span class="dg-switch-bolinha"></span>' +
                '</span>' +
            '</button>';

        var cabecalho = document.querySelector("header");

        if (cabecalho) {
            cabecalho.appendChild(controles);
        }
        else {
            controles.classList.add("dg-fixo");
            document.body.appendChild(controles);
            document.body.classList.add("dg-tem-controles-fixos");
        }

        controles
            .querySelectorAll("[data-dg-lang]")
            .forEach(function (botao) {
                botao.addEventListener("click", function () {
                    aplicarIdioma(
                        botao.getAttribute("data-dg-lang")
                    );
                });
            });

        controles
            .querySelector(".dg-switch")
            .addEventListener("click", alternarTema);

        atualizarBotoesIdioma();
        atualizarBotaoTema();
    }

    idiomaAtual = idiomaSalvo();

    document.documentElement.setAttribute(
        "lang",
        LOCALES[idiomaAtual]
    );
    document.documentElement.setAttribute(
        "data-lang",
        idiomaAtual
    );
    document.documentElement.setAttribute(
        "data-theme",
        temaSalvo()
    );

    window.dgT = t;
    window.dgLocale = function () {
        return LOCALES[idiomaAtual];
    };
    window.dgIdioma = function () {
        return idiomaAtual;
    };
    window.dgAplicarIdioma = aplicarIdioma;
    window.dgAlternarTema = alternarTema;

    function iniciar() {
        criarControles();
        aplicarIdioma(idiomaAtual);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    }
    else {
        iniciar();
    }
})();
