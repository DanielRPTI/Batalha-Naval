//DOM -> ELEMENTOS DA NOSSA PAGINA 
const gameTable = document.getElementById('gametable-container')
const optionContainer = document.querySelector('.option-container');
const turnBtn = document.getElementById('turn-btn');
const startBtn = document.getElementById('start-btn');
const infoDisplay = document.getElementById('info');
const turnDisplay = document.getElementById('turn-display')


/* - TurnShip() Função que vira os barcos.
Variaveis:  
- angle -> variavel recebendo nosso angulo padrão , para ser alterado caso o botão seja clicado 
- ships -> dentro da variavel ships , estou recebendo todos os filhos da div optionContainer.
*/
let angle = 0;
function turnShip(){
  //utilizei Array.from para colocar todos os filhos da div OptionContainer fora de um HTMLCollection 
  const ships = Array.from(optionContainer.children)
  if(angle === 0){
    angle = 90;
  }else{
    angle = 0;
  }
    ships.forEach(ship => {
      //atribui para cada elemento no nosso container de opções a função rotate do css 
      ship.style.transform = `rotate(${angle}deg)`
    });
  }
  
//Criando nossas Tabelas
/*De largura 10x10, criei uma variavel global width pois irei utilizar ela em outros lugares da lógica(não seria necessário,mas achei
para uma boa visão do codigo).
*/
const width = 10;
function createTable(color, id){
  const gameTableContainer =  document.createElement('div');
  gameTableContainer.classList.add('game-table');
  gameTableContainer.style.backgroundColor = color;
  gameTableContainer.id = id;

  for (let i = 0; i < width * width; i++){
    const block = document.createElement('div');
    block.classList.add('block')
    block.id = i;
    gameTableContainer.append(block)
  }
  gameTable.append(gameTableContainer);
}
createTable('lightblue', 'player');
createTable('yellow', 'bot');


//Criação de uma Função construtora , para criarmos nossos barcos  com -> (name, lenght)
function Ship(name, length){
  this.name = name;
  this.length = length;
}
const destroyer =  new Ship('destroyer', 2);
const submarine =  new Ship('submarine', 3);
const cruiser =  new Ship('cruiser', 3);
const battleShip =  new Ship('battleship', 4);
const carrier =  new Ship('carrier', 5);
//Array  com nossos barcos 
const ships = [destroyer, submarine, cruiser, battleShip, carrier];
console.log(ships)
//Variavel notDrop utilizado na nossa function dragble Start e Drop para identificarmos se foi escolhido o campo
let notDrop;

/*Handle de validação que lida se o campo já está preenchido(class->taken) e retorna os indices a onde estão sendo inserido os barcos 
Params -> BoardBlcoks -> blocos do usuario ou bot, 
isHorizontal -> Boolean return, 
blockIndex -> index aleatorio obtido pelo Math.random
Ship -> o barco escolhido
*/
/*verificamos se o blockIndex que foi informado é valido para ser preenchido por um barco ,se ele for atribuimos esse valor ao validStartIndex
  caso nao seja reposicionamos ele subtraindo o valor total das divs pelo lenght do barco escolhido 
  a um handle que segue a mesma logica porém é realizado a mutiplicação para pegarmos o elemento na vertical caso isHorizontal retorne false
*/ 
function isValid(boardBlocks, isHorizontal, blockIndex, ship){

  let validStartIndex;
  if(isHorizontal ){
    if(blockIndex <= width * width - ship.length){
      validStartIndex = blockIndex;
    }else{
      validStartIndex = width * width - ship.length;
    }
  }else{
    //Handle para os blocos em vertical
    if(blockIndex <= width * width - width * ship.length){
      validStartIndex = blockIndex;
    }else{
      validStartIndex = blockIndex - ship.length * width + width;
      console.log(validStartIndex)
    }
  }

  //Array responsavel por armazenar todos os espaços ocupados pelo nosso barco
  let shipBlocks = [];
  //loop para colocarmos os barcos na board na horizontal ou vertical
  for(let i = 0; i < ship.length; i++){
    if(isHorizontal){
      shipBlocks.push(boardBlocks[Number(validStartIndex) + i])
    } else{
      shipBlocks.push(boardBlocks[Number(validStartIndex) + i * width])
    }
  } 

  /*Condição para validarmos o limit da tabela 
  no caso da horizontal se está no limite a direita da tabela 
  já na vertical ele verifica o nosso limite inferior levando em conta a nossa altura
  */
  let valid; 
  if(isHorizontal){
    shipBlocks.every((_shipBlocks,index) => 
      valid = shipBlocks[0].id % width !== width - (shipBlocks.length - (index - 1))
    )
  }else{
    shipBlocks.every((_shipBlocks, index) => 
    valid = shipBlocks[0].id < 90 + (width * index + 1)
  )
  }

  //condição para verificarmos se o block não possui a class Taken 
  const notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken'))

  return { shipBlocks, notTaken, valid}
}

/*Função usada para adicionar os barcos de acordo com a posição escolhida params -> 
user -> bot ou player id
ship ->  array com os barcos
blockId -> no caso do player temos o id a onde o barco foi dropado
*/
function addShipPiece(user, ship, blockId){
  const boardBlocks = document.querySelectorAll(`#${user} div`);
  let randomBoolean = Math.random() < 0.5; //me retorna um true or false aleatoriamente
  let isHorizontal = user === 'player' ? angle === 0 : randomBoolean;
  let randomIndexBot = Math.floor(Math.random() * width * width);
 
  //teste aplicado para o player , para não utilizarmos o index aleatorio do bot
  //BlockIndex -> div sorteada caso bot ,ou caso seja um player o blockId vai ter um valor passado no parametro da função, se não ele retorna o valaor aleatorio se estiver vazio o parametro
  let blockIndex = blockId ? blockId : randomIndexBot;

//Faço uma desestruturação para utilizar as variaveis retornadas pela função de validação
 const {shipBlocks, notTaken, valid} = isValid(boardBlocks, isHorizontal, blockIndex, ship)

  console.log(blockIndex);

  if(notTaken && valid){
    shipBlocks.forEach(block => {
     block.classList.add(ship.name);
     block.classList.add('taken');
    })
  }else{
    if(user ===  'bot'){
      addShipPiece(user, ship, blockId);
    } 
    if(user === 'player') {
      notDrop = true; 
    }
  }
}
//Adicionando os barcos a tabela do Bot 
  ships.forEach(ship => addShipPiece('bot',ship));

//Posicionando nossos barcos na table
  /* Adicionamos um um evento para cada div nossa\
    - dragOver 
    - dragStart = pega nossa div usando o event.target  e setamos o valor de notDrop como false sendo padrão 
    - dropShipBlock = blockID -> pega a div em que lançamos o nosso barco, e nosso ship faz referencia ao id pego na função
    dragStart , depois executamos nossa função de adição
  */
  let getShip;
  const selectShip = Array.from(optionContainer.children);
  selectShip.forEach(select => select.addEventListener('dragstart', dragStart));

  const allPlayerBlocks = document.querySelectorAll('#player div');
  allPlayerBlocks.forEach(block => {
    block.addEventListener('dragover', dragOver);
    block.addEventListener('drop',dropShipBlock)
  })

// pegamos a div filha que foi puxada e/ou arrastada. 
function dragStart(event){
  notDrop = false;
  getShip = event.target;
  console.log(getShip)
}

function dragOver(event){
  event.preventDefault();
  const blockId = event.target.id;
  const ship = ships[getShip.id]
  hoverArea(blockId, ship)
}

function dropShipBlock(event){
  const blockId = event.target.id;
  const ship = ships[getShip.id]
  console.log(blockId)
  addShipPiece('player', ship, blockId)
  if(!notDrop){
    getShip.remove();
  }
}

//Add hoverArea , função para executarmos aquela estilização sobre os campos que estamos escolhendo 
function hoverArea(blockIndex, ship) {
  const allPlayerBlocks = document.querySelectorAll('#player div');
  let isHorizontal = angle === 0;

  const {shipBlocks, notTaken, valid} = isValid(allPlayerBlocks,isHorizontal, blockIndex, ship );
  if(notTaken && valid){
    shipBlocks.forEach(shipBlock => {
      shipBlock.classList.add('hover')
      setTimeout(() => shipBlock.classList.remove('hover'), 100)
    })
  }
}

//-------------------------------Inicio do jogo------------------------------- 
let gameOver = false; 
let playerTurn;

function startGame(){
  if(playerTurn === undefined){
    if(optionContainer.children.length != 0){
      infoDisplay.textContent = 'Please drag and drop all your ships in the battle, to Start! ';
    }else{
      const allBoardBlock = document.querySelectorAll('#bot div');
      allBoardBlock.forEach(block => {
        block.addEventListener('click', playersTry)
      })
      playerTurn = true;
      turnDisplay.textContent = 'Your first time to try!';
      infoDisplay.textContent = 'The game has been started!'
    }
  }
}
//Players e bot info 
//amarzena o nome do barco atigindo pelo player/bot em um array
let playerHits  = [];
let botHits  = [];
//Array de barcos afundados 
const playerSunkShips = [];
const botSunkShips = []; 

//Sistema de controle de tentativas

function playersTry(event){
  if(!gameOver){
    if(event.target.classList.contains('taken')){
      event.target.classList.add('hit');
      infoDisplay.textContent = 'You hit ship!';
      let classes = Array.from(event.target.classList);
      classes = classes.filter(className => className !== 'block')
      classes = classes.filter(className => className !== 'hit')
      classes = classes.filter(className => className !== 'taken')
      playerHits.push(...classes)
      checkScore('player', playerHits, playerSunkShips);
    }
    if(!event.target.classList.contains('taken')){
      infoDisplay.textContent = 'You missed try again...';
      event.target.classList.add('fail-try')
    }
    playerTurn = false;
    const allBoardBlocks = document.querySelectorAll('#bot div')
    allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)))
    setTimeout(botGo, 3000)
  }
}

//Função do nosso bot para jogar 
function botGo(){
  if(!gameOver){
    turnDisplay.textContent = 'Bot are palying  now';
    infoDisplay.textContent = 'The bot is tring to find yours Ships';

    /*Setamos um timeout para o bot fazer uma busca aléatoria  por todas as divs do noss player, que contenham as 
    classes taken mas não contenham a classe hit , colocamos o timesout para realizar tambem uma busca dinamica
    com um tempo para o bot 'pensar'
    */
    setTimeout(() => {
      let randomHit = Math.floor(Math.random() * width * width);
      const allBlocksPlayer = document.querySelectorAll('#player div');
      if(allBlocksPlayer[randomHit].classList.contains('taken') && allBlocksPlayer[randomHit].classList.contains('hit')){
       botGo();
       return
     } else if(allBlocksPlayer[randomHit].classList.contains('taken') && !allBlocksPlayer[randomHit].classList.contains('hit')) {
        allBlocksPlayer[randomHit].classList.add('hit');
        infoDisplay.textContent = 'The bot hit you ship! Oh No...'
        let classes = Array.from(allBlocksPlayer[randomHit].classList);
        classes = classes.filter(className => className !== 'block')
        classes = classes.filter(className => className !== 'hit')
        classes = classes.filter(className => className !== 'taken')
        botHits.push(...classes)
        checkScore('bot', botHits, botSunkShips);  
    }else {
      infoDisplay.textContent = 'Bot hit anything this time'
      allBlocksPlayer[randomHit].classList.add('fail-try')
    }

  }, 2000)

    setTimeout(() => {
      playerTurn = true;
      turnDisplay.textContent = 'Your turn to Hit!'
      infoDisplay.textContent = 'Please take your chance.'
      const allBlocksBot = document.querySelectorAll('#bot div');
      allBlocksBot.forEach(block => {
        block.addEventListener('click', playersTry)
      })
    }, 6000)
  }
}

function checkScore(user , userHits, userSunkShips) {
    function checkShip(shipName, shipLenght){
      if(
        //aqui arrShipName se refere aos conteudos que armazenamos no array de hits.
        userHits.filter(arrShipName => arrShipName  === shipName).length === shipLenght
      ){
        if(user === 'player'){
          infoDisplay.textContent = `You sunk the  bot's ${shipName}`;
          playerHits = userHits.filter(arrShipName => arrShipName !== shipName)
        }
        if(user === 'bot'){
          infoDisplay.textContent = `The bot sunk your  ${shipName}`;
          playerHits = userHits.filter(arrShipName => arrShipName !== shipName)
        }
        userSunkShips.push(shipName)
      }
    }
    checkShip('destroyer', 2);
    checkShip('submarine', 3);
    checkShip('cruiser', 3);
    checkShip('battleship', 4);
    checkShip('carrier', 5);

    if(playerSunkShips.length === 5){
      infoDisplay.textContent = "Congratulations!You have been sunk all the bot's ship";
      gameOver = true;
    }
    if(botSunkShips.length === 5){
      infoDisplay.textContent = "QuanQuanQuan YOU LOOSE!Bot sunk all your ships."
      gameOver = true;
    }

}


