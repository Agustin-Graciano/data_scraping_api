const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const cors = require("cors");
const spawn = require("child_process").spawn;
const unirest = require("unirest");
const cheerio = require("cheerio");
const fs = require("fs");
const sql = require("mssql");
const app = express();

const tableName1 = "JHElectronica";
const tableName2 = "JHVariations";
const primaryKey = "ProductIndex";

var scrapedData = [];

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
    user: 'CloudSAe3bf2b26',
    password: 'tkbjVLaMnR4Mn2f',
    server: 'testofmagicandmysticalnicoladsdb.database.windows.net',
    database: 'TestDatabase',
    connectionTimeout: 60000
};

sql.on('error',
    err => { // Connection broken.
        console.log(err.message);
    });

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
    await deleteAllProducts(tableName);

    var objArrayArray = [];
    var lengths = 0;
    var currentLength = 0;
    var arrayNum = 0;
    var lastArrayNum = 0;
    await objArray.forEach((obj, i) => {
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
            objArrayArray.push(objArray.slice(lastArrayNum, arrayNum));
            lastArrayNum = arrayNum;
        }
    });

    objArrayArray.push(objArray.slice(lastArrayNum, objArray.length));
    //console.log("Below is all the records.");
    //console.log(objArrayArray);
    
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

//getAllProducts();
//getSpecificProductByID(2);
//let testObject = { ProductName: "TestProductAgainDiff", Price: "$0.10", PictureLink: "five", ProductLink: "sixteen" };
//let testObject2 = { ProductName: "TestProductAgain", Price: "$0.10", PictureLink: "five", ProductLink: "sixteen" };
//let testObject3 = { ProductName: "TestProductDiff", Price: "$0.10", PictureLink: "five", ProductLink: "sixteen" };
//let testList = [testObject, testObject2, testObject3];
//sendMultipleProducts(testList);
//getPrimaryKeys();



//<== | Data scraping

// const scrapeFunction = async (url) => {
//   try {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(url);

//     const productHeading = await page.waitForSelector(".product-meta__title");
//     /*
//     const [productHeading] = await page.$(
//       '//*[@id="shopify-section-product-template"]/section/div/div[1]/div/div[1]/div/div[1]/div/h1'
//     );
//     */

//     const innerTxt = await productHeading.getProperty("textContent");

//     const headingTxt = await innerTxt.jsonValue();
//     scrapedData = headingTxt;

//     browser.close();
//   } catch (e) {
//     console.error("The scraping was deprecated because of", e);
//   }
// };
// console.log(scrapedData);

// scrapeFunction(
//   "https://ebits.dk/collections/mikrokontrollere/products/arduino-nano-r3"
// );

// const searchScraping = async () => {
//   try {
//     //Launchin puppeteer
//     const browser = await puppeteer.launch({
//       args: [
//         "--no-sandbox",
//         "--headless",
//         "--disable-gpu",
//         "--window-size=1920x1080",
//       ],
//     });
//     const page = await browser.newPage();
//     await page.setRequestInterception(true);
//     page.on("request", (interSeptedRequest) => {
//       //Still not sure if it is okay to be "!==" instead of "==="
//       interSeptedRequest.resourceType !== "document"
//         ? interSeptedRequest.abort()
//         : interSeptedRequest.continue();
//     });
//     //Setting the user agent to be custom, so the google server does not kick me due to using a headless browser
//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36"
//     );
//     //Assigning the location the page is supposed to go to
//     await page.goto(
//       "https://www.banggood.com/?utm_source=google&utm_medium=cpc_brand&utm_content=all&utm_campaign=aceng-skw-ads-eu-bg-rsa&ad_id=343808804361&gclid=Cj0KCQiA8aOeBhCWARIsANRFrQHxlVfwJXuguVvWFuIrt8TbpIVoQavek9HRFY-10SVEvlF2jIv-PJ4aAvDPEALw_wcB",
//       { waitUntil: "networkidle2" }
//     );
//     //Waiting for the search bar on the page to load and get in visability
//     await page.waitForSelector('input[aria-label="Search"]', { visable: true });
//     //Targetinng an element with the "type" method and specifying what to type in
//     await page.type('input[aria-label="Search"]', "Ali express");
//     await Promise.all([
//       page.waitForNavigation({ waitUntil: "domcontentloaded" }),
//       page.keyboard.press("Enter"),
//     ]);
//     //waiting untill the needed element (in this case the search results are visible)
//     await page.waitForSelector(".LC20lb", { visible: true });

//     const scrappedResult = await page.$$eval(".LC20lb", (els) =>
//       els.map((e) => ({ title: e.innerText, link: e.parentNode.href }))
//     );
//     console.log(scrappedResult);
//     scrapedData = scrappedResult;
//     browser.close();
//   } catch (e) {
//     console.error("the search scrape failed due to:", e);
//     console.log("the search scrape failed due to", e);
//   }
// };

// searchScraping();

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

let scrapedDataGoogle = [];

/*  const scrapeGoogleSearch = () => {
  return unirest
    .get("https://www.google.com/search?q=AliExpress+&sxsrf")
    .headers({
      "User-Agent": `${user_agent}`
    })
    .then((response) => {
      let $ = cheerio.load(response.body);

      let titles = [];
      let links = [];
      let snippets = [];
      let displayedLinks = [];

      $(".yuRUbf > a > h3").each((i, el) => {
        titles[i] = $(el).text();
      });

      $(".yuRUbf > a").each((i, el) => {
        links[i] = $(el).text();
      });
      $(".g .VwiC3b").each((i, el) => {
        snippets[i] = $(el).text();
      });
      $(".g .yuRUbf .NJjxre .tjvczx").each((i, el) => {
        displayedLinks[i] = $(el).text();
      });
      const Results = [];

      for (let i = 0; i < titles.length; i++) {
        Results[i] = {
          title: titles[i],
          link: links[i],
          snippet: snippets[i],
          displayedLink: displayedLinks[i],
        };
      }

      let GoogleSearchScrape = Results;
      scrapedDataGoogle.push(GoogleSearchScrape);
      console.log(Results);
    });
}; */
/*
let scrapedDataJHElectronica = [];
const scrapeJHElectronica = () => {
  return unirest
    .get(
      "https://www.jh-electronica.com/jh-products.aspx?mode=&per=80&sj=&ej=&keys="
    )
    .headers({
      UserAgent: `${user_agent}`,
    })
    .then((response) => {
      let $ = cheerio.load(response.body);

      let titles = [];
      let prices = [];
      let pictures = [];

      $("em").each((i, el) => {
        prices[i] = $(el).text();
      });
      $(".h-car1-item  .els2").each((i, el) => {
        titles[i] = $(el).text();
      });
      $(".pic .po-auto").each((i, el) => {
        pictures[i] = $(el).attr("src");
      });

      const Results = [];

      for (let i = 0; i < titles.length; i++) {
        Results[i] = {
          title: titles[i].replace(/\s+/g, " ").trim(),
          price: prices[i].replace(/\s+/g, " ").trim(),
          picture: pictures[i]
        };
      }

      console.log(Results);
      let JHElectronica = Results;

      scrapedDataJHElectronica.push(JHElectronica);
    });
};
*/


const scrapeJHElectronicaToJSON = async () => {
    return unirest
        .get("https://www.jh-electronica.com/ProductList.aspx?mode=&per=1&sj=&ej=&keys=")
        .headers({
            UserAgent: `${user_agent}`
        })
        .then((response) => {
            let cheers = cheerio.load(response.body);
            let amountOfProductsToScrape = cheers('div[class="f16 fb sm-12"] > span').text();
            console.log("Discovered this amount of products to scrape: ", amountOfProductsToScrape);
            return unirest
                .get(`https://www.jh-electronica.com/ProductList.aspx?mode=&per=${amountOfProductsToScrape}&sj=&ej=&keys=`)
                .headers({
                    UserAgent: `${user_agent}`
                })
                .then((response) => {
                    console.log("Scraping start, please hold.");
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

                    /*
                    $("em .tac .fb .db .mt5").each((i, el) => {
                      prices[i] = $(el).text();
                    });
              
                    $(".h-car1-item  .els2").each((i, el) => {
                      titles[i] = $(el).text();
                    });
              
                    $("li .pic .po-auto").each((i, el) => {
                      pictures[i] = $(el).attr("src");
                    });
                    */

                    const Results = [];
                    for (let i = 0; i < titles.length; i++) {
                        Results[i] = {
                            ProductIndex: i + 1,
                            ProductName: titles[i].replace(/\s+/g, " ").trim().replace(/\"/g, '\"\"').replace(/\'/g, "\'\'"),
                            Price: prices[i],
                            PictureLink: pictures[i],
                            ProductLink: link[i]
                        };
                    }

                    console.log(Results);
                    console.log("Number of products obtained: " + Results.length);

                    var translateIntoJSON = (arrToFile) => {
                        if (arrToFile.length !== 0) {
                            let JHElectronicaProductObject = {
                                Products: arrToFile,
                            };
                            fs.writeFile(
                                "./scrapedData.json",
                                JSON.stringify(JHElectronicaProductObject, null, 2),
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
                    translateIntoJSON(Results);
                });
        });
};


//scrapeJHElectronica();
scrapeJHElectronicaToJSON();
/* scrapeGoogleSearch(); */
//Made just to have an async handler, for when get /api.
async function asyncRunner(res) {
    if (!scrapedData) {
        //sets scrapedData to be an array of all the products in the database.
        scrapedData = await getAllProducts();
    }
    res.json(scrapedData);
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
                //FinalResults.push(allMatches);
            }
            return null;
        });
}

async function variationScraper(objectArray) {
    let amountOfObjectsSentAtATime = 6;
    let finalResults = [];
    //This is some important stuff, but not for right now.
        
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
    

    //console.log(finalResults.length);
    //console.log("WHAAAAAAAAAAT: ");
    //finalResults.forEach((obj) => {
        //console.log(obj[1].length);
    //});

    /*
    let jsonFileRead = fs.readFileSync(`ScrapedVariations.json`);
    let parsedFile = JSON.parse(jsonFileRead);
    return parsedFile;
    */

    return finalResults;
}

//Finds and returns the name and picture link as arrays. An empty array is sent instead, if this value is not found. (e.g. when the variations don't have pictures)
function nameAndPictureFinder(cheerio) {
    let allResults = [];
    let diffRows = cheerio('[class="goodsspectable mb20"]');
    //let row = cheerio('[class="row tac"] > li');
    //let pictures = row.find('img').attr("src");
    //let name = row.find('a[class="db"]').text();
    var name = [];

    let nameBefore = [...diffRows.find('ul[class="row tac"]')].map(e => 
        [...cheerio(e).find("li")].map(e => cheerio(e).find('img').attr("title") ? cheerio(e).find('img').attr("title").trim() : cheerio(e).text().trim())
    );

    //console.log(nameBefore[0]/*.includes("")*/);
    //console.log(nameBefore[1]/*.includes("")*/);
    //console.log(nameBefore[0]);

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
        //console.log(diffRows.find('ul:nth-child(0) > li'));
        //console.log(diffRows.find('ul:nth-child(1) > li'));


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
        //let keysmatchessplit = keysmatches[0].match(/(?<=\')[^\',]+(?=\')/g);
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
    //let tester = [];

    //for (i = 0; i < 200; i++) {
        //tester.push(allIndexandProdLinks[i]);
    //}
    //for (i = 155; i < 175; i++) {
        //tester.push(allIndexandProdLinks[i]);
    //}
    //tester.push(allIndexandProdLinks[155]);
    //tester.push(allIndexandProdLinks[156]);
    //tester.push(allIndexandProdLinks[157]);
    //tester.push(allIndexandProdLinks[158]);
    //tester.push(allIndexandProdLinks[159]);

    //console.log(typeof tester[0].ProductLink);

    let obtainVariationsData = await variationScraper(allIndexandProdLinks);
    
    /*
    fs.writeFile(
        "./ScrapedVariations.json",
        JSON.stringify(obtainVariationsData, null, 2),
        (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("file successfully created");
            }
        }
    );
    */
    return obtainVariationsData;
}

async function GetandSetDatabaseVariation() {
    console.time('GetAndSetDatabaseVariation Completed in');
    let variationData = await variationGetter();
    await sendMultipleProducts(variationData, tableName2);
    console.log("Sent following amount of products, that have variations: " + variationData.length);
    console.timeEnd('GetAndSetDatabaseVariation Completed in');
}

//Making the API request/response
app.get("/api", (req, res) => {
    asyncRunner(res);
});

//Connection to python
app.post("/pyth", (req, res, next) => {
  var price = Number(req.body.Price);
  var amount = Number(req.body.Amount);
  var currency = String(req.body.Currency);
  var outsideEbits = String(req.body.OutsideEbits);
  var outsideEU = String(req.body.OutsideEU);
  var dateToBeDelivered = String(req.body.Date);
  var dataToSend = String();
  console.log(req.body);

  const python3 = spawn("python", [
    "Calculator.py",
    price,
    amount,
    currency,
    outsideEbits,
    outsideEU,
    dateToBeDelivered
  ]);
  python3.stdout.on("data", function (data) {
    dataToSend = data.toString();
    const formatter = new Intl.NumberFormat("dk-DK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    dataToSend = formatter.format(dataToSend);
    console.log(`Results: ${dataToSend}`);
  });

  // in close event we are sure that stream from child process is closed
  python3.on("close", (code) => {
    // send data to browser
    res.end(dataToSend);
  });
});

app.listen(5000, () => {
  console.log("server started on port 5000");
});

// use this V if you want to scrape new data and save it to a Json file:
//scrapeJHElectronicaToJSON();

// use this V if you want to upload the current Json File found in the same folder. WARNING: Will delete current records.
//UploadJsonFile();

// for getting all the database table1s values, and scraping them for variations and putting that result into database table2 V WARNING: Will delete current records, and also will take several hours just to grab the data.
//GetandSetDatabaseVariation();







//scrapeJHElectroPageNumbers(1);
//scrapeJHElectroPageNumbers(2);