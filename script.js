// PAGE 3 GLOBAL VARIABLES
let quizzTitle, quizzURLImage, quizzQuestionCount, quizzLevelCount;
let mainContent = document.getElementById('main-content');
let questionsObjectArray = [];
let answersObjectArray = [];
let levelsObjectArray = [];
let levelInnerObject = {};
let questions = [];
let percentArray = [];
let globalObject = {};
const url = 'https://mock-api.driven.com.br/api/vm/buzzquizz';
// PAGE 1

let UserQuizzes = [];
let AllQuizzes = [];

if (window.location.pathname === '/index.html') {
  getQuizzes();
}

function getQuizzes() {
  const promise = axios.get(url + '/quizzes');
  const pageContent = document.querySelector('.page-content');
  pageContent.innerHTML = `<div data-test="spinner" class="loadingio-spinner-spinner-o8gjei26vab"><div class="ldio-skwu1xskgdp">
  <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
  </div></div>`;

  promise.then(sortAndCallRenderQuizzes);
  promise.catch(() => {
    failedToGetQuizzes();
    pageContent.innerHTML = '';
  });
}

//função chamada quando houve falha na requisição GET
function failedToGetQuizzes() {
  alert(
    'Tivemos um erro inesperado ao carregar o(s) Quizz(es). Por favor, recarregue a página que a gente tenta de novo =)',
  );
}

function sortAndCallRenderQuizzes(quizzesResponse) {
  //essa função deve separar os quizzes entre quizzes do server e quizzes do usuario, e só então chamar o renderiza

  const ServerQuizzes = quizzesResponse.data;
  //chama a função que separa os quizzes entre gerais e de usuário
  sortUserQuizzes(ServerQuizzes);
  //chama a função para renderizar os quizzes
  RenderQuizzes();
}

function sortUserQuizzes(ServerQuizzesList) {
  for (let i = 0; i < ServerQuizzesList.length; i++) {
    const singleQuizz = ServerQuizzesList[i];
    //agora devemos verificar se esse quizz pertence ao usuario ou não
    if (quizzFromUser(singleQuizz)) {
      //caso true (quizz é do usuário), popula a lista de quizzes de usuário
      UserQuizzes.push(singleQuizz);
    } else {
      //caso false (quizz não é do usuário), popula a lista de quizzes gerais
      AllQuizzes.push(singleQuizz);
    }
  }
}

//função que verifica que é do usuário ou não
function quizzFromUser(quizzToBeAnalysed) {
  const userQuizzesFromStorage = getLocalStorageQuizzes();

  for (let i = 0; i < userQuizzesFromStorage.length; i++) {
    //caso o ID do quizz analisado seja igual à um id armazenado em localStorage, quer dizer que é um quizz de usuário
    if (userQuizzesFromStorage[i].id === quizzToBeAnalysed.id) {
      return true;
    }
  }
  //caso não encontra, retorna false
  return false;
}

//salva em localStorage
function saveQuizzToLocalStorage(response) {
  const quizz = response.data;
  //puxa o conteúdo do local storage
  const localStorageDataObject = getLocalStorageQuizzes();
  //armazena no localStorage o id e a key do quizz
  localStorageDataObject.push({ id: quizz.id, key: quizz.key });
  //transforma em string e manda pro localStorage
  localStorage.setItem('ids', JSON.stringify(localStorageDataObject));
}

//puxa dados da localStorage
function getLocalStorageQuizzes() {
  let localQuizzes = localStorage.getItem('ids');
  if (localQuizzes !== null) {
    //caso tenha quizzes locais, retorna os dados desserializados (transforma de string pra objeto)
    const deserialized = JSON.parse(localQuizzes);
    return deserialized;
  } else {
    //caso não tenha quizzes locais, cria um array vazio
    return [];
  }
}

function RenderQuizzes() {
  document.querySelector('.page-content').innerHTML = `<div class="user-quizzes" id="user-quizzes-html">
  </div>
  <div class="all-quizzes" id="all-quizzes-html">
  </div>
  `;
  let userQuizzesHTML = '';
  let allQuizzesHTML = '';

  if (UserQuizzes.length === 0) {
    //caso não tenha quizzes do usuário, o HTML a ser montado deve ser aquele com botão grande
    userQuizzesHTML = makeEmptyUserQuizzesHTML();
    //populando o HTML da seção de Quizzes do Usuário
    const elementUserQuizzes = document.getElementById('user-quizzes-html');
    elementUserQuizzes.innerHTML = `${userQuizzesHTML}`;
  } else {
    //caso tenha quizzes do usuário, o HTML a ser montado deve ser o que mostra os quizzes do usuario
    userQuizzesHTML = makeUserQuizzesCardsHTML();
    //populando o HTML da seção de Quizzes do Usuário
    const elementUserQuizzes = document.getElementById('user-quizzes-html');
    elementUserQuizzes.innerHTML = `
    <div class="have-user-quizzes">
            <div class="user-quizzes-header">
              <h1> Seus Quizzes </h1>
              <button data-test="create-btn" onclick="goToCreateQuizz()">+</button>
            </div>
            <div class="quizzes-list">
              ${userQuizzesHTML}
            </div>
          </div>
    `;
  }

  //chamamos a função para montar o HTML da parte que mostra Todos os Quizzes
  allQuizzesHTML = makeAllQuizzesCardsHTML();

  //populando o HTML da seção de Todos os Quizzes
  const elementAllQuizzes = document.getElementById('all-quizzes-html');
  elementAllQuizzes.innerHTML = `
  <h1> Todos os Quizzes </h1>
  <div class="quizzes-list" id = "all-quizzes-html">
    ${allQuizzesHTML}
  </div>`;
}

//função que monta o HTML da parte de quizzes de usuário, quando não há nenhum quizz do usuário
function makeEmptyUserQuizzesHTML() {
  return `
  <div class="empty-user-quizzes">
    <h1>Você não criou nenhum quizz ainda :(</h1>
    <button data-test="create-btn" onclick="goToCreateQuizz()">Criar Quizz</button>
  </div>
  `;
}

//função que monta o HTML da lista de quizzes de usuário
function makeUserQuizzesCardsHTML() {
  let UserQuizzesCardsHTML = '';
  //para cada quizz de usuário, monta o html correspondente a ele
  for (let i = 0; i < UserQuizzes.length; i++) {
    UserQuizzesCardsHTML += makeQuizzCardHTML(UserQuizzes[i], true);
  }
  return UserQuizzesCardsHTML;
}

//função que monta o HTML da lista de todos os quizzes
function makeAllQuizzesCardsHTML() {
  let AllQuizzesCardsHTML = '';
  //para cada quizz geral, monta o html correspondente a ele
  for (let i = 0; i < AllQuizzes.length; i++) {
    AllQuizzesCardsHTML += makeQuizzCardHTML(AllQuizzes[i]);
  }
  return AllQuizzesCardsHTML;
}

//função que monta um card de um quizz
function makeQuizzCardHTML(quizz, isUserQuiz = false) {
  return `
  <div class="quizz-card" onclick="showQuizz('${quizz.id}')" data-test="${isUserQuiz ? 'my-quiz' : 'others-quiz'}">
    <img src = "${quizz.image}">
    <div class="overlay"></div>
    <div class="quizz-card-title"> ${quizz.title} </div>
    ${
      isUserQuiz
        ? `<ion-icon onclick="deletar(${quizz.id}, event)" class="delete" data-test="delete" name="trash-outline"></ion-icon>
           <ion-icon onclick="pegarEdit(${quizz.id}, event)" class="edit" data-test="edit" name="create-outline"></ion-icon>
          `
        : ''
    }
  </div>
  `;
}

function teste(event) {
  event.stopPropagation();
  console.log('teste');
}
//função que redireciona para a página 2 (jogar quizz)
function showQuizz(id) {
  salvarQuizzes(id);
  window.open('/tela2/index.html', '_self');
}

//função que redireciona para a página 3 (criar quizz)
function goToCreateQuizz(quiz) {
  if (quiz) {
    localStorage.setItem('quizEdit', JSON.stringify(quiz));
  }
  window.open('/tela3/index.html', '_self');
}

function deletar(id, event) {
  event.stopPropagation();

  // show confirm message
  const confirm = window.confirm('Tem certeza que deseja deletar esse quizz?');
  if (!confirm) {
    return;
  }

  // get key from localStorage
  const ids = JSON.parse(localStorage.getItem('ids'));
  const findId = ids.find((item) => item.id == id);
  const key = findId.key;
  // send Secret-Key on header

  const pageContent = document.querySelector('.page-content');
  pageContent.innerHTML = `<div data-test="spinner" class="loadingio-spinner-spinner-o8gjei26vab"><div class="ldio-skwu1xskgdp">
  <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
  </div></div>`;

  axios
    .delete(`${url}/quizzes/${id}`, {
      headers: {
        'Secret-Key': key,
      },
    })
    .then((response) => {
      console.log(response);
      pageContent.innerHTML = `<div class="user-quizzes" id="user-quizzes-html">
      </div>
      <div class="all-quizzes" id="all-quizzes-html">
      </div>
      `;
      window.location.reload();
    })
    .catch((error) => {
      console.log(error);
      window.location.reload();
    });
}

function pegarEdit(id, event) {
  event.stopPropagation();

  let quiz = {};
  axios
    .get(`${url}/quizzes/${id}`)
    .then((response) => {
      quiz = response.data;
      console.log(quiz);
      goToCreateQuizz(quiz);
    })
    .catch((error) => {
      console.log(error);
    });
}

// PAGE 1 END

// PAGE 2

let qtdPerguntas;
let QuestoesRespondidas = 0;
let resultado = 0;
let resultadoFinal = 0;
let levelsArray;

function responder() {
  const quizz = document.querySelector('main');
  quizz.innerHTML = `<div data-test="spinner" class="loadingio-spinner-spinner-o8gjei26vab"><div class="ldio-skwu1xskgdp">
  <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
  </div></div>`;
  id = localStorage.getItem('quizzSelecionado');
  axios
    .get(`${url}/quizzes/${id}`)
    .then((response) => {
      let item = response.data;

      levelsArray = item.levels;

      let add = `<div class="titulo" data-test="banner">
                  <div class="black"><img src="${item.image}" alt="Titulo"></div>
                  <h1>${item.title}</h1>
                </div>`;

      qtdPerguntas = item.questions.length;

      for (var i = 0; i < item.questions.length; i++) {
        const quantidadeDeRespostas = item.questions[i].answers;
        const sortido = quantidadeDeRespostas.sort(baguncar);

        function baguncar() {
          return 0.5 - Math.random();
        }
        add += `<div class="quizz">
                  <div class='quadrado'>
                    <div data-test="question" class="pergunta">
                      <div data-test="question-title" class="cabecalho" style="background-color:${item.questions[i].color}">
                      <p class="ctitulo">${item.questions[i].title}</p>
                    </div>`;

        let quantidadeDePerguntas = sortido.length;
        for (var j = 0; j < quantidadeDePerguntas; j++) {
          if (j == 0) {
            add += `<div class="quadro">
                        <div data-test="answer" class="resposta ${sortido[j].isCorrectAnswer} quiz${i}${j}">
                          <img src="${sortido[j].image}" alt="quiz${i}${j}">
                          <p data-test="answer-text" class="paragrafo">${sortido[j].text}</p>
                        </div>`;
          }
          if (j == 1) {
            add += `<div data-test="answer" class="resposta ${sortido[j].isCorrectAnswer} quiz${i}${j}">
                        <img src="${sortido[j].image}" alt="quiz${i}${j}">
                        <p data-test="answer-text" class="paragrafo">${sortido[j].text}</p>
                      </div>
                    </div>`;
          }

          if (j == 2) {
            add += `<div class="quadro">
                        <div data-test="answer" class="resposta ${sortido[j].isCorrectAnswer} quiz${i}${j}">
                          <img src="${sortido[j].image}" alt="quiz${i}${j}">
                          <p data-test="answer-text" class="paragrafo">${sortido[j].text}</p>
                        </div>`;
            if (quantidadeDePerguntas == 3) {
              add += `</div>`;
            }
          }

          if (j == 3) {
            add += `<div data-test="answer" class="resposta ${sortido[j].isCorrectAnswer} quiz${i}${j}">
                        <img src="${sortido[j].image}" alt="quiz${i}${j}">
                        <p data-test="answer-text" class="paragrafo">${sortido[j].text}</p>
                    </div>
                  </div>`;
          }
        }
        add += `</div>
                </div>
                </div>
                `;
      }

      quizz.innerHTML = add;
    })

    .catch((error) => {
      // do nothing
    });
}

function salvarQuizzes(id) {
  localStorage.setItem('quizzSelecionado', id);
}

const main = document.querySelector('main');
let contador = 0;

main?.addEventListener('click', function (e) {
  let alt = e.srcElement.alt;

  if (!alt.includes('quiz') || alt.length == 0) {
    return;
  }

  let resposta_click = document.querySelector(`.${alt}`);
  resposta_click.classList.add('escolhido');

  let resposta = document.querySelectorAll('.resposta');

  for (let i = 0; i < resposta.length; i++) {
    if (!resposta[i].className.includes('escolhido')) {
      if (alt[4] == resposta[i].className.split('quiz')[1][0]) {
        resposta[i].classList.add('desabilitado');
      }
    }

    if (resposta[i].className.includes('false')) {
      if (alt[4] == resposta[i].className.split('quiz')[1][0]) {
        resposta[i].classList.add('errado');
      }
    } else if (resposta[i].className.includes('true')) {
      if (alt[4] == resposta[i].className.split('quiz')[1][0]) {
        resposta[i].classList.add('certo');
      }
    }
  }

  for (let i = 0; i < resposta.length; i++) {
    if (resposta[i].className.includes('escolhido') && resposta[i].className.includes('certo')) {
      if (alt[4] == resposta[i].className.split('quiz')[1][0]) {
        resultado++;
      }
    }
  }

  resultadoFinal = Math.round((resultado / qtdPerguntas) * 100);

  QuestoesRespondidas++;

  if (QuestoesRespondidas == qtdPerguntas) {
    let array = [];
    for (let i = 0; i < levelsArray.length; i++) {
      array.push(Number(levelsArray[i].minValue));
    }

    let final = document.querySelector('main');
    let add2 = `<div class='rodape'>
                <div class='quadrado'>
                <div class="final">`;

    let posicao;

    for (let i = 0; i < array.length; i++) {
      if (resultadoFinal >= array[i]) {
        posicao = i;
      }
    }
    add2 += `<div data-test="level-title" class="topo">
                <p>${resultadoFinal}% de acerto: ${levelsArray[posicao].title}</p>
                </div>
                <div class="menu">
                <div class="imagem">
                <img data-test="level-img" src="${levelsArray[posicao].image}" alt="Final">
                </div>
                <div class="texto">
                <p data-test="level-text">${levelsArray[posicao].text}</p>
                </div>
                </div>
                </div>
                </div>
                </div>`;

    final.innerHTML += add2;
  }

  function scrollar() {
    let proximaResposta = document.querySelectorAll(`.quadrado`);
    contador++;
    proximaResposta[contador].scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    });
  }

  setTimeout(scrollar(), 2000);
});

// chamar responder se estiver na tela 2
if (window.location.href.includes('tela2')) {
  responder();
}

const botaoReiniciar = document.querySelector('.reiniciar');

botaoReiniciar?.addEventListener('click', function (e) {
  const reiniciar = document.querySelector('div:last-child');

  reiniciar.scrollIntoView({ block: 'end', behavior: 'smooth' });
  // scrollar para o topo smooth
  window.scrollTo({ top: 0, behavior: 'smooth' });

  let resposta = document.querySelectorAll('.resposta');

  for (i = 0; i < resposta.length; i++) {
    if (resposta[i].className.includes('certo')) {
      resposta[i].classList.remove('certo');
    } else if (resposta[i].className.includes('errado')) {
      resposta[i].classList.remove('errado');
    }

    if (resposta[i].className.includes('desabilitado')) {
      resposta[i].classList.remove('desabilitado');
    } else if (resposta[i].className.includes('escolhido')) {
      resposta[i].classList.remove('escolhido');
    }
  }
  resultado = 0;
  contador = 0;
  resultadoFinal = 0;
  QuestoesRespondidas = 0;
  responder();
});

const botaoHome = document.querySelector('.home');

botaoHome?.addEventListener('click', function (e) {
  window.location = '../index.html';
});

// PAGE 2 END

// PAGE 3

if (window.location.href.includes('tela3')) {
  const quizEdit = JSON.parse(localStorage.getItem('quizEdit'));
  if (quizEdit) {
    document.getElementById('quizz-title').value = quizEdit.title;
    document.getElementById('quizz-URL-Image').value = quizEdit.image;
    document.getElementById('quizz-question-count').value = quizEdit.questions.length;
    document.getElementById('quizz-level-count').value = quizEdit.levels.length;
  }
}

function verifyValuesQuizzFirstPage() {
  let ErrorMessage = `
Ocorreu um problema na validação do seu quizz. 
Por favor, verifique se: 
Seu título ficou entre 20 caracteres e 65 caracteres; 
Se foi inserida uma URL válida na sua imagem; 
Se selecionou pelo menos 3 perguntas;
Se selecionou no mínimo 2 níveis.
`;

  quizzTitle = document.getElementById('quizz-title').value;
  quizzURLImage = document.getElementById('quizz-URL-Image').value;
  quizzQuestionCount = document.getElementById('quizz-question-count').value;
  quizzLevelCount = document.getElementById('quizz-level-count').value;

  if (
    quizzTitle.length < 20 ||
    quizzTitle.length > 65 ||
    !quizzURLImage.startsWith('https://') ||
    quizzQuestionCount < 3 ||
    quizzLevelCount < 2
  ) {
    alert(ErrorMessage);
  } else {
    handleGoToQuizzPage2();
  }
}

function handleGoToQuizzPage2() {
  let baseToPrint = `
    <div class="form-container" id="second-form">
        <h1 class="form-title">Crie suas perguntas</h1>

        <form action="#" class="">
        </form>
        
    </div>
    `;

  mainContent.innerHTML = baseToPrint;

  let mainFormContainer = document.getElementById('second-form');

  let formContainer = document.querySelector('#second-form form');

  const quizEdit = JSON.parse(localStorage.getItem('quizEdit'));

  for (let i = 1; i <= quizzQuestionCount; i++) {
    if (i === 1) {
      formContainer.innerHTML = `
        <div data-test="question-ctn" class="question-container identifyQuestionForm${i}">
			    <h1 class="question-title">Pergunta 1</h1>
          <input
            data-test="question-input"
            type="text"
            placeholder="Texto da pergunta"
            minlength="20"
            id="quizz-question-text"
            value="${quizEdit?.questions[i - 1]?.title || ''}"} 
          />
          <input
            data-test="question-color-input"
            type="text"
            placeholder="Cor de fundo da pergunta"
            id="quizz-question-color"
            value="${quizEdit?.questions[i - 1]?.color || ''}"}
          />
		      <div class="question-container">
			      <h1 class="question-title">Resposta correta</h1>
            <input
              data-test="correct-answer-input"
              type="text"
              placeholder="Resposta correta"
              minlength="1"
              id="quizz-correct-answer-text"
              value="${quizEdit?.questions[i - 1]?.answers[0]?.text || ''}"}
            />
            <input
              data-test="correct-img-input"
              type="text"
              placeholder="URL da imagem"
              id="quizz-correct-answer-image"
              value="${quizEdit?.questions[i - 1]?.answers[0]?.image || ''}"}
            />
          </div>
          <div class="wrong-answer-container">
			      <h1 class="question-title">Respostas incorretas</h1>
			      <div class="wrong-answer">
				      <input
				      type="text"
				      placeholder="Resposta incorreta 1"
              minlength="1"
				      id="quizz-wrong-answer-text1"
              data-test="wrong-answer-input"
              value="${quizEdit?.questions[i - 1]?.answers[1]?.text || ''}"}
			        />
			        <input
				      type="text"
				      placeholder="URL da imagem 1"
				      id="quizz-wrong-answer-image1"
              data-test="wrong-img-input"
              value="${quizEdit?.questions[i - 1]?.answers[1]?.image || ''}"}
			        />
			      </div>
			      <div class="wrong-answer">
				      <input
				      type="text"
				      placeholder="Resposta incorreta 2"
				      id="quizz-wrong-answer-text2"
              data-test="wrong-answer-input"
              value="${quizEdit?.questions[i - 1]?.answers[2]?.text || ''}"}
			        />
			        <input
				      type="text"
				      placeholder="URL da imagem 2"
				      id="quizz-wrong-answer-image2"
              data-test="wrong-img-input"
              value="${quizEdit?.questions[i - 1]?.answers[2]?.image || ''}"}
			        />
			      </div>
			      <div class="wrong-answer">
			      	<input
			      	type="text"
			      	placeholder="Resposta incorreta 3"
			      	id="quizz-wrong-answer-text3"
              data-test="wrong-answer-input"
              value="${quizEdit?.questions[i - 1]?.answers[3]?.text || ''}"}
			        />
			        <input
			      	type="text"
			      	placeholder="URL da imagem 3"
			      	id="quizz-wrong-answer-image3"
              data-test="wrong-img-input"
              value="${quizEdit?.questions[i - 1]?.answers[3]?.image || ''}"}
			        />
			      </div>
          </div>
        </div>
		  
        `;
    } else {
      mainFormContainer.innerHTML += `
      <div class="toOpen" >
      <div data-test="question-ctn" class="closed-form-container" id="closed-container${i}">
        <h1 class="question-title">
          Pergunta ${i}
        </h1>
  
        <button data-test="toggle" onclick="openCloseContainer(${i})">
          <img src="../assets/edit-icon.svg" alt="">
        </button>	
        </div>
        <form data-test="question-ctn" action="#" class="hidden identifyQuestionForm${i}" id="openned-container${i}">
            <div class="question-container">
        <h1 class="question-title">Pergunta ${i}</h1>
              <input
                type="text"
                placeholder="Texto da pergunta"
                minlength="20"
                id="quizz-question-text"
                data-test="question-input"
                value="${quizEdit?.questions[i - 1]?.title || ''}"}
              />
              <input
                type="text"
                placeholder="Cor de fundo da pergunta"
                id="quizz-question-color"
                data-test="question-color-input"
                value="${quizEdit?.questions[i - 1]?.color || ''}"}
              />
            </div>
  
        <div class="question-container">
        <h1 class="question-title">Resposta correta</h1>
              <input
                type="text"
                placeholder="Resposta correta"
                minlength="1"
                id="quizz-correct-answer-text"
                data-test="correct-answer-input"
                value="${quizEdit?.questions[i - 1]?.answers[0]?.text || ''}"}
              />
              <input
                type="text"
                placeholder="URL da imagem"
                id="quizz-correct-answer-image"
                data-test="correct-img-input"
                value="${quizEdit?.questions[i - 1]?.answers[0]?.image || ''}"}
              />
            </div>
  
            <div class="wrong-answer-container">
        <h1 class="question-title">Respostas incorretas</h1>
        <div class="wrong-answer">
          <input
          type="text"
          placeholder="Resposta incorreta 1"
          minlength="1"
          id="quizz-wrong-answer-text1"
          data-test="wrong-answer-input"
          value="${quizEdit?.questions[i - 1]?.answers[1]?.text || ''}"}
          />
          <input
          type="text"
          placeholder="URL da imagem 1"
          id="quizz-wrong-answer-image1"
          data-test="wrong-img-input"
          value="${quizEdit?.questions[i - 1]?.answers[1]?.image || ''}"}
          />
        </div>
  
        <div class="wrong-answer">
          <input
          type="text"
          placeholder="Resposta incorreta 2"
          id="quizz-wrong-answer-text2"
          data-test="wrong-answer-input"
          value="${quizEdit?.questions[i - 1]?.answers[2]?.text || ''}"}
          />
          <input
          type="text"
          placeholder="URL da imagem 2"
          id="quizz-wrong-answer-image2"
          data-test="wrong-img-input"
          value="${quizEdit?.questions[i - 1]?.answers[2]?.image || ''}"}
          />
        </div>
  
        <div class="wrong-answer">
          <input
          type="text"
          placeholder="Resposta incorreta 3"
          id="quizz-wrong-answer-text3"
          data-test="wrong-answer-input"
          value="${quizEdit?.questions[i - 1]?.answers[3]?.text || ''}"}
          />
          <input
          type="text"
          placeholder="URL da imagem 3"
          id="quizz-wrong-answer-image3"
          data-test="wrong-img-input"
          value="${quizEdit?.questions[i - 1]?.answers[3]?.image || ''}"}
          />
        </div>
        
            </div>
        
              
          </form>
      </div>
  
      `;
    }
  }

  mainFormContainer.innerHTML += `
  <button data-test="go-create-levels" class="form-button" onclick="verifyValuesQuizzSecondPage()">
	 		Prosseguir pra criar níveis
	 	  </button> 
  `;
}

function verifyValuesQuizzSecondPage() {
  let quizzQuestionsCount = 0;
  let quizzAnswerCount = 0;
  let moreWrong = [];

  for (let i = 1; i <= quizzQuestionCount; i++) {
    let questionText = document.querySelector(`.identifyQuestionForm${i} #quizz-question-text`).value;

    console.log(i);
    let questionColor = document.querySelector(`.identifyQuestionForm${i} #quizz-question-color`).value;
    if (questionText.length > 20 && questionColor.match(/^#(?:[0-9a-fA-F]{3}){1,2}$/i))
      questionsObjectArray.push({ title: questionText, color: questionColor });
    else {
      return handleInvalidQuizzValues();
    }

    quizzQuestionsCount++;

    let questionCorrectAnswer = document.querySelector(`.identifyQuestionForm${i} #quizz-correct-answer-text`).value;

    let questionCorrectAnswerImage = document.querySelector(
      `.identifyQuestionForm${i} #quizz-correct-answer-image`,
    ).value;

    if (questionCorrectAnswer !== '' && questionCorrectAnswerImage.startsWith('https://'))
      answersObjectArray.push({
        text: questionCorrectAnswer,
        image: questionCorrectAnswerImage,
        isCorrectAnswer: true,
      });
    else {
      return handleInvalidQuizzValues();
    }

    let questionWrongAnswer1 = document.querySelector(`.identifyQuestionForm${i} #quizz-wrong-answer-text1`).value;

    let questionWrongAnswerImage1 = document.querySelector(
      `.identifyQuestionForm${i} #quizz-wrong-answer-image1`,
    ).value;

    if (
      questionWrongAnswer1 !== '' &&
      questionWrongAnswerImage1 !== '' &&
      questionWrongAnswerImage1.startsWith('https://')
    ) {
      answersObjectArray.push({
        text: questionWrongAnswer1,
        image: questionWrongAnswerImage1,
        isCorrectAnswer: false,
      });
      //quizzAnswerCount++;
    } else {
      return handleInvalidQuizzValues();
    }

    let questionWrongAnswer2 = document.querySelector(`.identifyQuestionForm${i} #quizz-wrong-answer-text2`).value;

    let questionWrongAnswerImage2 = document.querySelector(
      `.identifyQuestionForm${i} #quizz-wrong-answer-image2`,
    ).value;

    if (questionWrongAnswer2 !== '' && questionWrongAnswerImage2 !== '') {
      moreWrong.push({
        text: questionWrongAnswer2,
        image: questionWrongAnswerImage2,
        isCorrectAnswer: false,
      });
      quizzAnswerCount++;
    }

    let questionWrongAnswer3 = document.querySelector(`.identifyQuestionForm${i} #quizz-wrong-answer-text3`).value;

    let questionWrongAnswerImage3 = document.querySelector(
      `.identifyQuestionForm${i} #quizz-wrong-answer-image3`,
    ).value;

    if (
      questionWrongAnswer3 !== '' &&
      questionWrongAnswerImage3 !== '' &&
      questionWrongAnswerImage3.startsWith('https://')
    ) {
      moreWrong.push({
        text: questionWrongAnswer3,
        image: questionWrongAnswerImage3,
        isCorrectAnswer: false,
      });
      quizzAnswerCount++;
    }

    if (quizzAnswerCount === 0) {
      questions.push({
        title: questionText,
        color: questionColor,
        answers: [
          {
            text: questionCorrectAnswer,
            image: questionCorrectAnswerImage,
            isCorrectAnswer: true,
          },
          {
            text: questionWrongAnswer1,
            image: questionWrongAnswerImage1,
            isCorrectAnswer: false,
          },
        ],
      });
    }

    if (quizzAnswerCount === 1) {
      questions.push({
        title: questionText,
        color: questionColor,
        answers: [
          {
            text: questionCorrectAnswer,
            image: questionCorrectAnswerImage,
            isCorrectAnswer: true,
          },
          {
            text: questionWrongAnswer1,
            image: questionWrongAnswerImage1,
            isCorrectAnswer: false,
          },
          {
            text: questionWrongAnswer2,
            image: questionWrongAnswerImage2,
            isCorrectAnswer: false,
          },
        ],
      });

      quizzAnswerCount = 0;
    }

    if (quizzAnswerCount === 2) {
      questions.push({
        title: questionText,
        color: questionColor,
        answers: [
          {
            text: questionCorrectAnswer,
            image: questionCorrectAnswerImage,
            isCorrectAnswer: true,
          },
          {
            text: questionWrongAnswer1,
            image: questionWrongAnswerImage1,
            isCorrectAnswer: false,
          },
          {
            text: questionWrongAnswer2,
            image: questionWrongAnswerImage2,
            isCorrectAnswer: false,
          },
          {
            text: questionWrongAnswer3,
            image: questionWrongAnswerImage3,
            isCorrectAnswer: false,
          },
        ],
      });
      quizzAnswerCount = 0;
    }
  }

  handleGoToQuizzPage3();
}

function handleInvalidQuizzValues() {
  let questionErrorMessage = `
Ocorreu um problema na validação das suas perguntas. 
Por favor, verifique se: 
Sua pergunta tem, no mínimo, 20 caracteres; 
Sua cor de fundo está no formato hexadecimal;
Se o texto das respostas não está vazio;
Se foi inserida uma URL válida na sua imagem; 
Se inseriu pelo menos 1 resposta correta e 1 resposta errada em cada pergunta.
`;

  questions = [];

  alert(questionErrorMessage);
}

function openCloseContainer(value) {
  let actualContainer = document.getElementById(`closed-container${value}`);
  actualContainer.classList.add('hidden');
  let expectedContainer = document.getElementById(`openned-container${value}`);
  expectedContainer.classList.remove('hidden');
}

function handleGoToQuizzPage3() {
  let baseToPrint = `
    <div class="form-container" id="third-form">
        <h1 class="form-title">Agora, decida os níveis</h1>

        <form data-test="level-ctn" action="#" class="identifyLevelForm1">
        </form>
        
    </div>
    `;

  mainContent.innerHTML = baseToPrint;

  let mainFormContainer = document.getElementById('third-form');

  let formContainer = document.querySelector('#third-form form');

  const quizEdit = JSON.parse(localStorage.getItem('quizEdit'));

  for (let i = 1; i <= quizzLevelCount; i++) {
    if (i === 1) {
      formContainer.innerHTML = `
      <h1 class="question-title">Nível 1</h1>
      <input
        type="text"
        placeholder="Título do nível"
        minlength="10"
        id="quizz-level-title"
        data-test="level-input"
        value="${quizEdit?.levels[i - 1]?.title || ''}"
      />
      <input
        type="number"
        placeholder="% de acerto mínima"
        id="quizz-level-percentage"
        data-test="level-percent-input"
        value="${quizEdit?.levels[i - 1]?.minValue !== undefined ? quizEdit?.levels[i - 1]?.minValue : ''}"
      />
      <input
        type="text"
        placeholder="URL da imagem do nível"
        id="quizz-level-image"
        data-test="level-img-input"
        value="${quizEdit?.levels[i - 1]?.image || ''}"
      />
      <textarea
        cols="30"
        rows="5"
        minlength="30"
        placeholder="Descrição do nível"
        id="quizz-level-description"
        data-test="level-description-input"
      >${quizEdit?.levels[i - 1]?.text || ''}</textarea>
      `;
    } else {
      mainFormContainer.innerHTML += `
      <div class="toOpen" >
      <div data-test="level-ctn" class="closed-form-container" id="closed-container${i}">
			<h1 class="question-title">
				Nível ${i}
			</h1>
			<button data-test="toggle" onclick="openCloseContainer(${i})">
				<img src="../assets/edit-icon.svg" alt="">
			</button>			
		</div>

    <form data-test="level-ctn" action="#" class="hidden identifyLevelForm${i}" id="openned-container${i}">
			<h1 class="question-title">Nível ${i}</h1>
          <input
            type="text"
            placeholder="Título do nível"
            minlength="10"
            id="quizz-level-title"
            data-test="level-input"
            value="${quizEdit?.levels[i - 1]?.title || ''}"
          />
          <input
            type="number"
            placeholder="% de acerto mínima"
            id="quizz-level-percentage"
            data-test="level-percent-input"
            value="${quizEdit?.levels[i - 1]?.minValue || ''}"
          />
          <input
            type="text"
            placeholder="URL da imagem do nível"
            id="quizz-level-image"
            data-test="level-img-input"
            value="${quizEdit?.levels[i - 1]?.image || ''}"
          />
          <textarea
            cols="30"
            rows="5"
            minlength="30"
            placeholder="Descrição do nível"
            id="quizz-level-description"
            data-test="level-description-input"
          >${quizEdit?.levels[i - 1]?.text || ''}</textarea>
        </form>
      </div>      
      `;
    }
  }
  mainFormContainer.innerHTML += `
  <button data-test="finish" class="form-button" onclick="verifyValuesQuizzThirdPage()">
    Finalizar Quizz
	</button> 
  `;
}

function verifyValuesQuizzThirdPage() {
  for (let i = 1; i <= quizzLevelCount; i++) {
    let levelTitle = document.querySelector(`.identifyLevelForm${i} #quizz-level-title`).value;
    if (levelTitle.length < 10) {
      return handleInvalidLevelValues();
    }

    let levelPercentage = document.querySelector(`.identifyLevelForm${i} #quizz-level-percentage`).value;
    if (levelPercentage < 0 || levelPercentage > 100 || levelPercentage === '') {
      return handleInvalidLevelValues();
    } else {
      percentArray.push(levelPercentage);
    }

    let levelImageURL = document.querySelector(`.identifyLevelForm${i} #quizz-level-image`).value;
    if (!levelImageURL.startsWith('https://')) {
      return handleInvalidLevelValues();
    }

    let levelDescription = document.querySelector(`.identifyLevelForm${i} #quizz-level-description`).value;
    if (levelDescription.length < 30) {
      return handleInvalidLevelValues();
    }

    levelInnerObject = {
      title: levelTitle,
      image: levelImageURL,
      text: levelDescription,
      minValue: +levelPercentage,
    };
    levelsObjectArray.push(levelInnerObject);

    levelInnerObject = {};
  }

  if (percentArray.indexOf('0') === -1) {
    return handleInvalidLevelValues();
  } else {
    makeFinalObject();
  }
}

function makeFinalObject() {
  globalObject = {
    title: quizzTitle,
    image: quizzURLImage,
    questions: questions,
    levels: levelsObjectArray,
  };

  percentArray = [];
  levelsObjectArray = [];
  levelInnerObject = {};

  sendQuizz();
}

function sendQuizz() {
  const main = document.querySelector('main');
  main.innerHTML = `<div data-test="spinner" class="loadingio-spinner-spinner-o8gjei26vab"><div class="ldio-skwu1xskgdp">
  <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
  </div></div>
  `;

  const quizEdit = JSON.parse(localStorage.getItem('quizEdit'));
  if (quizEdit) {
    const quizFromLocalStorage = JSON.parse(localStorage.getItem('ids')).find((quiz) => quiz.id == quizEdit.id);
    const key = quizFromLocalStorage.key;
    let promise = axios.put(url + '/quizzes/' + quizEdit.id, globalObject, {
      headers: {
        'Secret-Key': key,
      },
    });
    promise.then((response) => {
      main.innerHTML = '';
      localStorage.removeItem('quizEdit');
      getCreatedQuizzId(response);
    });
    promise.catch((err) => {
      alert('Erro ao enviar quizz');
      main.innerHTML = '';
    });
    return;
  }

  let promise = axios.post(url + '/quizzes', globalObject);
  promise.then(getCreatedQuizzId);
  promise.catch((err) => {
    alert('Erro ao enviar quizz');
  });
}

function getCreatedQuizzId(response) {
  let quizzId = response.data.id;
  //armazena o quizz em local storage
  saveQuizzToLocalStorage(response);
  //exibe página de sucesso
  handleGoToQuizzPage4(quizzId);
}

function handleInvalidLevelValues() {
  let questionErrorMessage = `
Ocorreu um problema na validação das suas perguntas. 
Por favor, verifique se: 
Seu título tem, no mínimo, 10 caracteres; 
A porcentagem de acerto deve ficar entre 0 e 100;
Se foi inserida uma URL válida na sua imagem; 
A descrição do nível deve ter, no mínimo, 30 caracteres;
É necessário que exista pelo menos um nível cuja porcentagem de acerto mínima seja 0%.
`;
  percentArray = [];
  levelsObjectArray = [];
  levelInnerObject = {};
  alert(questionErrorMessage);
}

function openLevelEdit(value) {
  let actualContainer = document.getElementById(`closed-level-container${value}`);
  actualContainer.classList.add('hidden');
  let expectedContainer = document.getElementById(`openned-level-container${value}`);
  expectedContainer.classList.remove('hidden');
}

function handleGoToQuizzPage4(id) {
  let toPrint = `
    <div class="form-container" id="first-form">
    <h1 class="form-title">Seu quizz está pronto!</h1>
    <div data-test="success-banner" class="final-quizz-container">
        <img  src="${quizzURLImage}" alt="">
        <div class="gradient"></div>
        <p>
            ${quizzTitle}
        </p>
    </div>
    <button data-test="go-quiz" class="form-button" onclick="handleGoToCreatedQuizz(${id})">
      Acessar Quizz
    </button>
    <button data-test="go-home" class="home-button" onclick="goHome()">
        Voltar pra home
    </button>
  </div>
    `;

  mainContent.innerHTML = toPrint;
}

function handleGoToCreatedQuizz(quizzValue) {
  salvarQuizzes(quizzValue);
  window.open('/tela2/index.html', '_self');
}

function goHome() {
  window.open('/index.html', '_self');
}

// PAGE 3 END
