const BOARD_SIZE = 320; // размер игрового поля на экране
const CELL_SIZE = 32; // размер клетки игрового поля на экране
const COLORBG = '#4682B4';  // цвет фона ИП
const X_BOARD = 20; // координата х левого верхнего края поля
const Y_BOARD = 100; // координата у левого верхнего края поля
const STATCELL = {EMPLY: 0, MISS: 1, DECK_LIFE: 2, DECK_DEAD: 3}; // возможные состояния клетки
const FLEET = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1]; //доступные корабли для размещения
var arrLegend = ["А", "Б", "В", "Г", "Д", "Е", "Ж", "З", "И", "К"];
var mouseX = 0;
var mouseY = 0;
var mouseRow = 0;
var mouseCol = 0;
var mouseLinkStart = 0; // флаг, при наведении на ссылку старт принимает 1
var mouseLinkRnd = 0; // флаг, при наведении на ссылку "случайно" принимает 1
var readyStart = 0; // флаг, когда корабли раставлены принимает значение 1.
var mouseGameBoard = 0; // флаг, при наведении на игровое поле принимает 1
var screen; // обьект (класс Draw). Используется для отрисовки
var userBoard; // обьект (класс GameBoard). Хронит информацию о состоянии поля игрока
var compBoard;
var user; // обьект (класс Player). Хранит информацию о имени игрока и его кораблях.
var comp;
var whoseTurn; // Определяет чей сейчас ход. 0-растановка кораблей; 1,2 - ход игроков.
var oldShot = [-1,-1, 0]; // хранит координаты выстрела и его результат

while (true){
    var name = prompt('Привет! Пожалуйста представтесь.', '');
    if (name != 'null') {
        if (name!='') {
            alert('Здравствуйте  Адмирал ' + name + '!\nНастало время разместить свой флот и в бой!');
        } else {
            name = 'Барсик';
            alert('Ну хорошо, я буду звать тебя '+name+'.\nНастало время разместить свой флот и в бой!');
        }
        break;
    }
}


startGame();

// Инициализация переменных
function startGame() {
    user = new Player(name,0);
    comp = new Player('comp',0);
    userBoard = new GameBoard(user);
    compBoard = new GameBoard(comp);
    whoseTurn = 0;
    screen = new Draw();
    screen.drawBoard();
    screen.drawInfo(whoseTurn);
}

/*
* Управление игрой осуществляется путем взаимодействия с игровым полем
* Т.к. игнровое поле реализовано через canvas, то необходимо отлавливать события мыши
* setMousePosition определяет позицию мыши
* mouseClick выполняет действия при щелчке ЛКМ
* */

// setMousePosition определяет позицию мыши
function setMousePosition(e) {
    if (e.pageX || e.pageY) {
        mouseX = e.pageX;
        mouseY = e.pageY;
    }
    else {
        mouseX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        mouseY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    mouseX -= document.getElementById("battleship").offsetLeft;
    mouseY -= document.getElementById("battleship").offsetTop;
    mouseRow = Math.floor((mouseY - Y_BOARD) / CELL_SIZE);
    mouseCol = Math.floor(((mouseX - 20) / CELL_SIZE));

    // Если указатель мыши над игровым полем
    if ((mouseRow >= 0) && (mouseRow <= 9) &&
        (mouseCol >= 0) && (mouseCol <= 9) &&
        (whoseTurn == 1)) {
        mouseGameBoard = 1;
        document.getElementById("battleship").style.cursor = 'crosshair';
    } else {
        mouseGameBoard = 0;
        document.getElementById("battleship").style.cursor = 'default';
    }
    // Если указатель мыши над ссылкой случайно
    if ((mouseY >= 45) && (mouseY <= 60) &&
        (mouseX >= 80) && (mouseX <= 215) &&
        (whoseTurn == 0)) {
        mouseLinkRnd = 1;
    } else {
        mouseLinkRnd = 0;
    }

    // Если указатель мыши над ссылкой старт
    if ((mouseY >= 45) && (mouseY <= 60) &&
        (mouseX >= 240) && (mouseX <= 300) &&
        (whoseTurn == 0)) {
        mouseLinkStart = 1;
    } else {
        mouseLinkStart = 0;
    }
    if (whoseTurn == 0) {
        screen.drawLinkRand(mouseLinkRnd);
        screen.drawLinkStart(mouseLinkStart);
    }
} // end setMousePosition

// mouseClick выполняет действия при щелчке ЛКМ
function mouseClick(e) {
    if ((mouseLinkRnd) && (whoseTurn == 0)) {
        // если мы хотим нажать по ссылке случайно
        user.setRandomShips();
        userBoard.fillCells(user.ships);
        screen.drawBoard();
        screen.drawShip(user.ships,whoseTurn);
        screen.drawShotResult(userBoard,whoseTurn);
        readyStart = 1;
    }
    if ((mouseLinkStart) && (whoseTurn == 0)) {
        // если мы хотим нажать по ссылке старт
        whoseTurn = 1;
        screen.drawInfo(whoseTurn);
        comp.setRandomShips();
        compBoard.fillCells(comp.ships);
        screen.drawBoard();
        screen.drawShip(comp.ships,whoseTurn);
        screen.drawShotResult(compBoard,whoseTurn);
    }
    if ((mouseGameBoard) && (whoseTurn == 1)) {
        // если мы хотим нажать по полю противника
        var s = compBoard.shotCells(mouseRow, mouseCol); // возвращает результат стрельбы
        screen.drawInfoShot(mouseRow, mouseCol, s);
        screen.drawBoard();
        screen.drawShip(comp.ships,whoseTurn);
        screen.drawShotResult(compBoard,whoseTurn);
        if (!comp.checkLifePlayer()) {
            alert("Компьютер повержен. Ура!!!");
            whoseTurn = 0;
            mouseLinkStart = 0;
            readyStart = 0;
            user = new Player(name,0);
            comp = new Player('comp',0);
            userBoard = new GameBoard(user);
            compBoard = new GameBoard(comp);
            return true;
        }
        if (s == 0) {
            // если промах, то ход переходит другому игроку
            whoseTurn = 2;
            setTimeout(compStep, 1500);
        }
    }
} // end mouseClick

function compStep() {
    // Шак компьютера
    screen.drawInfo(whoseTurn);
    screen.drawBoard();
    screen.drawShip(user.ships,whoseTurn);
    screen.drawShotResult(userBoard,whoseTurn);
    var newShot = userBoard.getCellForShot(oldShot[2]);
    var s = userBoard.shotCells(newShot[0],newShot[1]); // возвращает результат стрельбы row , col
    screen.drawInfoShot(newShot[0],newShot[1], s);
    if ((oldShot[2] === 1) && (s === 0)) {
        oldShot = [oldShot[0],oldShot[1], oldShot[2]];
    } else
    if ((oldShot[2] === 1) && (s === 2)) {
        oldShot = [newShot[0],newShot[1], 2];
    } else
    if ((oldShot[2] === 1) && (s === 1)) {
        oldShot = [newShot[0],newShot[1], s];
    }else
    if (oldShot[2] !== 1) {
        oldShot = [newShot[0],newShot[1], s];
    }
    screen.drawBoard();
    screen.drawShip(user.ships,whoseTurn);
    screen.drawShotResult(userBoard,whoseTurn);
    if (!user.checkLifePlayer()) {
        alert("Вы проиграли. Конец!!!");
        whoseTurn = 0;
        mouseLinkStart = 0;
        readyStart = 0;
        user = new Player(name,0);
        comp = new Player('comp',0);
        userBoard = new GameBoard(user);
        compBoard = new GameBoard(comp);
        return true;
    }
    if (s != 0) {
        console.log("ПК через 1.5 сек пальнет еще раз")
        setTimeout(compStep, 1500);
    } else {
        console.log("ПК промахнулся. Ход за человеком")
        setTimeout(userStep, 1500);
    }

}
function userStep() {
    // шаг игрока
    whoseTurn = 1;
    screen.drawInfo(whoseTurn);
    screen.drawBoard();
    screen.drawShip(comp.ships,whoseTurn);
    screen.drawShotResult(compBoard,whoseTurn);
}

/* Draw отвечает за отрисовку игры
*
* drawBoard Метод рисующий ИП
* drawInfo Метод рисующий заголовок
* drawLinkRand метод создает анимацию ссылки "Случайно" при наведении
* drawInfoShot Метод рисующий информацию о текущем выстреле
* drawLinkRand метод создает анимацию ссылки "старт" при наведении
* drawShip рисует корабли на поле
* drawShotResult рисует результаты выстрелов на поле
* */
function Draw() {
    var canvas = document.getElementById("game");
    canvas.width = 360; // задаём ширину холста
    canvas.height = 640; // задаём высоту холста
    this.ctx = canvas.getContext('2d');
    canvas.addEventListener("mousemove", setMousePosition, false);
    canvas.addEventListener("click", mouseClick, false);


    this.drawBoard = function() {
        // drawBoard Метод рисующий ИП
        this.ctx.fillStyle = "#ffffff"; // цвет холста (будет влиять на цвет линий сетки)
        this.ctx.fillRect(0, Y_BOARD - 22, BOARD_SIZE + 22, BOARD_SIZE + 22); // закрашиваем холст
        this.ctx.fillStyle = COLORBG; // цвет холста (будет влиять на цвет линий сетки)
        this.ctx.fillRect(X_BOARD, Y_BOARD, BOARD_SIZE+2, BOARD_SIZE+2); // закрашиваем холст
        this.ctx.fillStyle = "#ffffff"; // цвет клеток
        // Отрисовка клеток
        for (var i = X_BOARD+2; i < BOARD_SIZE; i += (CELL_SIZE)) {
            for (var j = Y_BOARD+2; j < BOARD_SIZE + Y_BOARD; j += (CELL_SIZE)) {
                this.ctx.fillRect(i, j, CELL_SIZE-2, CELL_SIZE-2);
            } // end for j
            // отрисывываем подписи клеток
            this.ctx.strokeStyle = "#F00";
            this.ctx.font = '20px Comic Sans MS';
            this.ctx.strokeText(arrLegend[(i-22)/32], i+8, Y_BOARD - 3);
            this.ctx.strokeText((i-22)/32+1, 0, i + Y_BOARD);
        } // end for i
    }; // end DrawBoard

    this.drawInfo = function(step) {
        // drawInfo Метод рисующий заголовок
        this.ctx.fillStyle = "#FFF";
        this.ctx.fillRect(0, 0, BOARD_SIZE+100, Y_BOARD - 20); // закрашиваем холст
        if (step == 0) {
            // если мы раставляем корабли пользователя
            this.ctx.strokeStyle = "#F00";
            this.ctx.font = '20px Comic Sans MS';
            this.ctx.strokeText("Расстановка кораблей", 80, 25);
            this.ctx.strokeStyle = COLORBG;
            this.ctx.font = '20px Comic Sans MS';
            this.ctx.strokeText(">>случайно<<", 80, 60);
            if (readyStart) {
                this.ctx.strokeText(">>старт<<", 240, 60);
            }
        }
        if (step == 1) {
            // если ходит игрок
            this.ctx.strokeStyle = "#F00";
            this.ctx.font = '20px Comic Sans MS';
            this.ctx.strokeText("Ходит игрок: "+user.getName(), 80, 25);
        }
        if (step == 2) {
            // если ходит игрок
            this.ctx.strokeStyle = "#F00";
            this.ctx.font = '20px Comic Sans MS';
            this.ctx.strokeText("Ходит игрок: "+comp.getName(), 80, 25);
        }
    }; // end DrawInfo

    this.drawInfoShot = function(r,c,s) {
        // drawInfoShot Метод рисующий информацию о текущем выстреле
        this.ctx.fillStyle = "#FFF";
        this.ctx.fillRect(0, 40, BOARD_SIZE+100, 30);
            // если мы раставляем корабли пользователя
            this.ctx.strokeStyle = COLORBG;
            this.ctx.font = '20px Comic Sans MS';
            switch (s) {
                case 0:
                    this.ctx.strokeText(arrLegend[c]+(r+1)+": Мимо", 150, 60);
                    break;
                case 1:
                    this.ctx.strokeText(arrLegend[c]+(r+1)+": Ранил", 150, 60);
                    break;
                case 2:
                    this.ctx.strokeText(arrLegend[c]+(r+1)+": Убил", 150, 60);
                    break;
            }
    }; // end DrawInfoShot

    this.drawLinkRand = function (act) {
        // drawLinkRand метод создает анимацию ссылки "Случайно" при наведении
        this.ctx.fillStyle = "#FFF";
        this.ctx.fillRect(80, 40, 180, 35);
        if (whoseTurn == 0) {
            if (act == 1) {
                this.ctx.fillStyle = "#5f96b4";
                this.ctx.fillRect(80, 65, 125, 3);
                this.ctx.strokeStyle = COLORBG;
                this.ctx.font = '22px Comic Sans MS';
                this.ctx.strokeText(">>случайно<<", 80, 60);
                document.getElementById("battleship").style.cursor = 'pointer';
            } else {
                this.ctx.strokeStyle = COLORBG;
                this.ctx.font = '20px Comic Sans MS';
                this.ctx.strokeText(">>случайно<<", 80, 60);
                document.getElementById("battleship").style.cursor = 'default';
            }
        }

    };
    this.drawLinkStart = function (act) {
        // drawLinkRand метод создает анимацию ссылки "старт" при наведении
        this.ctx.fillStyle = "#FFF";
        this.ctx.fillRect(240, 40, 180, 35);
        if ((readyStart) && (whoseTurn == 0)){
            if (act == 1) {
                this.ctx.fillStyle = "#5f96b4";
                this.ctx.fillRect(240, 65, 100, 3);
                this.ctx.strokeStyle = COLORBG;
                this.ctx.font = '22px Comic Sans MS';
                this.ctx.strokeText(">>Старт<<", 240, 60);
                document.getElementById("battleship").style.cursor = 'pointer';
            } else {
                this.ctx.strokeStyle = COLORBG;
                this.ctx.font = '20px Comic Sans MS';
                this.ctx.strokeText(">>Старт<<", 240, 60);
                document.getElementById("battleship").style.cursor = 'default';
            }
        }
    };

    this.drawShip = function (ships, step) {
        // drawShip рисует корабли на поле

            for (i = 0; i < 10; i++) {
                var area = ships[i].getAreaShip();
                var col1 = area[0] * CELL_SIZE + X_BOARD;
                var row1 =  area[1] * CELL_SIZE + Y_BOARD;
                var col2 = area[2] * CELL_SIZE + X_BOARD + CELL_SIZE - col1;
                var row2 =  area[3] * CELL_SIZE + Y_BOARD + CELL_SIZE - row1;
                if (step != 1) {
                    this.ctx.fillStyle = '#4988b4';
                    this.ctx.fillRect(col1, row1, col2, row2);
                } else {
                    if (ships[i].getStatus() === 0 ) {
                        this.ctx.fillStyle = '#4988b4';
                        this.ctx.fillRect(col1, row1, col2, row2);
                    }
                }
            }

    }; // end drawShip

    this.drawShotResult = function (board, step) {
        // drawShotResult рисует результаты выстрелов на поле
        var shiftCol, shiftRow;
        if (true) {
            for (row = 0; row < 10; row++) {
                for (col = 0; col < 10; col++) {
                    if (board.cells.cell[col][row] == STATCELL.DECK_DEAD) {
                        //  если палуба повреждена
                        shiftCol = col * CELL_SIZE + X_BOARD + CELL_SIZE / 2 - 7;
                        shiftRow =  row * CELL_SIZE + Y_BOARD + CELL_SIZE - 7;
                        this.ctx.strokeStyle = "#F00";
                        this.ctx.strokeText("X", shiftCol, shiftRow);
                    }
                    if (board.cells.cell[col][row] == STATCELL.MISS) {
                        //  если промах
                        shiftCol = col * CELL_SIZE + X_BOARD + CELL_SIZE / 2 - 1;
                        shiftRow =  row * CELL_SIZE + Y_BOARD + CELL_SIZE - 15;
                        this.ctx.strokeStyle = "#767878";
                        this.ctx.strokeText(".", shiftCol, shiftRow);
                    }
                } // end for col
            } // end for row
        }
    }; // end drawShotResult
} // end Draw

// Cells описывает состояние клеток для игрового поля
function Cells(N,v) {
    this.cell = [N];
    for (row = 0; row < N; row++) {
        this.cell[row] = [N];
        for (col = 0; col < N; col++) {
            this.cell[row][col] = v;
        }
    }
} // end Cells

/*  GameBoard описывает игровое поле (ИП)
*
* shotCells делает выстрел в поле и возвращает 0-мимо, 1-ранил, 2-убил, (-1)-попал в уже подбитую клетку
* getCellForShot возвращает координаты выстрела для ПК
* */
function GameBoard(player) {
    this.cells = new Cells(10, STATCELL.EMPLY);
    this.player = player;
    this.fillCells = function (ships) {
        // Заполняем доску в соответствии с кораблями игрока
        this.cells = new Cells(10, STATCELL.EMPLY);
        for (i = 0; i < 10; i++) {
            var area = ships[i].getAreaShip();
            for (y = area[0]; y <= area[2]; y++) {
                // отмечаем 1 клетки в которые ставить корабли в будущем уже нельзя
                for (x = area[1]; x <= area[3]; x++) {
                    this.cells.cell[y][x] = STATCELL.DECK_LIFE;
                } // end for x
            } // end for y
        } // end for i
    }; // end fillCells

    this.shotCells = function (row,col) {
        // shotCells возвращает 0-мимо, 1-ранил, 2-убил, (-1)-попал в уже подбитую клетку
        var statShip, area, y, x;
        // 0-мимо, 1-ранил, 2-убил
        if (this.cells.cell[col][row] === STATCELL.EMPLY){
            this.cells.cell[col][row] = STATCELL.MISS;
            return 0;
        }
        if (this.cells.cell[col][row] == STATCELL.DECK_LIFE){
            statShip = this.player.getStatusShip(col, row);
            if ((statShip[1] != -1) && (statShip[1] != 0)) {
                // если корабль по аданным координатам найден и он цел, то
                this.cells.cell[col][row] = STATCELL.DECK_DEAD; // делаем отметку на поле
                this.player.incSumIntact(); //+1 поврежденная палуба у игрока
                if (this.player.ships[statShip[0]].incSumShot()) {
                    // корабль был подбит
                    var p = [[col+1,row+1],[col-1,row+1],[col+1,row-1],[col-1,row-1]];
                    for (var j=0; j < 4; j++) {
                        var arr = p[j];
                        if ((arr[0] >= 0) && (arr[0] <= 9) && (arr[1] >= 0) && (arr[1] <= 9)) {
                            this.cells.cell[arr[0]][arr[1]] = STATCELL.MISS;
                        }
                    }
                    return 1;
                } else {
                    // корабль был убит
                    area = this.player.ships[statShip[0]].getAreaNearShip();
                    // т.к. корабль убит, возле него можно указать промохи
                    for (y = area[0]; y <= area[2]; y++) {
                        for (x = area[1]; x <= area[3]; x++) {
                            if (this.cells.cell[y][x] == STATCELL.EMPLY) {
                                this.cells.cell[y][x] = STATCELL.MISS;
                            }
                        } // end for x
                    } // end for y
                    return 2;
                }
            }
        }
        return -1;
    }; //end shotCells

    this.getCellForShot = function (s) {
        // костыль Нужно переделать. возвращает координаты выстрела для ПК
        var s = s;
        if (this.player.getFireDeck() !== -1) {
            // Если был подбит корабль, но после был промах, мы задаем статус в 1
            s = 1;
        }
        var arr;
        if (s !== 1) {
            // если подбитых кораблй нет
            do {
                arr = [rand(9),rand(9)];
                if ((this.cells.cell[arr[0]][arr[1]] !== STATCELL.MISS) &&
                    (this.cells.cell[arr[0]][arr[1]] !== STATCELL.DECK_DEAD)){
                    break;
                }
            } while (true);
            return [arr[1],arr[0]];
        } else if(s === 1) {
            // если есть подбитый корабль
            var i = this.player.getFireDeck();
            if (i !== -1) {
                var row = oldShot[0];
                var col = oldShot[1];
                var p = [[col+1,row],[col-1,row],[col,row-1],[col,row+1]];
                if (this.player.ships[i].getSumShot() === 1) {
                    // если подбита одна палуба
                     do {
                        arr = p[rand(3)];
                        if ((arr[0] >= 0) && (arr[0] <= 9) && (arr[1] >= 0) && (arr[1] <= 9)) {
                            if ((this.cells.cell[arr[0]][arr[1]] === STATCELL.EMPLY) ||
                                (this.cells.cell[arr[0]][arr[1]] === STATCELL.DECK_LIFE)) {
                                break;
                            }
                        }
                    } while (true);
                    return [arr[1],arr[0]];
                } else {
                    // Если подбыто несколько палуб
                    for (var j = 0; j < 4; j++) {
                        arr = p[j];
                        if ((arr[0] >= 0) && (arr[0] <= 9) && (arr[1] >= 0) && (arr[1] <= 9)) {
                            if (this.cells.cell[arr[0]][arr[1]] === STATCELL.DECK_DEAD) {
                                break;
                            }
                        }
                    } // enr for j
                    if (row != arr[1]) {
                        // проверяем по колонке
                        var shift = 0;
                        do {
                            shift++;
                            if ((arr[0] >= 0) && (arr[0] <= 9) &&
                                (arr[1] + shift >= 0) && (arr[1] + shift <= 9)) {
                                if ((this.cells.cell[arr[0]][arr[1] + shift] === STATCELL.EMPLY) ||
                                    (this.cells.cell[arr[0]][arr[1] + shift] === STATCELL.DECK_LIFE)) {
                                    arr[1] += shift;
                                    break;
                                }
                            }
                            if ((arr[0] >= 0) && (arr[0] <= 9) &&
                                (arr[1] - shift >= 0) && (arr[1] - shift <= 9)) {
                                if ((this.cells.cell[arr[0]][arr[1] - shift] === STATCELL.EMPLY) ||
                                    (this.cells.cell[arr[0]][arr[1] - shift] === STATCELL.DECK_LIFE)) {
                                    arr[1] -= shift;
                                    break;
                                }
                            }
                            if (shift > 10) { break; }
                        }while (true);
                        return [arr[1],arr[0]];
                    } else {
                        // проверяем по строке
                        var shift = 0;
                        do {
                            shift++;
                            if ((arr[1] >= 0) && (arr[1] <= 9) &&
                                (arr[0] + shift >= 0) && (arr[0] + shift <= 9)) {
                                if ((this.cells.cell[arr[0]+ shift][arr[1]] === STATCELL.EMPLY) ||
                                    (this.cells.cell[arr[0]+ shift][arr[1]] === STATCELL.DECK_LIFE)) {
                                    arr[0] += shift;
                                    break;
                                }
                            }
                            if ((arr[1] >= 0) && (arr[1] <= 9) &&
                                (arr[0] - shift >= 0) && (arr[0] - shift <= 9)) {
                                if ((this.cells.cell[arr[0]- shift][arr[1]] === STATCELL.EMPLY) ||
                                    (this.cells.cell[arr[0]- shift][arr[1]] === STATCELL.DECK_LIFE)) {
                                    arr[0] -= shift;
                                    break;
                                }
                            }
                            if (shift > 10) { break; }
                        }while (true);
                        return [arr[1],arr[0]];
                    }
                } // конец ветки с несколькими подбитыми палубами
            } // end if !== -1
        }
        do {
            arr = [rand(9),rand(9)];
            if ((this.cells.cell[arr[0]][arr[1]] !== STATCELL.MISS) &&
                (this.cells.cell[arr[0]][arr[1]] !== STATCELL.DECK_DEAD)){
                break;
            }
        } while (true);
        return [arr[1],arr[0]];
    }; // end getCellForShot

} // end GameBoard

/* класс Player описывает игрока
*
* getName возвращает имя
* incSumIntact уменьшаем количество целых палуб
* checkLifePlayer проверяет жив ли еще игрок
* getStatusShip отвечаем жив ли корабль по заданным координатам палубы
* setRandomShips раставить корабли случайным образом.
* getFireDeck возвращает номер подбитого корабл
* */
function Player(n,s) {
    var name = n; // Имя игрока
    var sumIntact = s; // количество поврежденных палуб
    this.ships = [10]; // массив с кораблями игрока
    for (i = 0; i < 10; i++) {
        this.ships[i] = new Ship(FLEET[i]);
    }
    this.getName = function () {
        // getName возвращает имя
        return name;
    };
    this.incSumIntact = function () {
        // incSumIntact уменьшаем количество целых палуб
        sumIntact++;
    };

    this.checkLifePlayer = function () {
        // checkLifePlayer проверяет жив ли еще игрок
        if (sumIntact >= 20) {
            return false;
        }
        return true;
    };

    this.getStatusShip = function (col, row) {
        // getStatusShip отвечаем жив ли корабль по заданным координатам палубы
        for (i = 0; i < 10; i++) {
            var area = this.ships[i].getAreaShip();
            if ((col >= area[0]) && (col <= area[2]) &&
                (row >= area[1]) && (row <= area[3])) {
                return [i,this.ships[i].getStatus()];
            }
        } //end for i
        return [-1,-1]
    };

    this.setRandomShips = function () {
        // setRandomShips раставить корабли случайным образом.
        var arrCell = new2Arr(10);
        var row, col, rowEnd, colEnd, chk;
        for (var i = 0; i < 10; i++) {
            do {
                chk = true;
                var pos = rand(1);
                if (pos == 1) {
                    // Если корабль расположен вертикально
                    row = rand(10-FLEET[i]);
                    col = rand(9);
                    rowEnd = row + FLEET[i] - 1;
                    colEnd = col;
                } else {
                    col = rand(10-FLEET[i]);
                    row = rand(9);
                    rowEnd = row;
                    colEnd = col + FLEET[i] - 1;
                }
                if ((arrCell[row][col] != 1) && (arrCell[rowEnd][colEnd] != 1)) {
                    chk = false;
                }
            } while (chk);
            this.ships[i].setLocation(row, col, pos);
            this.ships[i].setStatus(1);
            this.ships[i].setSize(FLEET[i]);
            var area = this.ships[i].getAreaNearShip(); // получаем координаты прямоугольной области вокруг  корабля
            for (y = area[0]; y <= area[2]; y++) {
                // отмечаем 1 клетки в которые ставить корабли в будущем уже нельзя
                for (x = area[1]; x <= area[3]; x++) {
                    arrCell[y][x] = 1;
                } // end for x
            } // end for y
        } // end for i
    }; // end setRandomShips

    this.getFireDeck = function () {
        // getFireDeck возвращает номер подбитого корабля
        for (var i = 0; i < 10; i++) {
            if ((this.ships[i].getSumShot() < this.ships[i].getSize()) &&
                ((this.ships[i].getSumShot() > 0))) {
                return i;
            }
        }
        return -1;
    }; // end getFireDeck

} // end Player

/* класс Ship */
function Ship(s) {
    var row = 0; // строчка первой палубы корабля
    var col = 0; // колонка первой палубы корабля
    var pos = 0; // положение корабля (0-горизонтальное, 1-вертикальное)
    var status = -1; // Статус корабля -1- не выставлен; 0-сломан; 1-целый.
    var size = s; // Размер корабля
    var sumShot = 0; // количество подбитых палуб

    this.getSumShot = function () {
        return sumShot;
    };
    this.incSumShot = function () {
        // увеличиваем повреждение корабля. если корабль убит, то возвращаем false
        sumShot++;
        if (sumShot == size) {
            status = 0;
            return false;
        }
        return true;
    };
    this.setLocation = function (r, c, p) {
        // Задаем кораблю новое положение
        row = r;
        col = c;
        pos = p;
        status = 1;
    };
    this.setStatus = function (s) {
        // Задаем кораблю новый статус
        status = s;
    };
    this.setSize = function (s) {
        size = s;
    };
    this.getStatus = function () {
        return status;
    };
    this.getLocation = function () {
        return [row, col, pos];
    };
    this.getSize = function () {
        return size;
    };
    this.getAreaNearShip = function () {
        // getAreaNearShip возвращает область возле корабля
        var yStart, yEnd, xStart, xEnd;
        yStart = (row == 0) ? row : row - 1;
        xStart = (col == 0) ? col : col - 1;
        if (pos == 0) {
            // если планируется разместить по горизонтали
            xEnd = (col + size <= 9) ? col + size : 9;
            yEnd = (row + 1 <= 9) ? row + 1 : 9;
        } else {
            yEnd = (row + size <= 9) ? row + size : 9;
            xEnd = (col + 1 <= 9) ? col + 1 : 9;
        }
        return [yStart, xStart, yEnd, xEnd];
    };
    this.getAreaShip = function () {
        // getAreaNearShip возвращает область которую занимет корабль
        var yStart, yEnd, xStart, xEnd;
        yStart = row;
        xStart = col;
        if (pos == 0) {
            // если планируется разместить по горизонтали
            xEnd = col + size - 1;
            yEnd = row;
        } else {
            yEnd = row + size - 1;
            xEnd = col;
        }
        return [yStart, xStart, yEnd, xEnd];
    };

}

function new2Arr(n) {
    // возвращает 2мерный массив заданной длины
    var arr = [n];
    for (i = 0; i < n; i++) {
        arr[i] = [n];
        for (j = 0; j < n; j++) {
            arr[i][j] = 0;
        }
    }
    return arr;
}

function rand(n) {
    // n - максимальное значение, которое хотим получить
    return Math.floor(Math.random() * (n + 1));
}

