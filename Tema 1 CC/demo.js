const http = require('http');
const https = require('https');
const fetch = require("node-fetch");
const fs = require('fs');
const { resolve } = require('path');
require('dotenv').config();


const server = http.createServer((req, res) => {
    console.log('---------------------------REQUEST made-----------------------');
    var poze = "";
    var link_imagine = "";
    var vreme;

    const openweathermap_func = async () => {
        let start = new Date();
        var log = "OPEN-WEATHER-MAP \n";
        await fetch('http://api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=' + process.env.API_KEY_OWM)
            .then(response => response.json())
            .then(data => {
                log += JSON.stringify(data) + "\n";
                console.log(data.weather[0].main)
                vreme = data.weather[0].main;
            })
            .catch((err) => console.log(err));

        log += "TIME OWM: "
        log += new Date() - start;
        log += "ms \n\n"
        fs.appendFile('log.txt', log, function (err) {
            if (err) throw err;
        })

        console.log("TIME OWM: ", new Date() - start, "ms");
    }

    var cuvant_cheie;
    const dictionary_func = async () => {
        let start = new Date();
        var log = "DICTIONARY \n";
        await fetch('https://www.dictionaryapi.com/api/v3/references/thesaurus/json/car?key=' + process.env.API_KEY_DICT)
            .then(response => response.json())
            .then(data => {
                log += JSON.stringify(data) + "\n";
                console.log(data[0].meta.syns[0][0]);
                cuvant_cheie = data[0].meta.syns[0][0];
            })
            .catch((err) => console.log(err));

        log += "TIME DICTIONARY: "
        log += new Date() - start;
        log += "ms \n\n"
        fs.appendFile('log.txt', log, function (err) {
            if (err) throw err;
        })

        console.log("TIME Dictionary: ", new Date() - start, "ms");
    }

    const flickr_func = async () => {
        let f1 = await openweathermap_func();
        let f2 = await dictionary_func();
        link_imagine = "";
        let start = new Date();
        var log = "FLICKR \n";

        await fetch('https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + process.env.API_KEY_FLICKR + '&text=' + vreme + '%2B' + cuvant_cheie + '&format=json&nojsoncallback=1')
            .then((response) => response.json())
            .then((data) => {
                // console.log(data.photos.photo.length);
                log += JSON.stringify(data) + "\n";
                link_imagine += "https://live.staticflickr.com/";
                link_imagine += data.photos.photo[0].server + "/" + data.photos.photo[0].id + "_" + data.photos.photo[0].secret + ".jpg";
                console.log(link_imagine);
                poze += link_imagine + "||";
                // console.log(poze);
            })
            .catch((err) => console.log(err));

        log += "TIME FLICKR: ||";
        log += new Date() - start;
        log += "||ms \n\n";

        fs.appendFile('log.txt', log, function (err) {
            if (err) throw err;
        })

        console.log("TIME FLICKR: ", new Date() - start, "ms");
    }

    function helper() {
        return new Promise((resolve) => {
            flickr_func();
            resolve();
        })
    }


    res.setHeader('Content-Type', 'text/html');


    const fs_apel = async () => {
        await flickr_func();
        fs.readFile(path, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                res.write(data);

                res.write("<script>var variabila = \"" + link_imagine + "\";console.log(variabila);" +
                    "function functie(){" +
                    "document.getElementById('btn').onclick = function() {" +
                    "fetch('http://localhost:3000/getresult')" +
                    ".then(response => response);" +
                    "var src = \' " + link_imagine + "\'," +
                    "img = document.createElement('img');" +
                    "img.src = src;" +
                    "document.body.appendChild(img);" +
                    "}" +
                    "}" +
                    "</script></html>");

                res.end();
            }
        })
    }

    const fs_apel_paralel = async () => {
        // await paralelrun();
        fs.readFile(path, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                res.write(data);
                res.write("<script>" + "poze = " + poze + ";" +
                    "for (var i = 0 ; i < 5 ; i++) {" +
                    "var src = \'poze[i]\'," +
                    "img = document.createElement('img');" +
                    "img.src = src;" +
                    "document.body.appendChild(img);" +
                    "}" +
                    "</script></html>");
                console.log(poze);
                res.end();
            }
        })
    }

    async function paralelrun() {
        var i;
        var function_array;
        for (i = 0; i < 5; i++) {
            function_array += helper();
        }
        Promise.all(function_array)
            .then(fs_apel_paralel())
            .then(console.log("ASADASDSADAS", poze))

        // await fs_apel_paralel();
        // console.log(poze);
    }


    const fs_metrics = async () => {
        fs.readFile(path, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                res.write(data);
                var timpi = []
                fs.readFile('log.txt', (err, data) => {
                    data_string = data.toString();

                    var count = (data_string.match(/TIME FLICKR:/g)).length;
                    console.log(count);

                    timpi.push(data_string.split('||')[1]);

                    var pas = 1;
                    for (var i = 0; i < count - 1; i++) {
                        pas = pas + 2;
                        timpi.push(data_string.split('||')[pas]);
                    }

                    console.log("TIMPI:", timpi);

                    res.write("<script> myChart.data.datasets[0].data = [" + timpi + "]; myChart.update(); var n = myChart.data.datasets[0].data.length; console.log(n);myChart.data.labels=[]; for (var i = 1; i <= n; i++) {myChart.data.labels.push(i);} myChart.update();</script></html>");
                    res.end();
                })

            }
        })
    }


    if (req.url == '/getresult') {
        path = 'index.html';
        res.statusCode = 200;
        fs_apel();
    }
    else if (req.url == '/paralelrun') {
        path = 'paralel.html';
        res.statusCode = 200;
        paralelrun();
    }
    else if (req.url == '/metrics') {
        path = 'metrics.html';
        res.statusCode = 200;
        fs_metrics();
    }

});


server.listen(3000, 'localhost', () => {
    console.log('Listening at port 3000');
});