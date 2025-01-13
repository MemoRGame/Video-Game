const ws = new WebSocket("wss://cloud.achex.ca/onlinevideogame");

//移動管理の変数を宣言
let up = false, down = false, left = false, right = false;
let ID;

//画像を操作するための変数(初期値)
let posX = 0;  //初期X座標
let posY = 0;  //初期Y座標
// 画像の大きさ
const imageWidth = 32;
const imageHeight = 32;
//ステージの大きさ
const container = document.getElementById('imageContainer');
const containerWidth = container.offsetWidth;
const containerHeight = container.offsetHeight;

//ログイン時
ws.onopen = e => {
    ID = Math.random().toString(32).substring(2); //IDを生成
    Name = []; //プレイヤーのIDを格納する配列
    ws.send(JSON.stringify({"auth": "onlinevideogame", "password": "1111"}));
    ws.send(JSON.stringify({"to": "onlinevideogame", "msg": "Login", "ID": ID}));
    }

//ログアウト
window.addEventListener('pagehide', function (event) {
    ws.send(JSON.stringify({"to": "onlinevideogame", "msg": "Logout", "ID": ID}));
  });

// キーが押されたとき
document.addEventListener('keydown', function(event) {
    switch (event.key) {
        case 'w':  // Wキー (上)
            up = true;
            break;
        case 's':  // Sキー (下)
            down = true;
            break;
        case 'a':  // Aキー (左)
            left = true;
            break;
        case 'd':  // Dキー (右)
            right = true;
            break;
    }
});

// キーが離されたとき
document.addEventListener('keyup', function(event) {
    switch (event.key) {
        case 'w':  // Wキー (上)
            up = false;
            break;
        case 's':  // Sキー (下)
            down = false;
            break;
        case 'a':  // Aキー (左)
            left = false;
            break;
        case 'd':  // Dキー (右)
            right = false;
            break;
    }
});

//posX,posYを更新 & 送信
setInterval(function() {
if (up == true) {
    posY = Math.max(0, posY - 10);  // 上に移動
}
if (down) {
    posY = Math.min(containerHeight - imageHeight, posY + 10);  // 下に移動
}
if (left) {
    posX = Math.max(0, posX - 10);  // 左に移動
}
if (right) {
    posX = Math.min(containerWidth - imageWidth, posX + 10);  // 右に移動
}
if (ID){
ws.send(JSON.stringify({"to": "onlinevideogame", "msg": "move", "ID": ID, "x": posX, "y": posY}));
}
}, 10);

//位置を更新(自分の画像)
setInterval(function() {
    Allarc = document.querySelectorAll('arc');
    Allarc.forEach(arcElement => {
    let arcText = arcElement.textContent;  // arcタグのテキスト（例: "ID:image1"）を取得
    
    // テキスト内容が指定したIDと一致する場合
    if (arcText === `ID:${ID}`) {
        const target = arcElement.parentNode;  // arcの親要素（div）を取得
        const MovabeleImage = target.querySelector('img');  // そのdiv内のimgタグを取得
    
        MovabeleImage.style.left = `${posX}px`;
        MovabeleImage.style.top = `${posY}px`;
    }
    });
}, 10);

//未追加のIDを返す関数
function SendID() {
    setTimeout(() => {
    image();
    AddImage = Name.filter(item => !arcContents.includes(item));
    if (AddImage.length != 0) addImage();
    }, 100); 
}

//画像を生成する関数
function addImage() {
    // 画像を作成
    const newImage = document.createElement('img');
    newImage.src = 'image.png';  // 同じディレクトリにある画像

    // 画像にランダムIDを設定
    newImage.id = AddImage[0];

    // 画像とIDのテキストを一緒にコンテナに追加
    const imageWrapper = document.createElement('div');
    
    // 画像を追加
    imageWrapper.appendChild(newImage);
    
    // 改行を作成
    const lineBreak = document.createElement('br');
    imageWrapper.appendChild(lineBreak);  // 画像とIDの間に改行を追加
    
    // IDのテキストを作成
    const idText = document.createElement('arc');
    idText.textContent = "ID:" + AddImage[0];  // ランダムIDを表示

    imageWrapper.appendChild(idText);  // IDを追加

    // コンテナに新しい画像とIDを追加
    const imageContainer = document.getElementById('imageContainer');
    imageContainer.appendChild(imageWrapper);

    // 次のIDを取得
    AddImage = Name.filter(item => !arcContents.includes(item));
    
    // 次の画像追加処理など
    image();
    SendID();
}

//表示されている画像IDを呼び出す関数
function image(){
    arcs = document.querySelectorAll('arc');
    arcContents = Array.from(arcs, arc => arc.textContent);
    arcContents = arcContents.map(item => item.replace('ID:', ''));
}

//メッセージ受信
ws.onmessage = e => {
    var obj = JSON.parse(e.data);
    if (obj.msg == "Login") {
    ws.send(JSON.stringify({"to": "onlinevideogame", "msg": "SendID", "ID": ID}));
    console.log(obj.ID + ":が参加")
    }
    else if (obj.msg == "Logout"){
    console.log(obj.ID + "がログアウトしました");
    let removeID = obj.ID;
    Allarc = document.querySelectorAll('arc');
    Allarc.forEach(arcElement => {
    let arcText = arcElement.textContent;  // arcタグのテキスト（例: "ID:image1"）を取得
    
    // テキスト内容が指定したIDと一致する場合
    if (arcText === `ID:${removeID}`) {
        const remove = arcElement.parentNode;  // arcの親要素（div）を取得
        const removeImage = remove.querySelector('img');  // そのdiv内のimgタグを取得
        
        removeImage.remove();
    }
    });
    }
    else if (obj.msg == "SendID"){
    Name.push(obj.ID)
    Name = [...new Set(Name)];
    SendID();
    }
    else if (obj.msg == "move" && obj.ID !== ID){
    let TargetID = obj.ID;
    Allarc = document.querySelectorAll('arc');
    Allarc.forEach(arcElement => {
    let arcText = arcElement.textContent;  // arcタグのテキスト（例: "ID:image1"）を取得
    
    // テキスト内容が指定したIDと一致する場合
    if (arcText === `ID:${TargetID}`) {
        const target = arcElement.parentNode;  // arcの親要素（div）を取得
        const TargetImage = target.querySelector('img');  // そのdiv内のimgタグを取得
        
        if (TargetImage){
        TargetImage.style.left = `${obj.x}px`;
        TargetImage.style.top = `${obj.y}px`;
        }
    }
    });
    }
}