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

    var id = urlparse.pathname.split('/');
    var cale = id[1];
    id = id[2];
    console.log(id);

    if (id == null) {    // atunci cand url nu contine un id

        console.log("FARA ID");

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

            req.on('end', function () {
                var post = JSON.parse(body);
                console.log(post);

                con.query("INSERT INTO cats (name,age,color) VALUES ('" + post.name + "'," + post.age + ",'" + post.color + "');", function (err, result, fields) {
                    if (err) throw err;
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(post));
                })
            });
        }

        if (req.method == 'PUT' || req.method == 'PATCH' || req.method == 'DELETE') { // daca incearca sa se faca PUT/PATCH/DELETE pe toata colectia
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end('Method not allowed.');
        }

    }
    else if (id != '') {
        console.log("CU ID");
        console.log(cale);
        // console.log(typeof(id));
        if (cale == 'cats' && req.method == 'GET') {
            console.log("ARE ID");
            con.query("SELECT * FROM cats WHERE id = " + id + ";", function (err, result, fields) {
                if (err) throw err; // caz eroare...
                raspuns = JSON.stringify(result);
                console.log(raspuns);

                if (result[0] == null) { // daca nu returneaza nimic query-ul
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end("Not found.");
                }
                else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(raspuns);
                }
            });
        }

        if (cale == 'cats' && req.method == 'DELETE') {
            console.log("ARE ID");
            con.query("DELETE FROM cats WHERE id = " + id + ";", function (err, result, fields) {
                if (err) throw err; // caz eroare...
                raspuns = JSON.parse(JSON.stringify(result));

                if (raspuns.affectedRows != 0) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(raspuns));
                }
                else {  // daca a fost deja stearsa sau nu a fost gasita, se returneaza 404
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end("This resource cannot be found.")
                }

            });
        }

        if (cale == 'cats' && req.method == 'PUT') {
            // daca am rows affected => 200 , altfel 404
            var body = '';
            req.on('data', function (data) {
                body += data;
                if (body.length > 1e6) {
                    req.connection.destroy();
                }
            });

            req.on('end', function () {
                var put = JSON.parse(body);
                console.log(put);
                con.query("UPDATE cats SET name='" + put.name + "', age=" + put.age + ", color='" + put.color + "' WHERE id =" + id + ";", function (err, result, fields) {
                    if (err) throw err; // caz eroare...
                    raspuns = JSON.parse(JSON.stringify(result));
                    console.log("RASP: " + raspuns);

                    if (raspuns.affectedRows != 0) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end();
                    }
                    else {  // daca nu a fost gasita, se returneaza 404
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end("This resource cannot be found.")
                    }
                });
            });
        }

        if (cale == 'cats' && req.method == 'POST') { // cand se face post cu ID
            con.query("SELECT * FROM cats WHERE id = " + id + ";", function (err, result, fields) {
                if (err) throw err; // caz eroare...
                raspuns = JSON.stringify(result);
                console.log(raspuns);
                
                if (result[0] == null) { // daca nu returneaza nimic query-ul
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end();
                }
                else {
                    res.writeHead(409, { 'Content-Type': 'application/json' }); // Conflict
                    res.end();
                }
            });
        }

    }
    else {  // nu e construit corect url]: /cats/
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end('Invalid url.');
    }



});

server.listen(3000, 'localhost', () => {
    console.log('Listening at port 3000');
});
