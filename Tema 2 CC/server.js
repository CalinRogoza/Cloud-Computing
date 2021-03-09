const http = require('http');
const url = require('url');
var mysql = require('mysql');
const querystring = require('querystring');


var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "tema2"
});

var raspuns;

const server = http.createServer((req, res) => {

    const urlparse = url.parse(req.url, true);

    if (urlparse.pathname == '/cats' && req.method == 'GET') {

        con.query("SELECT * FROM cats;", function (err, result, fields) {
            if (err) throw err; // caz eroare...
            raspuns = JSON.stringify(result);
            console.log(raspuns);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(raspuns);
        });

    }

    if (urlparse.pathname == '/cats' && req.method == 'POST') {
        var body = '';
        req.on('data', function (data) {
            body += data;
            if (body.length > 1e6) {
                req.connection.destroy();
            }
        });
        // var post;
        req.on('end', function () {
            var post = JSON.parse(body);
            console.log(post);

            con.query("INSERT INTO cats (name,age,color) VALUES ('" + post.name + "'," + post.age + ",'" + post.color + "');", function (err, result, fields) {
                if (err) throw err;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(post));
            })

        });
        // console.log(post);


        // con.connect(function(err) {
        //     if (err) throw err;
        //     con.query("SELECT * FROM cats;", function (err, result, fields) {
        //         if (err) throw err;
        //         raspuns = JSON.stringify(result);
        //         console.log(raspuns);
        //         res.writeHead(200, {'Content-Type': 'application/json'});
        //         res.end(raspuns);
        //     });
        // });
    }
    
});

server.listen(3000, 'localhost', () => {
    console.log('Listening at port 3000');
});
