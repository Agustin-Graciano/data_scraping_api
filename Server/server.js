const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const cors = require("cors");
const spawn = require("child_process").spawn;
var unirest = require("unirest");
const cheerio = require("cheerio");
const fs = require("fs");
const sql = require("mssql");

const app = express();

const tableName = "JHElectronica";
const primaryKey = "ProductIndex";
app.use(
    cors({
        origin: "*"
    })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var config = {
    user: 'CloudSAe3bf2b26',
    password: 'tkbjVLaMnR4Mn2f',
    server: 'testofmagicandmysticalnicoladsdb.database.windows.net',
    database: 'TestDatabase'
};

sql.on('error',
    err => { // Connection borked.
        console.log(err.message);
    });

//Receives all products from the database.
async function getAllProducts() {
    try {
        let pool = await sql.connect(config);
        let result1 = await pool.request().query(`select * from ${tableName}`);
        let finalresult = JSON.stringify(result1.recordset, null, 2);
        console.log(`Found following products: ${finalresult}`);
        sql.close();
        return result1;
    } catch (error) {
        console.log(error);
        sql.close();
        return error;
    }
}

//receives a specific product from the database based on it's index number. 
async function getSpecificProduct(Index) {
    try {
        let pool = await sql.connect(config);
        let result1 = await pool.request().query(`select * from ${tableName} where ProductIndex = ${Index}`);
        console.log(`Found following product: ${JSON.stringify(result1.recordset, null, 2)}`);
        sql.close();
        return result1.recordset;
    } catch (error) {
        console.log(error);
        sql.close();
        return error;
    }
}
//sends an obj and its index number and sets it in the database. TODO: make it update the record in the database if it already exists (based on index, index is primary key.)
async function sendProduct(obj, objIndex) {
    obj.ProductName = `\'${obj.ProductName}\'`;
    obj.Price = `\'${obj.Price}\'`;
    obj.Picture = `\'${obj.Picture}\'`;
    obj.ProductLink = `\'${obj.ProductLink}\'`;
    try {
        let pool = await sql.connect(config);
        let result1 = await pool.request().query(`insert into ${tableName} values(${objIndex}, ${obj.ProductName}, ${obj.Price}, ${obj.Picture}, ${obj.ProductLink})`);
        console.log(result1);
        sql.close();
    } catch (error) {
        console.log(error);
        sql.close();
    }
}

async function getPrimaryKeys() {
    try {
        let pool = await sql.connect(config);
        let result1 = await pool.request().query(`select ${primaryKey} from ${tableName}`);
        console.log(result1.recordset);
        sql.close();
        return result1;
    } catch (error) {
        console.log(error);
        sql.close();
    }
}

async function sendMultipleProducts(objArray) {
    let inserter = `insert into ${tableName} values `;
    let primaryKeys = getPrimaryKeys();
    objArray.forEach((element, index) => inserter = inserter + (`\(${index + 1}, \'${element.ProductName}\', \'${element.Price}\', \'${element.Picture}\', \'${element.ProductLink}\'\), `));
    inserter = inserter.substring(0, inserter.length - 2) + '\;';
    console.log(inserter);
    try {
        let pool = await sql.connect(config);
        let result1 = await pool.request().query(inserter);
        console.log(result1);
        sql.close();
    } catch (error) {
        console.log(error);
        sql.close();
    }
    
}

getAllProducts();
getSpecificProduct(2);
//let testObject = { ProductName: "TestProductAgainDiff", Price: "$0.10", Picture: "five", ProductLink: "sixteen" };
//let testObject2 = { ProductName: "TestProductAgain", Price: "$0.10", Picture: "five", ProductLink: "sixteen" };
//let testObject3 = { ProductName: "TestProductDiff", Price: "$0.10", Picture: "five", ProductLink: "sixteen" };
//let testList = [testObject, testObject2, testObject3];
//sendMultipleProducts(testList);
getPrimaryKeys();

app.use(
  cors({
    origin: "*"
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

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

let scrapedDataJHElektronika = [];
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
      let JHElctronika = Results;

      scrapedDataJHElektronika.push(JHElctronika);
    });
};

let JHElctronika = [];
let scrapedDataJHElektronika2 = [];
function scrapeJHElectroPageNumbers(PageIndex) {
    return unirest
        .get('https://www.jh-electronica.com/jh-products.aspx?current=' + PageIndex + '&mode=&per=1&sj=&ej=&keys=')
        .headers({
            UserAgent: `${user_agent}`
        })
        .then((response) => {
            let $ = cheerio.load(response.body);
            let titles = [];
            let prices = [];
            let pictures = [];
            let link = [];

            $('ul[class="row"]').find('li > div > div > a').each(function (index, element) {
                titles[index] = $(element).find('h3').text();
                pictures[index] = "https://www.jh-electronica.com" + $(element).find('div > img').attr("src");
                prices[index] = $(element).find('div > em').text();
                link[index] = "https://www.jh-electronica.com" + $(element).attr("href");
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
                    title: titles[i].replace(/\s+/g, " ").trim(),
                    price: prices[i],
                    picture: pictures[i],
                    link: link[i]
                };
            }

            console.log(Results);
            console.log("Number of products obtained: " + Results.length);
            let JHElctronika = Results;
            return Results;
            scrapedDataJHElektronika2.push(JHElctronika);
        });
}
const scrapeJHElectronica2 = () => {
    return unirest
    .get("https://www.jh-electronica.com/jh-products.aspx?mode=&per=16&sj=&ej=&keys=")
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
          title: titles[i].replace(/\s+/g, " ").trim(),
          price: prices[i],
          picture: pictures[i],
          link: link[i]
        };
      }

      console.log(Results);
      console.log("Number of products obtained: " + Results.length);
      JHElctronika = Results;

      const toObject = { ...JHElctronika };
      console.log("My Object:", toObject);

      fs.writeFile(
        "./scrapedData.json",
        JSON.stringify(toObject, null, 2),
        (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("file successfully created");
          }
        }
      );

        scrapedDataJHElektronika2.push(JHElctronika);
    });
};
let scrapedData = [];

//scrapeJHElectronica();

//scrapeJHElectronica2();

//scrapeJHElectroPageNumbers(1);
//scrapeJHElectroPageNumbers(2);
/* scrapeGoogleSearch(); */

// fs.writeFile(
//   "./scrapedData.json",
//   JSON.stringify(scrapeJHElectronica, null, 2),
//   (err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log("file successfully created");
//     }
//   }
// );

//Making the API rsquest/respose
app.get("/api", (req, res) => {
  if (scrapedData.length == 0) {
    // Select the variable of use don't use concat
    //Actually, DO use concat, but only if you are trying to combine two arrays and not a function and an array :p
    scrapedData = getAllProducts();
      console.log(scrapedData);
      console.log(scrapedData.length);
      console.log(scrapedData.type);
  }
  res.json(scrapedData);
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
    dateToBeDelivered,
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
