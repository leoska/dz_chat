// Modules & Requires
var mysql = require("mysql");
var path = require('path');
var CryptoJS = require("crypto-js"); 
var AES = require("crypto-js/aes");

/*var ciphertext = CryptoJS.AES.encrypt('сообщение', 'секретный ключ');
console.log(ciphertext.toString());
var bytes  = CryptoJS.AES.decrypt(ciphertext.toString(), 'секретный ключ');
var plaintext = bytes.toString(CryptoJS.enc.Utf8);
console.log(plaintext);*/

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
    if (error) {
        console.log();
        console.log('The following error occured while trying to connect to MySQL ' + error.message);
        return;
    }
    console.log();
    console.log("Connected to DB as id " + connection.threadId);
});

// Functions for work with DB
var sql_stmt = "";

function listUsers() {
    sql_stmt = "SELECT * FROM users;";

    connection.query(sql_stmt, function(err, rows) {
        console.log();
        console.log("Users Listing");
        console.log();

        console.table(rows);

        console.log("Total rows returned: " + rows.length);
    });
};

function addRecord(name, pass, meta) {

    sql_stmt = "INSERT INTO users(name,password,metadata) VALUES (?,?,?)";

    var values = [name, pass, meta];

    sql_stmt = mysql.format(sql_stmt, values);

    connection.query(sql_stmt, function (error, result) {
        if (error) {
            console.log('The following error occured while trying to insert a new record ' + error.message);
        }
        console.log();
        console.log('Created new user with id ' + result.insertId);
    });
}

function getRecord(c) {
  var arr = new Array();
  sql_stmt = "SELECT * FROM users";
  connection.query(sql_stmt, function (err, results, fields) {
    if (err) {
      console.log('The following error occured while trying select all records ' + error.message);
    }
    for (i = 0; i < results.length; i++) {
      arr.push([results[i].name, results[i].password, results[i].metadata]);
    }
    c.emit("listusers", arr);
  });
}

// Options
var options = {
  "log level": 0
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
io.sockets.on('connection', function (client) {
    // Здесь нужно смотреть, новый клиент или нет.
    console.log('a user connected');

    client.on("requestlist", function() {
      getRecord(client);
    });

    // Слушатель на событие registr от клиента
    client.on("registr", function (name, pass, meta) {
      addRecord(name, pass, meta);
      /*var bytes = CryptoJS.AES.decrypt(meta, "ABC");
      var plaintext = bytes.toString(CryptoJS.enc.Utf8);
      console.log(plaintext);*/
    });

    // Слушатель на событие message от клиента
    client.on('message', function (message) {
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
    
    client.once('disconnect', function () {
      console.log("a user disconnect");
    })
});

/*server.listen(port, function(){
  console.log("listening on *:" + port);
})*/

/*connection.end(function(err) {
    if (err) {
      return console.log(err);
    }  
    console.log("Disconnect");
});*/