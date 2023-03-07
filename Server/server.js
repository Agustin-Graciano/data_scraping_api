const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const spawn = require("child_process").spawn;
const unirest = require("unirest");
const cheerio = require("cheerio");
const fs = require("fs");
const sql = require("mssql");
const readline = require("readline");

const app = express();
const tableName1 = "Products";
const tableName2 = "ProductVariations";
var scrapedData = [];
var scrapedDataShort = [];
var scrapedDataVar = [];
var scrapedDataVarShort = [];

app.use(
    cors({
        origin: "*"
    })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());


var config = {
    user: 'SA',
    password: 'EBBase2Data',
    server: '172.18.0.2',
    //server 172.18.0.2 for local sql on Hetzner.
    //server V + 65.109.137.46 for unlocal sqltest on Hetzner.
    //port: 1435,
    database: 'JHProducts',
    connectionTimeout: 60000,
    trustServerCertificate: true
};


sql.on('error',
    err => { // Connection broken.
        console.log(err.message);
    }
);

//Writes images to file from img uri.
var download = async function (uri, filename) {
    return new Promise(async (resolve) => {
        unirest.get(uri)
            .encoding(null) // Added
            .end(async (res) => {
                //YES I just resolve any promises that go unfulfilled and try the download again, what of it?
                if (res.error) {
                    resolve();
                    return download(uri, filename);
                }
                const data = Buffer.from(res.raw_body);
                fs.writeFileSync(filename, data, 'binary'); // Modified or fs.writeFileSync(pageName + '.png', data);
                return resolve();
            });
    });
}

//Receives all records from a specific table in the master database.
async function getAllProducts(tableName) {
    try {
        let pool = await sql.connect(config);
        let result1 = await pool.request().query(`select * from ${tableName}`);
        sql.close();
        let array = result1.recordset;
        console.log(`Found following amount of products: ${array.length}`);
        return array;
    } catch (error) {
        console.log(error);
        sql.close();
        return null;
    }
}
//receives a specific product from the database based on its index number. 
function getSpecificProductByID(index, tableName) {
    index = Number(index);
    if (tableName == tableName1) {
        let obj = scrapedDataShort.find(prod => prod.ProductIndex === index);
        return obj;
    }
    let obj = scrapedDataVarShort.filter(prodVar => prodVar.ProductIndex === index);
    return obj;


        /*
        try {
            let pool = await sql.connect(config);
            let result1 = await pool.request().query(`select * from ${tableName} where ProductIndex = ${index}`);
            console.log(`Found following product/s: ${JSON.stringify(result1.recordset, null, 2)}`);
            sql.close();
            return result1.recordset;
        } catch (error) {
            console.log(error);
            sql.close();
            return error;
        }
        */
}

async function setDescriptions(objArray) {
    var arr = objArray;
    var splitterArr = [];
    var updaterArr = [];
    while (arr.length > 0) {
        splitterArr.push(arr.splice(0, 500));
    }
    for (var i = 0; i < splitterArr.length; i++) {
        let updater = `UPDATE e SET Description = t.Description FROM dbo.${tableName1} e JOIN (VALUES`;
        for (var j = 0; j < splitterArr[i].length; j++) {
            updater += `\(${splitterArr[i][j][0]}, \'${splitterArr[i][j][1].slice(0, 7999)}\'\),`;
        }
        updater = updater.slice(0, -1);
        updater += `) t (ProductIndex, Description) ON t.ProductIndex = e.ProductIndex`;
        await updaterArr.push(updater);
    }
    try {
        let pool = await sql.connect(config);
        for (const updater of updaterArr) {
            await pool.request().query(updater);
        }
        sql.close();
    } catch (error) {
        console.log(error);
        sql.close();
    }
}

async function sendMultiProductsPart(objArray, tableName) {
    var inserterArr = [];
    objArray.forEach(async (arr) => {
        let inserter = `insert into ${tableName} values `;
        if (tableName == tableName1) {
            arr.forEach((element, index) => inserter += (`\(${element.ProductIndex}, \'${element.ProductName}\', \'${element.Price}\', N\'${null}\', N\'${element.ProductLink}\'\), `));
        }
        else if (tableName == tableName2) {
            arr.forEach((element, index) => element[1].forEach((elem, ind) => inserter += (`\(${element[0]}, \'${ind + 1}\', N\'${element[2][ind]}\', \'${elem}\'\), `)));
        }
        inserter = inserter.substring(0, inserter.length - 2) + '\;';
        inserterArr.push(inserter);
        //console.log(arr.length);
    });

    //console.log("the length of things: " + objArray.length);
    //console.log("insertion string: " + inserter);

    try {
        let pool = await sql.connect(config);
        for (const inserter of inserterArr) {
            await pool.request().query(inserter);
        }
        sql.close();
        if (tableName == tableName1) {
            scrapedData = [];
        }
        else {
            scrapedDataVar = [];
        }
    } catch (error) {
        console.log(error);
        sql.close();
    }
}

async function sendMultipleProducts(objArray, tableName) {
    var arr = await objArray;

    var objArrayArray = [];
    var lengths = 0;
    var currentLength = 0;
    var arrayNum = 0;
    var lastArrayNum = 0;
    
    await arr.forEach((obj, i) => {
        if (tableName == tableName2) {
            currentLength = obj[1].length;
        }
        else if (tableName == tableName1) {
            currentLength = 1;
        }

        arrayNum = i;
        lengths += currentLength;
        //cap of 1000 rows per insert statement. Set to 600 instead, because this wrongly saves a value to be used for the next one, where it appends something before it checks the value.
        //I think, atleast.
        if (lengths >= 600) {
            lengths = currentLength;
            arrayNum -= 1;
            objArrayArray.push(arr.slice(lastArrayNum, arrayNum));
            lastArrayNum = arrayNum;
        }
    });

    objArrayArray.push(arr.slice(lastArrayNum, arr.length));

    //console.log("Below is all the records.");
    //console.log(objArrayArray);
    await deleteAllProducts(tableName);

    await sendMultiProductsPart(objArrayArray, tableName);
    
}

async function deleteAllProducts(tableName) {
    try {
        let pool = await sql.connect(config);
        let result1 = await pool.request().query(`truncate table ${tableName}`);
        console.log("Successfully deleted all products from table: ", tableName);
        //console.log(result1);
        sql.close();
    } catch (error) {
        console.log(error);
        sql.close();
    }
}

const selectRandom = () => {
  //An array with different user agents
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)  AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:42.0) Gecko/20100101 Firefox/42.0",
  ];
  var randomNumber = Math.floor(Math.random() * userAgents.length);
  return userAgents[randomNumber];
};

let user_agent = selectRandom();

//Sets the database values according to the json file "scrapedData.json" found in the same folder. Clears the entire table first.
function UploadJsonFile() {
    let jsonFileRead = fs.readFileSync(`scrapedData.json`);
    let parsedFile = JSON.parse(jsonFileRead);
    sendMultipleProducts(parsedFile.Products, tableName1);
    console.log("Finished uploading JSON to target database table.");
}
async function scrapeJHElectronica() {
    return unirest
        .get("https://www.jh-electronica.com/ProductList.aspx?mode=&per=1&sj=&ej=&keys=")
        .headers({
            UserAgent: `${user_agent}`
        })
        .then((response) => {
            let cheers = cheerio.load(response.body);
            let amountOfProductsToScrape = cheers('div[class="f16 fb sm-12"] > span').text();
            console.log("Discovered this amount of products to scrape: ", amountOfProductsToScrape);
            console.log("Scraping starting, please hold.");
            return unirest
                .get(`https://www.jh-electronica.com/ProductList.aspx?mode=&per=${amountOfProductsToScrape}&sj=&ej=&keys=`)
                .headers({
                    UserAgent: `${user_agent}`
                })
                .then((response) => {
                    let $ = cheerio.load(response.body);
                    let titles = [];
                    let prices = [];
                    let link = [];

                    $('ul[class="row"]')
                        .find("li > div > div > a")
                        .each(function (index, element) {
                            titles[index] = $(element).find("h3").text();
                            prices[index] = $(element).find("div > em").text();
                            link[index] =
                                "https://www.jh-electronica.com" + $(element).attr("href");
                        });

                    var results = [];
                    for (let i = 0; i < titles.length; i++) {
                        results.push({
                            ProductIndex: i + 1,
                            ProductName: titles[i].replace(/\s+/g, " ").trim().replace(/\"/g, '\"\"')
                                .replace(/\'/g, "\'\'"),
                            Price: prices[i],
                            PictureLink: null,
                            ProductLink: link[i]
                        });
                    }

                    console.log("Number of products obtained: " + results.length);
                    return results;
                });
        });
}
//ScrapesJHElectronica and returns all the products names, prices, picturelinks and productlinks in an array, that gets converted to Json.
async function scrapeJHElectronicaToJSON() {
    var results = await scrapeJHElectronica();
    var translateIntoJson = (arrToFile) => {
        if (arrToFile.length !== 0) {
            let jhElectronicaProductObject = {
                Products: arrToFile
            };
            fs.writeFile(
                "./scrapedData.json",
                JSON.stringify(jhElectronicaProductObject, null, 2),
                (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("file successfully created");
                    }
                }
            );
        } else {
            console.log("Action impossible due to lack of information");
        }
    };
    translateIntoJson(results);
};
async function scrapeJHElectronicaToDatabase() {
    console.log("Scraping and uploading results to the database.");
    await sendMultipleProducts(await scrapeJHElectronica(), tableName1);
    console.log("Successfully uploaded all scraped Products to the database.");
    await asyncRunner();
}

//Made just to have an async handler, for when a get request is sent to /api.
async function asyncRunner() {
    if (!scrapedData || scrapedData.length == 0) {
        //sets scrapedData to be an array of all the products in the database.
        //Additionally, scrapedDataShort is the same as scrapedData, but without Price and ProductLink (since the client doesn't need to show these)
        scrapedData = await getAllProducts(tableName1);
        if (scrapedData || scrapedData != null) {
            scrapedDataShort = scrapedData.map(({ Price, ProductLink, ...remainingAttrs }) => remainingAttrs);
            scrapedDataVar = await getAllProducts(tableName2);
            if (scrapedDataVar || scrapedDataVar != null) {
                scrapedDataVarShort = scrapedDataVar.map(({ Price, ...remainingAttrs }) => remainingAttrs);
            }
        }
    } else {
        if (!scrapedDataVar || scrapedDataVar.length == 0) {
            scrapedDataVar = await getAllProducts(tableName2);
            if (scrapedDataVar || scrapedDataVar != null) {
                scrapedDataVarShort = scrapedDataVar.map(({ Price, ...remainingAttrs }) => remainingAttrs);
            }
        }
    }
}

//Calls the function to check whether the product has variations, and then scrapes all relevant variation data. 
//returns either an array containing the different relevant values: [ProductIndex], [Price], [Name], [PictureLink], or returns null if no variations are found.
async function doVariationScrape(obj) {
    return unirest
        .get(`${obj.ProductLink}`)
        .headers({
            UserAgent: `${user_agent}`
        })
        .then(async (response) => {
            var allMatches = [];
            if (typeof response.body == "undefined") {
                //console.log("Received empty body. Retrying...");
                return doVariationScrape(obj);
            }
            var $ = cheerio.load(response.body);
            var entireDataBlock = $('div[class="infos baf pt25 pb35 pl25 pr25"]').find('script[type="text/javascript"]')
                .text();

            pictureDownload($, obj.ProductIndex);
            var desc = await descriptionFinder($);
            allMatches.push(desc);
            if (variationFinder(entireDataBlock)) {
                var pricematches = entireDataBlock.match(/(?<=price: )[^,]+/g);
                pricematches.forEach((item, ind) => {
                    item = "$" + item;
                    pricematches[ind] = item;
                });
                
                allMatches.push(pricematches);
                allMatches.push(nameFinder($));
            }
            return allMatches;
        });
}

async function descriptionFinder(cheerio) {
    let description;
    try {
        description = cheerio('div[class="li25 mt20"]').text().replace(/\s+/g, " ").replace(/\"/g, '\"\"')
            .replace(/\'/g, "\'\'").match(/.*(?=package type|package include:)/i)[0].trim();
        if (description.length == 0) {
            description = cheerio('div[class="li25 mt20"]').text().replace(/\s+/g, " ").replace(/\"/g, '\"\"')
                .replace(/\'/g, "\'\'").match(/package included:.*(?=We don''t support online payment.)/i)[0].trim();
            console.log(description);
        }
    }
    catch (err) {
        description = "";
    }
    return description;
}

async function pictureDownload(cheerio, productIndex) {
    let pictures = cheerio('ul[class="t-slider sliders fr sm-12"] > li').map(function () {
        return encodeURI(cheerio(this).find('img').attr("src"));
    }).toArray();
    let pictures2 = cheerio('[class="goodsspectable mb20"]').find('img').map(function () {
        return encodeURI(cheerio(this).attr("src"));
    }).toArray();

    var base = "https://www.jh-electronica.com";

    //pictures = [...new Set(pictures)];
    await pictures;
    await pictures2;

    for (var i = 0; i < pictures.length; i++) {
        await download(base + pictures[i], "./img/" + productIndex + "_" + i + pictures[i].substring(pictures[i].lastIndexOf('.'))).then(
            () => { });
        //console.log("This is but a little resistance...");
    }

    for (var j = 0; j < pictures2.length; j++) {
        await download(base + pictures2[j], "./img/" + productIndex + "-" + j + pictures2[j].substring(pictures2[j].lastIndexOf('.'))).then(
            () => { });
        //console.log("Now then, entertain me.");
    }

}

async function variationScraper(objectArray) {
    let amountOfObjectsSentAtATime = 6;
    let finalResults = [];
    let descriptionResults = [];
    while (objectArray.length > 0) {
        var smallerArray = [];
        if (objectArray.length > amountOfObjectsSentAtATime) {
            smallerArray = await objectArray.slice(0, amountOfObjectsSentAtATime);
            objectArray = await objectArray.slice(amountOfObjectsSentAtATime);
        } else {
            smallerArray = await objectArray;
            objectArray = [];
        }
        
        await Promise.all(smallerArray.map(async (obj) => {
            //console.log("work through: " + obj.ProductLink);
            let timeoutTimeMs = 30000;
            //console.log("Waiting for result for product with index: " + obj.ProductIndex);
            //breaker is a variable used to break the for loop. I couldn't break it inside the .then for the promise, so I had to delegate it like this, even if it does look a little silly.
            let breaker = false;
            for (i = 0; i < 5 * 6; i++) {
                let result = new Promise((resolve) => {
                    resolve(doVariationScrape(obj));
                });
                //I needed a variable that wasn't false, because doVariationScrape returns false when a variation isn't found for the specified product.
                //also it couldn't be true either, as the variable returns true if it is anything not null or false. I chose 1 because... Well, because I did.
                let timeout = new Promise((resolve, reject) => {
                    setTimeout(resolve, timeoutTimeMs, 1);
                });
                await Promise.race([result, timeout]).then((data) => {
                    if (data != 1) {
                        let array = [];
                        array.push(obj.ProductIndex, data.splice(0, 1)[0]);
                        descriptionResults.push(array);
                        //console.log(data);
                        if (data && data.length != 0) {
                            console.log("Variations found for product with index: " + obj.ProductIndex);
                            data.unshift(obj.ProductIndex);
                            finalResults.push(data);
                        } else {
                            console.log("Variations not found for product with index: " + obj.ProductIndex);
                        }
                        breaker = true;
                    } else {
                        console.log(`Timeout triggered at try ${i%6+1} for ${obj.ProductIndex} after ${timeoutTimeMs}MS. Trying again.`);
                    }
                });
                if (breaker) {
                    break;
                }
            }
        }));
        //await new Promise((resolve) => {
            //console.log("He's sleeping, dude.");
            //setTimeout(resolve, 2000);
        //});
    }
    await setDescriptions(descriptionResults);

    return finalResults;
}

//Finds and returns the name and picture link as arrays. An empty array is sent instead, if this value is not found. (e.g. when the variations don't have pictures)
function nameFinder(cheerio) {
    let diffRows = cheerio('[class="goodsspectable mb20"]');
    var name = [];

    let nameBefore = [...diffRows.find('ul[class="row tac"]')].map(e => 
        [...cheerio(e).find("li")].map(e => cheerio(e).find('img').attr("title") ? cheerio(e).find('img').attr("title").trim() : cheerio(e).text().trim())
    );

    nameBefore.sort((a, b) => a.length - b.length);

    if (nameBefore.length > 1) {
        nameBefore[0].forEach((obj) => {
            nameBefore[1].forEach((element) => {
                name.push(`\(${obj.replace(/\"/g, '\"\"').replace(/\'/g, "\'\'").replace('【', '(').replace('】',')')}\) ${element.replace(/\"/g, '\"\"')
                    .replace(/\'/g, "\'\'").replace('【', '(').replace('】', ')') }`);
            });
        });
    } else {
        nameBefore[0].forEach((obj) => {
            name.push(`${obj.replace(/\"/g, '\"\"').replace(/\'/g, "\'\'").replace('【', '(').replace('】', ')') }`);
        });
    }

    return name;
}

//Determines whether the provided dataBlock contains variations based on whether there are "keys", id's for variations.
// also contains an unused line of code for splitting the keysmatches string into multiple strings in an array.
function variationFinder(dataBlock) {
    let keysmatches = dataBlock.match(/(?<=keys = \[)[^\]]+\]/g);
    if (keysmatches) {
        return true;
    }
    return false;
}
//Function to retrieve just ProductIndex and ProductLink for each entry in the database. Used for finding variations, and properly "binding" the variations to the original entry based on entry index.
async function getIndexAndProductLink() {
    try {
        let pool = await sql.connect(config);
        let result1 = await pool.request().query(`select ProductIndex, ProductLink from ${tableName1}`);
        sql.close();
        var array = [];
        for (var key in result1.recordset) {
            if (result1.recordset.hasOwnProperty(key)) {
                var item = result1.recordset[key];
                array.push({
                    ProductIndex: item.ProductIndex,
                    ProductLink: item.ProductLink
                });
            }
        }
        //console.log(`Found following amount of products: ${array.length}`);
        return array;
    } catch (error) {
        console.log(error);
        sql.close();
        return null;
    }
}

//This function calls other functions to do its bidding. Definitely Evil-aligned. 
async function variationGetter() {

    let allIndexandProdLinks = await getIndexAndProductLink();

    let obtainVariationsData = await variationScraper(allIndexandProdLinks);

    return obtainVariationsData;
}

async function GetandSetDatabaseVariation() {
    console.time('GetAndSetDatabaseVariation Completed in');
    let variationData = await variationGetter();

    await sendMultipleProducts(variationData, tableName2).then(() => {
        console.log("Sent following amount of products, that have variations: " + variationData.length);
        console.timeEnd('GetAndSetDatabaseVariation Completed in');
        asyncRunner();
    });
}

//Making the API request/response
app.get("/api", (req, res) => {
    asyncRunner();
    res.json(scrapedDataShort);
});

//post a request with a ProductIndex in the body, and retrieve the variations that corresponds to that Product.
app.post("/apivar", (req, res) => {
    var request = req.body.ProductIndex;
    if (request) {
        res.json(getSpecificProductByID(request, tableName2));
    } else {
        res.json("?");
    }
});
//Connection to python
app.post("/pyth", (req, res) => {
  asyncRunner().then(() => {
      var dataToSend = String();
      var dataNoFormatting = String();

      //console.log(req.body);
      try {
          let obj = scrapedDataVar.filter(prodVar => prodVar.ProductIndex === req.body.ProductIndex);
          var price;
          if (obj) {
              price = obj[req.body.VariationIndex - 1].Price;
          } else {
              price = scrapedData[req.body.ProductIndex - 1].Price;
          }
          
          var priceNoSymbol = Number(price.slice(1));
          //var priceSymbol = price.slice(0, 1);
          const python3 = spawn("python3",
              [
                  "Calculator.py",
                  priceNoSymbol,
                  Number(req.body.Amount),
                  "USD",
                  "true",
                  "true",
                  String(req.body.Date)
              ]);
          python3.stdout.on("data",
              function (data) {
                  dataToSend = data.toString();
                  dataNoFormatting = dataToSend;
                  const formatter = new Intl.NumberFormat("dk-DK",
                      {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                      });
                  dataToSend = formatter.format(dataToSend);
                  //console.log(`Requested: ${dataToSend}`);
              });
          // in close event we are sure that stream from child process is closed
          python3.on("close", (code) => {
              // send data to browser
              //console.log(dataNoFormatting);
              if (Number(dataNoFormatting)) {
                  res.end(dataToSend);
              } else res.end("?");
          });
      } catch (err) {
          console.log(err);
          res.end("?");
      }
  });
}
);

app.listen(5000, () => {
    console.log("server started on port 5000");
});

asyncRunner().then(() => {
    innerQuestion();
});

function doBoth() {
    return new Promise((resolve, reject) => {
        scrapeJHElectronicaToDatabase().then(() => {
            GetandSetDatabaseVariation().then(() => {
                resolve();
            });
        });
    });
}

function innerQuestion() {
    var rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false});
    rl.setPrompt("Input command, or ? for a list of commands.\n");
    rl.prompt();
    rl.on('line', (query) => {
        switch (query.trim().toLowerCase()) {
            case "doboth":
                console.log(
                    "This function will scrape for everything, set both standard and variations tables, download images...");
                rl.question('Are you sure this is what you want? It\'s gonna take a monstrous amount of time. \'y\' for yes, send any other key to abort.',
                    (answer) => {
                        switch (answer.trim().toLowerCase()) {
                            case "y":
                                rl.pause();
                                doBoth().then(() => {
                                    console.log("Finished.");
                                    rl.resume();
                                    rl.prompt();
                                });
                                break;
                            default:
                                console.log("Aborted");
                        }
                    });
                break;
            case "scrapejhtodb":
                console.log("Starting Scrape + DB Upload.");
                rl.pause();
                scrapeJHElectronicaToDatabase().then(() => {
                    rl.resume();
                    rl.prompt();
                });
                break;
            case "scrapejhvariationstodb":
                console.log("Starting scraping variations + DB Upload + img download, this is gonna take a bit.");
                rl.pause();
                GetandSetDatabaseVariation().then(() => {
                    rl.resume();
                    rl.prompt();
                });
                break;
            case "?":
                console.log("Current options are: scrapeJHtoDB, scrapeJHVariationstoDB and doBoth");
                break;
            default:
                console.log("Input not recognized. Try '?' for a list of commands.");
        }
    });
}


//setDescriptions({ ProductIndex: 1, Description: "Haha, cool." });

// use this V if you want to scrape new data and save it to the database:
//scrapeJHElectronicaToDatabase();

// use this V if you want to scrape new data and save it to a Json file:
//scrapeJHElectronicaToJSON();

// use this V if you want to upload the current Json File found in the same folder. WARNING: Will delete current records.
//UploadJsonFile();

// for getting all the database table1s values, and scraping them for variations and putting that result into database table2 V WARNING: Will delete current records, and also will take several hours just to grab the data.
//GetandSetDatabaseVariation();