# server
簡單的開房間server，還沒與主遊戲結合。

安裝方法：

1 安裝nodejs (自動包含 npm): https://docs.npmjs.com/getting-started/installing-node

2 git clone git@github.com:web-tower-defense/server.git

3 cd server/

4 npm install

5 gulp

6 打開瀏覽器，網址輸入localhost:3000就可連上。可同時開多個tab測試。

ToDo:

0 在views/layout.jade中，增加 script src = 'path to our game.js and others...'，並把檔案放進去。 

1 在 server/server/server.js 中的joinRoomEvent後， emit 一個gameStartEvent。

2 在 public/js/index.js 中， 增加一個 socket.on('gameStartEvent', function(data){init(); setTimeout(...)});

3 在 setTimeout 10ms後 emit 一個userInputEvent

4 在 server.js 增加一個socket.on('userInputEvent', function(data){if 所有玩家都emit過 userInputEvent, then emit updateEvent)

5 在 index.js中 增加一個 socket.on('updateEvent', function(data){玩家update, 並setTimeout(...)});
