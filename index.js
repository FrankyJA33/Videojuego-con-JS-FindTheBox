const canvas = document.getElementById('game');
const game = canvas.getContext('2d');
const btnUp = document.getElementById('up');
const btnDown = document.getElementById('down');
const btnLeft = document.getElementById('left');
const btnRight = document.getElementById('right');
const spanLives = document.getElementById('lives');
const spanTime = document.getElementById('time');
const spanScore = document.getElementById('score');
const spanResult = document.getElementById('result');
const btnRestart = document.getElementById('restart');

let canvasSize;
let elementsSize;
let level = 0;
let lives = 3;

let timeStart;
let timePlayer;
let timeInterval;

const playerPosition = {
  x: undefined,
  y: undefined,
};
const giftPosition = {
  x: undefined,
  y: undefined,
};
let enemyPositions = [];

window.addEventListener('load', setCanvasSize); // Al cargar
window.addEventListener('resize', setCanvasSize); // Al actualizar el tamaño de la ventana html

//* Tratamiento del canvas (Area de juego)
function setCanvasSize() {
  //gameContext.fillRect(0,0,100,100); //Define el lugar de inicio y fin del trazo en coordenadas (x,y)
  //gameContext.clearRect(0,0,50,50); //Borra desde la coordenada de inicio (x,y) hasta la coordenada final (x,y)
  //gameContext.fillText('hola',100,100) // Inserta ese texto en la posicion (x,y)
  //gameContext.font = '25px Verdana' // Cambia el tamaño de letra y tipo del texto
  //gameContext.fillStyle = 'orange' //Cambia el color del texto
  //gameContext.textAlign = 'left' // Posiciona un texto

  if (window.innerHeight > window.innerWidth) {
    canvasSize = window.innerWidth * 0.7;
  } else {
    canvasSize = window.innerHeight * 0.7;
  }
  
  canvas.setAttribute('width', canvasSize);
  canvas.setAttribute('height', canvasSize);
  
  elementsSize = Math.floor(canvasSize / 10);

  //* Cada que se hace un reSize, la posicion del jugador vuelve al inicio, ya que si se quita esto, cuando se hace un reSize la posicion del jugador se pierde en el mapa
  playerPosition.x = 0;
  playerPosition.y = 0;
  startGame();
}

function startGame() {
  game.font = `${elementsSize}px Verdana`;
  game.textAlign = 'end';

  const map = maps[level];

  //* Fin del juego
  if(!map) {
    gameWin();
    return;
  }
  //* Fin del juego

  //* Tiempo del juego
  if(!timeStart){
    timeStart = Date.now(); //Muestrta el tiempo en ms que han transcurrido desde 01/01/1970 
    timeInterval = setInterval(showTime,100); //Llaremos a la funcion showTime cada 100 ms
  }
  //* Tiempo del juego
  
  const mapRow = map.trim().split('\n'); // trim(): quita los espacios sobrados de un arreglo. split(): secciona un array cada que se encuentra con el caracter especificado (Esto solamente funcion en strings)
  const mapCleanSplit = mapRow.map(row => row.trim().split('')); // Como ahora ya tenemos un array, aplicamos el metodo .map() para que el tratamiento que hagamos, se aplique para todos los elementos de ese arraglo y nos devuelva otro arreglo ya como nosotros queremos. Dentro de la funcion ahora con "row" ya nos estamos refiriendo a cada elemento de ese arreglo que ahora si es un string, por lo tanto, podemos aplicar el metodo .trim() para quitarle los espacios y despues el metodo .split('') para que nos seccione ese string por cada elemento. De esta forma tenemos una matriz de 10x10.
  
  enemyPositions = [];
  game.clearRect(0,0,canvasSize, canvasSize); //Renderiza el mapa para que podamos eliminar los movimientos pasados del jugador

  for(let i=0; i<10; i++){
    for(let j=0; j<10; j++){
      //*Posicion inicial del jugador
      if(mapCleanSplit[i][j] == 'O' && !playerPosition.x && !playerPosition.y){
        playerPosition.x = elementsSize*(j+1);
        playerPosition.y = elementsSize*(i+1);
      } else if(mapCleanSplit[i][j] == 'I'){
        giftPosition.x = elementsSize*(j+1);
        giftPosition.y = elementsSize*(i+1);
      } else if (mapCleanSplit[i][j] == 'X'){
        enemyPositions.push({
          x: elementsSize*(j+1),
          y: elementsSize*(i+1)
        });
    }
      game.fillText(emojis[mapCleanSplit[i][j]], elementsSize*(j+1), elementsSize*(i+1));
    }
  }
  spanScore.innerHTML = localStorage.getItem('record_Time') + ' seg.';
  showLives();
  movePlayer();
}

function movePlayer() {
  const giftCollisionX = playerPosition.x == giftPosition.x;
  const giftCollisionY = playerPosition.y == giftPosition.y;
  const giftCollision = giftCollisionX && giftCollisionY;
  
  if (giftCollision) {
    levelWin();
  }

  const enemyCollision = enemyPositions.find(enemy => {
    const enemyCollisionX = enemy.x == playerPosition.x;
    const enemyCollisionY = enemy.y == playerPosition.y;
    return enemyCollisionX && enemyCollisionY;
  });
  
  if (enemyCollision) {
    levelFail();
  }

  game.fillText(emojis['PLAYER'], playerPosition.x, playerPosition.y);
}

function levelWin() {
  level++;
  startGame();
}

function showLives(){
  spanLives.innerHTML = emojis["LIVES"].repeat(lives); // .repeat(): repite las veces que le indiquemos como paramtro, el string (es una propiedad de los strings)
}

function levelFail() {
  lives--;
  showLives()
  
  if (lives == 0) {
    level = 0;
    lives = 3;
    timeStart = false;
  }

  playerPosition.x = undefined;
  playerPosition.y = undefined;
  startGame();
}

function showTime(){
  spanTime.innerHTML = ((Date.now() - timeStart)/1000).toFixed(1); //.toFixed(1): Unicamente tomara el primer decimal del numero que tengamos
}

function gameWin() {
  clearInterval(timeInterval); //Detenemos el tiempo de juego
  const recordTime = localStorage.getItem('record_Time'); //localStorage() nos permite guardar de forma permanente una variable en nuestro navegador. getItem(): nos dice cuales son las variables que tenemos en nuestro localStorage. setItem(): le damos otra variable u otro valor a algo en nuestro localStorage.
  
  //* Tiempo record
  const playerTimeNow = ((Date.now() - timeStart)/1000).toFixed(1);
  if(recordTime){
    if(recordTime >= playerTimeNow){
      localStorage.setItem('record_Time', playerTimeNow);
      spanScore.innerHTML = localStorage.getItem('record_Time');
      spanResult.innerHTML = '📈 Has superado el record, FELICIDADES 🥇';
    } else {
      spanScore.innerHTML = localStorage.getItem('record_Time');
      spanResult.innerHTML = 'Estuviste cerca de superar el record, sigue intentando 🏋️';
    }
  } else {
    clearInterval(timeInterval);
    localStorage.setItem('record_Time', playerTimeNow);
    spanScore.innerHTML = localStorage.getItem('record_Time');
    spanResult.innerHTML = '📈 Has superado el record, FELICIDADES 🥇';
  }
}

//* Movimientos (botones teclado, botones en la pagina)
btnUp.addEventListener('click', Up);
btnLeft.addEventListener('click', Left);
btnRight.addEventListener('click', Right);
btnDown.addEventListener('click', Down);
btnRestart.addEventListener('click', () => location.reload());

function Up() {
  if (playerPosition.y > elementsSize) {
    playerPosition.y -= elementsSize;
    startGame();
  }
}
function Left() {
  if (playerPosition.x > elementsSize) {
    playerPosition.x -= elementsSize;
    startGame();
  }
}
function Right() {
  if (playerPosition.x < elementsSize*10) {
    playerPosition.x += elementsSize;
    startGame();
  }
}
function Down() {
  if (playerPosition.y < elementsSize*10) {
    playerPosition.y += elementsSize;
    startGame();
  }
}

window.addEventListener('keydown', (event) => {
  //console.log(event.code);
  switch(event.code){
    case 'ArrowUp': Up();
      break
    case 'ArrowDown': Down();
      break
    case 'ArrowLeft': Left();
      break
    case 'ArrowRight': Right();
      break
    case 'KeyR': location.reload();
      break
  }
});

// location.reload();