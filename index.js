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
- ships -> dentro da variavel ships , estou recebendo todas as divs como um array array , para podermos
iterar pelo nosso forEach.
*/
let angle = 0;
function turnShip(){
  //utilizei Array.from para colocar todos os filhos da div OptionContainer em um array
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
  
//Criando nossas grids, usando a logica de criar divs  de blocks separadamente 
/*De largura 10x10, criei uma variavel global width pois irei utilizar ela diversas vezes para calculos , além de deixar o codigo mais 
legivel

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


//Criação de um um objeto com as informações de nossos barcos -> (name, lenght)
function Ship(name, length){
  this.name = name;
  this.length = length;
}
const destroyer =  new Ship('destroyer', 2);
const submarine =  new Ship('submarine', 3);
const cruiser =  new Ship('cruiser', 3);
const battleShip =  new Ship('battleship', 4);
const carrier =  new Ship('carrier', 5);
//Array com nossos barcos
const ships = [destroyer, submarine, cruiser, battleShip, carrier];
console.log(ships)
//Variavel notDrop utilizado na nossa function dragble
let notDrop;

/*Handle de validação que lida se o campo já está preenchido(class->taken) e retorna os indices a onde estão sendo inserido os barcos 
Params -> BoardBlcoks -> blocos do usuario ou bot, 
isHorizontal -> Boolean return, 
|BlockIndex -> index aleatorio obtido pelo Math.random
Ship -> o barco escolhido
*/

function isValid(boardBlocks, isHorizontal, blockIndex, ship){
  /*verificamos se o blockIndex que foi informado é valido para ser preenchido por um barco ,se ele for atribuimos esse valor ao validStartIndex
  caso nao seja reposicionamos ele subtraindo o valor total das divs pelo lenght do barco escolhido 
  a um handle que segue a mesma logica porém é realizado a mutiplicação para pegarmos o elemento na vertical caso isHorizontal retorne false
  */ 
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
      console.log(validStartIndex)
    }else{
      validStartIndex = blockIndex - ship.length * width + width;
      console.log(validStartIndex)
    }
  }
  //Array responsavel por armazenar todos os espaços ocupados pelo nosso barco
  let shipBlocks = [];
  //loop para inserir os barcos na nossa board
  for(let i = 0; i < ship.length; i++){
    if(isHorizontal){
      shipBlocks.push(boardBlocks[Number(validStartIndex) + i])
    } else{
      shipBlocks.push(boardBlocks[Number(validStartIndex) + i * width])
    }
  } 
  //condição para que um barco não ocupe o espaço do outro caso o bloco tenha a class Taken adicionada pelo nosso looping
  const notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken'))

  return { shipBlocks, notTaken}
}

//Função usada para adicionar os barcos na table do bot de forma aléatoria na vertical e horizontal 
function addShipPiece(user, ship, blockId){
  const boardBlocks = document.querySelectorAll(`#${user} div`);
  let randomBoolean = Math.random() < 0.5; //me retorna um true or false aleatoriamente
  let isHorizontal = user === 'player' ? angle === 0 : randomBoolean;
  let randomIndexBot = Math.floor(Math.random() * width * width);
 
  //teste aplicado para o player , para não utilizarmos o index aleatorio do bot
  //BlockIndex -> div sorteada caso bot ,ou caso seja um player o blockId vai ter um valor passado no parametro da função, se não ele retorna o valaor aleatorio se estiver vazio o parametro
  let blockIndex = blockId ? blockId : randomIndexBot;

//Faço uma desestruturação para utilizar as variaveis retornadas pela função de validação
 const {shipBlocks, notTaken} = isValid(boardBlocks, isHorizontal, blockIndex, ship)

  console.log(blockIndex);

  if(notTaken){
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

  ships.forEach(ship => addShipPiece('bot',ship));


  //Posicionando nossos barcos na table
  /* Adicionamos um um evento para cada div nossa \
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
  /*pegamos o id do bloco que iremos ocupar e depois pegamos o id do nosso barco*/
  const blockId = event.target.id;
  const ship = ships[getShip.id]
  console.log(blockId)
  addShipPiece('player', ship, blockId)
  if(!notDrop){
    getShip.remove();
  }
}

//Add hover

function hoverArea(blockIndex, ship) {
  const allPlayerBlocks = document.querySelectorAll('#player div');
  let isHorizontal = angle === 0;

  const {shipBlocks, notTaken} = isValid(allPlayerBlocks,isHorizontal, blockIndex, ship );
  if(notTaken){
    shipBlocks.forEach(shipBlock => {
      shipBlock.classList.add('hover')
      setTimeout(() => shipBlock.classList.remove('hover'), 100)
    })
  }
}

let gameOver = false; 
let playerTurn;

//Start Game 
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
      turnDisplay.textContent = 'Your turn to Hit!';
      infoDisplay.textContent = 'The game has been started!'
    }
  }
}

let playerHits  = [];
let botHits  = [];
const playerSunkShips = [];
const botSunkShips = []; 

function playersTry(event){
  if(!gameOver){
    if(event.target.classList.contains('taken')){
      event.target.classList.add('hit');
      infoDisplay.textContent = 'You have been hit ship!';
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
    classes taken mas não contenham a classe hit 
    */
    setTimeout(() => {
      let randomGo = Math.floor(Math.random() * width * width);
      const allBlocksPlayer = document.querySelectorAll('#player div');
      if(allBlocksPlayer[randomGo].classList.contains('taken') && allBlocksPlayer[randomGo].classList.contains('hit')){
       botGo();
       return
     } else if(allBlocksPlayer[randomGo].classList.contains('taken') && !allBlocksPlayer[randomGo].classList.contains('hit')) {
        allBlocksPlayer[randomGo].classList.add('hit');
        infoDisplay.textContent = 'The bot hit you ship! Oh No...'
        let classes = Array.from(allBlocksPlayer[randomGo].classList);
        classes = classes.filter(className => className !== 'block')
        classes = classes.filter(className => className !== 'hit')
        classes = classes.filter(className => className !== 'taken')
        botHits.push(...classes)
        checkScore('bot', botHits, botSunkShips);  
    }else {
      infoDisplay.textContent = 'Bot hit anything this time'
      allBlocksPlayer[randomGo].classList.add('fail-try')
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
        userHits.filter(storedShipName => storedShipName  === shipName).length === shipLenght
      ){
        if(user === 'player'){
          infoDisplay.textContent = `You sunk the  bot's ${shipName}`;
          playerHits = userHits.filter(storedShipName => storedShipName !== shipName)
        }
        if(user === 'bot'){
          infoDisplay.textContent = `The bot sunk your  ${shipName}`;
          playerHits = userHits.filter(storedShipName => storedShipName !== shipName)
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


