const http = require('http');
const https = require('https');
const fetch = require("node-fetch");
const fs = require('fs');
require('dotenv').config();


const server = http.createServer((req, res) => {
    console.log('---------------------------REQUEST made-----------------------');
    var link_imagine = "";
    var vreme;
    const openweathermap_func = async () => {
        await fetch('http://api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=' + process.env.API_KEY_OWM)
            .then(response => response.json())
            .then(data2 => {
                console.log(data2.weather[0].main)
                vreme = data2.weather[0].main;
            })
            .catch((err) => console.log(err));
    }

    var cuvant_cheie;
    const dictionary_func = async () => {
        await fetch('https://www.dictionaryapi.com/api/v3/references/thesaurus/json/car?key=' + process.env.API_KEY_DICT)
            .then(response => response.json())
            .then(data3 => {
                console.log(data3[0].meta.syns[0][0]);
                cuvant_cheie = data3[0].meta.syns[0][0];
            })
            .catch((err) => console.log(err));
    }

    const flickr_func = async () => {
        let f1 = await openweathermap_func();
        let f2 = await dictionary_func();
        await fetch('https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + process.env.API_KEY_FLICKR + '&text=' + vreme + '%2B' + cuvant_cheie + '&format=json&nojsoncallback=1')
            .then((response) => response.json())
            .then((data1) => {
                // console.log(data1.photos);
                link_imagine += "https://live.staticflickr.com/";
                link_imagine += data1.photos.photo[0].server + "/" + data1.photos.photo[0].id + "_" + data1.photos.photo[0].secret + ".jpg";
                console.log(link_imagine);
            })
            .catch((err) => console.log(err));
    }


    const noname = async () => {
        await flickr_func();
        console.log("AAAAAAAAAAAAAAAA", link_imagine);
    }

    // noname();


    res.setHeader('Content-Type', 'text/html');

    const fs_apel = async () => {
        await flickr_func();
        fs.readFile('index.html', (err, data) => {
            if (err) {
                console.log(err);
            } else {
                res.write(data);
                
                // console.log("MMMMMMMMMMMMMMM", link_imagine);
                res.write("<script>var variabila = \"" + link_imagine + "\";console.log(variabila);" + 
                "function functie(){" +
                    "document.getElementById('btn').onclick = function() {" +
                    "fetch('http://localhost:3000')" +
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

    fs_apel();

});


server.listen(3000, 'localhost', () => {
    console.log('Listening at port 3000');
});