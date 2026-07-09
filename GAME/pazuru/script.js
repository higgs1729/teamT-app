const board = document.getElementById("board");
const shuffleBtn = document.getElementById("shuffleBtn");
const sizeSelect = document.getElementById("sizeSelect");
const timer = document.getElementById("timer");


let size = 3;
let tiles = [];


// タイマー用
let time = 0;
let timerId = null;
//----------------------
// 盤面作成
//----------------------
function createBoard(){

    tiles = [];

    for(let i=1;i<size*size;i++){
        tiles.push(i);
    }

    tiles.push(0);

    board.style.gridTemplateColumns = `repeat(${size},80px)`;
    board.style.gridTemplateRows = `repeat(${size},80px)`;

    board.style.width = `${size*80 + (size-1)*3}px`;
    board.style.height = `${size*80 + (size-1)*3}px`;

    draw();

}

//----------------------
// 描画
//----------------------
function draw(){

    board.innerHTML="";

    tiles.forEach((num,index)=>{

        const tile=document.createElement("div");

        if(num===0){

            tile.className="tile empty";

        }else{

            tile.className="tile";
            tile.textContent=num;
            tile.onclick=()=>move(index);

        }

        board.appendChild(tile);

    });

}

//----------------------
// 移動
//----------------------
function move(index){

    const empty=tiles.indexOf(0);

    const row=Math.floor(index/size);
    const col=index%size;

    const erow=Math.floor(empty/size);
    const ecol=empty%size;

    if(Math.abs(row-erow)+Math.abs(col-ecol)===1){

        [tiles[index],tiles[empty]]=[tiles[empty],tiles[index]];

        draw();

        checkClear();

    }

}

//----------------------
// シャッフル
//----------------------
function shuffle(){

    for(let i=0;i<500;i++){

        const empty=tiles.indexOf(0);

        const row=Math.floor(empty/size);
        const col=empty%size;

        const moves=[];

        if(row>0)moves.push(empty-size);
        if(row<size-1)moves.push(empty+size);
        if(col>0)moves.push(empty-1);
        if(col<size-1)moves.push(empty+1);

        const random=moves[Math.floor(Math.random()*moves.length)];

        [tiles[empty],tiles[random]]=[tiles[random],tiles[empty]];

    }

    draw();

    resetTimer();

    startTimer();

}

//----------------------
// クリア判定
//----------------------
function checkClear(){

    for(let i=0;i<tiles.length-1;i++){

        if(tiles[i]!==i+1){

            return;

        }

    }

    stopTimer();

    alert(
    "🎉クリア！！\n\n"+
    "タイム："+time+"秒"
    );

}

//----------------------
// イベント
//----------------------

shuffleBtn.onclick=shuffle;

sizeSelect.onchange=function(){

    size=parseInt(this.value);

    resetTimer();

    createBoard();

};

//----------------------
// タイマー開始
//----------------------
function startTimer(){

    if(timerId !== null){
        return;
    }

    timerId=setInterval(()=>{

        time++;

        timer.textContent=time;

    },1000);

}


//----------------------
// タイマー停止
//----------------------
function stopTimer(){

    clearInterval(timerId);

    timerId=null;

}


//----------------------
// タイマーリセット
//----------------------
function resetTimer(){

    stopTimer();

    time=0;

    timer.textContent=0;

}