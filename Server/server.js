const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const cors = require("cors");
const spawn = require("child_process").spawn;
var unirest = require("unirest");
const cheerio = require("cheerio");

const app = express();

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
  ];
  var randomNumber = Math.floor(Math.random() * userAgents.length);
  return userAgents[randomNumber];
};

let user_agent = selectRandom();

let scrapedDataGoogle = [];

 const scrapeGoogleSearch = () => {
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
}; 

let scrapedDataJHElektronika = [];
const scrapeAliExpress = () => {
  return unirest
    .get("https://www.jh-electronica.com/")
    .headers({
      UserAgent: `${user_agent}`,
    })
    .then((response) => {
      let $ = cheerio.load(response.body);

      let titles = [];
      let prices = [];
      let pictures = [];

      $(".h-car1-b  .db").each((i, el) => {
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
          price: prices[i],
          picture: pictures[i],
        };
      }

      console.log(Results);
      let JHElctronika = Results;

      scrapedDataJHElektronika.push(JHElctronika);
    });
};
let scrapedData = [];

scrapeAliExpress();
scrapeGoogleSearch();

//Making the API rsquest/respose
app.get("/api", (req, res) => {
    if(scrapedData.length == 0) {
        scrapedData = scrapeGoogleSearch[0].concat(scrapedDataJHElektronika[0]);
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
    dateToBeDelivered
  ]);
  python3.stdout.on("data", function (data) {
    dataToSend = data.toString();
    const formatter = new Intl.NumberFormat("dk-DK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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
