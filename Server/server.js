const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const spawn = require("child_process").spawn;
const unirest = require("unirest");
const cheerio = require("cheerio");
const fs = require("fs");
const sql = require("mssql");
const readline = require('readline');

const app = express();
const tableName1 = "Products";
const tableName2 = "ProductVariations";
const primaryKey = "ProductIndex";
var scrapedData = [];
var scrapedDataShort = [];

app.use(
    cors({
        origin: "*"
    })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
    //server 172.18.0.2 for local sql on hetzner.
    //server V + 65.109.137.46 for unlocal sqltest on hetzner.
    //port: 1435,
    database: 'master',
    connectionTimeout: 60000,
    trustServerCertificate: true
};

sql.on('error',
    err => { // Connection broken.
        console.log(err.message);
    }
);

//Receives all products from the database.
async function getAllProducts() {
    try {
        let pool = await sql.connect(config);
        let result1 = await pool.request().query(`select * from ${tableName1}`);
        sql.close();
        var array = [];
        for (var key in result1.recordset) {
            if (result1.recordset.hasOwnProperty(key)) {
                var item = result1.recordset[key];
                array.push({
                    ProductIndex: item.ProductIndex,
                    ProductName: item.ProductName,
                    Price: item.Price,
                    PictureLink: item.PictureLink,
                    ProductLink: item.ProductLink
                });
            }
        }
        console.log(`Found following amount of products: ${array.length}`);
        return array;
    } catch (error) {
        console.log(error);
        sql.close();
    }
}
//receives a specific product from the database based on its productname. 
async function getSpecificProductByName(productName) {
    try {
        let pool = await sql.connect(config);
        let result1 = await pool.request().query(`select * from ${tableName1} where ProductName = ${productName}`);
        console.log(`Found following product: ${JSON.stringify(result1.recordset, null, 2)}`);
        sql.close();
        return result1.recordset;
    } catch (error) {
        console.log(error);
        sql.close();
        return error;
    }
}
//receives a specific product from the database based on its index number. 
async function getSpecificProductByID(index, tableName) {
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
}
//sends an obj and its index number and sets it in the database. TODO: make it update the record in the database if it already exists (based on index, index is primary key.)
async function sendProduct(obj) {
    obj.ProductIndex = `\'${obj.ProductIndex}\'`;
    obj.ProductName = `\'${obj.ProductName}\'`;
    obj.Price = `\'${obj.Price}\'`;
    obj.PictureLink = `\'${obj.PictureLink}\'`;
    obj.ProductLink = `\'${obj.ProductLink}\'`;
    try {
        let pool = await sql.connect(config);
        let result1 = await pool.request().query(`insert into ${tableName1} values(${obj.ProductIndex}, ${obj.ProductName}, ${obj.Price}, N${obj.PictureLink}, N${obj.ProductLink})`);
        console.log(result1);
        sql.close();
    } catch (error) {
        console.log(error);
        sql.close();
    }
    scrapedData = [];
}

async function getPrimaryKeys() {
    try {
        let pool = await sql.connect(config);
        let result1 = await pool.request().query(`select ${primaryKey} from ${tableName1}`);
        console.log(result1.recordset);
        sql.close();
        return result1;
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
            arr.forEach((element, index) => inserter += (`\(${element.ProductIndex}, \'${element.ProductName}\', \'${element.Price}\', N\'${element.PictureLink}\', N\'${element.ProductLink}\'\), `));
        }
        else if (tableName == tableName2) {
            arr.forEach((element, index) => element[1].forEach((elem, ind) => inserter += (`\(${element[0]}, \'${ind + 1}\', N\'${element[2][ind]}\', \'${elem}\', ${element[3][ind] ? "N\'" + element[3][ind] + "\'" : "NULL"}\), `)));
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
    } catch (error) {
        console.log(error);
        sql.close();
    }
    scrapedData = [];
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
        //cap of 1000 rows per insert statement. Set to 600 instead, because my function wrongly saves a value to be used for the next one, where it appends something before it checks the value.
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
    //console.log("debuggy: " + objArrayArray[0][0] + objArrayArray[1][0] + objArrayArray[2][0] + objArrayArray[3][0]);
}

async function deleteAllProducts(tableName) {
    try {
        let pool = await sql.connect(config);
        let result1 = await pool.request().query(`truncate table ${tableName}`);
        console.log(result1);
        sql.close();
    } catch (error) {
        console.log(error);
        sql.close();
    }
    scrapedData = [];
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
                    let pictures = [];
                    let link = [];

                    $('ul[class="row"]')
                        .find("li > div > div > a")
                        .each(function (index, element) {
                            titles[index] = $(element).find("h3").text();
                            pictures[index] =
                                "https://www.jh-electronica.com" +
                                $(element).find("div > img").attr("src");
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
                            PictureLink: pictures[i],
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
    sendMultipleProducts(await scrapeJHElectronica(), tableName1);
    console.log("Scraping and uploading results to the database.");
}

//Made just to have an async handler, for when a get request is sent to /api.
async function asyncRunner() {
    if (!scrapedData || scrapedData.length == 0) {
        //sets scrapedData to be an array of all the products in the database.
        //Additionally, scrapedDataShort is the same as scrapedData, but without Price and ProductLink (since the client doesn't need to show these)
        scrapedData = await getAllProducts();
        scrapedDataShort = scrapedData.map(({ Price, ProductLink, ...remainingAttrs }) => remainingAttrs);
    }
}

//Calls the function to check whether the product has variations, and then scrapes all relevant variation data. 
//returns either an array containing the different relevant values: [productindex], [price], [name], [picturelink], or returns null if no variations are found.
async function doVariationScrape(link) {
    return unirest
        .get(`${link}`)
        .headers({
            UserAgent: `${user_agent}`
        })
        .then((response) => {
            if (typeof response.body == "undefined") {
                console.log("Received empty body. Retrying...");
                return doVariationScrape(link);
            }
            var $ = cheerio.load(response.body);
            var entireDataBlock = $('div[class="infos baf pt25 pb35 pl25 pr25"]').find('script[type="text/javascript"]')
                .text();
            
            if (variationFinder(entireDataBlock)) {
                var allMatches = [];
                var pricematches = entireDataBlock.match(/(?<=price: )[^,]+/g);
                pricematches.forEach((item, ind) => {
                    item = "$" + item;
                    pricematches[ind] = item;
                });
                
                allMatches.push(pricematches);
                nameAndPictureFinder($).forEach((elem) => allMatches.push(elem));
                return allMatches;
            }
            return null;
        });
}

async function variationScraper(objectArray) {
    let amountOfObjectsSentAtATime = 6;
    let finalResults = [];
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
            let timeoutTimeMs = 20000;
            console.log("Waiting for result for product with index: " + obj.ProductIndex);
            //breaker is a variable used to break the for loop. I couldn't break it inside the .then for the promise, so I had to delegate it like this, even if it does look a little silly.
            let breaker = false;
            for (i = 0; i < 5 * 6; i++) {
                let result = new Promise((resolve) => {
                    resolve(doVariationScrape(obj.ProductLink));
                });
                //I needed a variable that wasn't false, because doVariationScrape returns false when a variation isn't found for the specified product.
                //also it couldn't be true either, as the variable returns true if it is anything not null or false. I chose 1 because... Well, because I did.
                let timeout = new Promise((resolve, reject) => {
                    setTimeout(resolve, timeoutTimeMs, 1);
                });
                await Promise.race([result, timeout]).then((data) => {
                    if (data != 1) {
                        if (data) {
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

    return finalResults;
}

//Finds and returns the name and picture link as arrays. An empty array is sent instead, if this value is not found. (e.g. when the variations don't have pictures)
function nameAndPictureFinder(cheerio) {
    let allResults = [];
    let diffRows = cheerio('[class="goodsspectable mb20"]');
    var name = [];

    let nameBefore = [...diffRows.find('ul[class="row tac"]')].map(e => 
        [...cheerio(e).find("li")].map(e => cheerio(e).find('img').attr("title") ? cheerio(e).find('img').attr("title").trim() : cheerio(e).text().trim())
    );
    

    nameBefore.sort((a, b) => a.length - b.length);


    nameBefore[0].forEach((obj) => {
        try {
            nameBefore[1].forEach((element) => {
                name.push(`\(${obj.replace(/\"/g, '\"\"').replace(/\'/g, "\'\'")}\) ${element.replace(/\"/g, '\"\"').replace(/\'/g, "\'\'")}`);
            });
        } catch(err) {
            name.push(`${obj.replace(/\"/g, '\"\"').replace(/\'/g, "\'\'")}`);
        }
    });


    let pictures = diffRows.find('[class="row tac"] > li').map(function () {
        return cheerio(this).find('img').attr("src");
    }).toArray();

    allResults.push(name);
    if (pictures.length < name.length && pictures.length != 0) {
        pictures = name.map((_, i) => pictures[i % pictures.length]);
    }
    if (pictures) {
        allResults.push(pictures);
    }
    return allResults;
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
    });
}

//Making the API request/response
app.get("/api", (req, res) => {
    asyncRunner();
    res.json(scrapedDataShort);
});

//Connection to python
app.post("/pyth", (req, res) => {
  asyncRunner().then(() => {
      var dataToSend = String();
      var dataNoFormatting = String();

      //console.log(req.body);
      try {
          var price = scrapedData[req.body.ProductIndex - 1].Price;
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
                  console.log(`Requested: ${dataToSend}`);
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

function innerQuestion() {
    var rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false});
    rl.setPrompt("Input command, or ? for a list of commands.\n");
    rl.prompt();
    rl.on('line', (query) => {
        switch (query.trim().toLowerCase()) {
            case "scrapejhtodb":
                console.log("Starting Scrape + DB Upload.");
                rl.pause();
                scrapeJHElectronicaToDatabase().then(() => {
                    rl.resume();
                    rl.prompt();
                });
                break;
            case "scrapejhvariationstodb":
                console.log("Starting scraping variations + DB Upload, this is gonna take a bit.");
                rl.pause();
                GetandSetDatabaseVariation().then(() => {
                    rl.resume();
                    rl.prompt();
                });
                break;
            case "?":
                console.log("Current options are: scrapeJHtoDB and scrapeJHVariationstoDB");
                break;
            default:
                console.log("Input not recognized. Try '?' for a list of commands.");
        }
    });
}


// use this V if you want to scrape new data and save it to the database:
//scrapeJHElectronicaToDatabase();

// use this V if you want to scrape new data and save it to a Json file:
//scrapeJHElectronicaToJSON();

// use this V if you want to upload the current Json File found in the same folder. WARNING: Will delete current records.
//UploadJsonFile();

// for getting all the database table1s values, and scraping them for variations and putting that result into database table2 V WARNING: Will delete current records, and also will take several hours just to grab the data.
//GetandSetDatabaseVariation();