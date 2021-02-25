const http = require('http');
const https = require('https');
const fetch = require("node-fetch");
const fs = require('fs');
require('dotenv').config();


const server = http.createServer((req, res) => {
    console.log('---------------------------REQUEST made-----------------------');
    var poze = "";
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

        console.log("TIME OWM: ", new Date()-start,"ms");
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

        console.log("TIME Dictionary: ", new Date()-start,"ms");
    }

    const flickr_func = async () => {
        let f1 = await openweathermap_func();
        let f2 = await dictionary_func();
        var link_imagine = "";
        let start = new Date();
        var log = "FLICKR \n";
        await fetch('https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + process.env.API_KEY_FLICKR + '&text=' + vreme + '%2B' + cuvant_cheie + '&format=json&nojsoncallback=1')
            .then((response) => response.json())
            .then((data) => {
                // console.log(data1.photos);
                log += JSON.stringify(data) + "\n";
                link_imagine += "https://live.staticflickr.com/";
                link_imagine += data.photos.photo[0].server + "/" + data.photos.photo[0].id + "_" + data.photos.photo[0].secret + ".jpg";
                console.log(link_imagine);
                poze += link_imagine + "||";
            })
            .catch((err) => console.log(err));

        log += "TIME FLICKR: "
        log += new Date() - start;
        log += "ms \n\n"
        fs.appendFile('log.txt', log, function (err) {
            if (err) throw err;
        })

        console.log("TIME FLICKR: ", new Date()-start,"ms");
        
        // console.log("POZE", poze, '\n\n');
    }


    // const noname = async () => {
    //     await flickr_func();
    //     console.log("AAAAAAAAAAAAAAAA", link_imagine);
    // }

    // noname();

    res.setHeader('Content-Type', 'text/html');


    const fs_apel = async () => {
        await flickr_func();
        fs.readFile(path, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                res.write(data);
                
                // console.log("MMMMMMMMMMMMMMM", link_imagine);
                res.write("<script>var variabila = \"" + link_imagine + "\";console.log(variabila);" + 
                "function functie(){" +
                    "document.getElementById('btn').onclick = function() {" +
                    "fetch('http://localhost:3000/getresult')" +
                    ".then((response) => response);" +
                        "var src = \' "+ link_imagine + "\'," +
                            "img = document.createElement('img');" +
                        "img.src = src;" +
                        "document.body.appendChild(img);"+
                    "}" +
                "}" +
                "</script></html>");

                res.end();
            }
        })
    }

    const fs_apel_paralel = async () => {
        await paralelrun();
        console.log("MMMMM", poze);
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
                    "}"+
                    "</script></html>");
                console.log(poze);
                res.end();
            }
        })
    }

    async function paralelrun() {
        var i;
        var function_array;
        for(i = 0 ; i < 5 ; i++) {
            function_array += flickr_func();
        }
        await Promise.all(function_array);            
    }
    

    if(req.url == '/getresult') {
        path = 'index.html';
        res.statusCode = 200;
        fs_apel();
    }
    else if (req.url == '/paralelrun') {
        path = 'paralel.html';
        res.statusCode = 200;
        fs_apel_paralel();
    }

    // fs_apel();

});


server.listen(3000, 'localhost', () => {
    console.log('Listening at port 3000');
});