// Modules
var mysql = require("mysql");
var path = require('path');

// Consts
const port = 9000;

// Connect to DB
var connection = mysql.createConnection({
  host: '127.0.0.1',
	user: 'leoska',
	password: '1234',
	database: 'dz2'
});

connection.connect(function(error) {
  if (error)
    console.log("Error connect to DB " + error);
  else
    console.log("Connected to DB as id " + connection.threadId);
});

// Options
var options = {
  'log level': 0
};

// Launch Web-Site
var sitess = require("express");

// Описание настроек:
var staticSiteOptions = {
   portnum: 3003, // слушать порт 80
   maxAge: 1000 * 60 * 15 // хранить страницы в кэше пятнадцать минут
};

// Тут стабильно ставится весь сайт.
sitess().set('view engine', 'html');
//sitess().engine('html', require('ejs').renderFile);
sitess().use(sitess.static(
   path.join(__dirname, 'static'),
   staticSiteOptions
)).listen(staticSiteOptions.portnum);


/*var server = http.createServer(function(request, response) {
  response.writeHead(200, {'Content-Type': 'text/html'});
  var myReadStream = fs.createReadStream(__dirname + '/chat.html', 'utf8');
  myReadStream.pipe(response);
}); //app);

server.listen(port, '127.0.0.1');*/
//var app = require("express")();
//var http = require('http');
//var server = http.createServer(sitess);
var io = require('socket.io').listen(port);

/*// Здесь нужно переписать...
// Клиент может рендерить всего 1 index.html => что делать с остальными стр?
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/chat.html');
});*/

// Вешаем слушатели
io.sockets.on('connection', function(client) {
    console.log('a user connected');
    // Слушатель на событие registr от клиента
    client.on("registr", function(user, pass, meta) {
      
    });
    // Слушатель на событие message от клиента
    client.on('message', function(message) {
        try {
            console.log('message: ' + message);
            //посылаем сообщение себе
            client.emit('message', message);
            //посылаем сообщение всем клиентам, кроме себя
            client.broadcast.emit('message', message);
        } catch (e) {
            console.log(e);
            client.disconnect();
        }
    });
    
    client.once('disconnect', function() {
      console.log("a user disconnect");
    })
});

/*server.listen(port, function(){
  console.log("listening on *:" + port);
})*/

connection.end(function(err) {
    if (err) {
      return console.log(err);
    }  
    console.log("Disconnect");
});