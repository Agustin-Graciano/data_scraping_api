const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const cors = require("cors");
const spawn = require("child_process").spawn;

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

//Data scraping
let scrapedData;
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

const searchScraping = async () => {
  try {
    const browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--headless",
        "--disable-gpu",
        "--window-size=1920x1080",
      ],
    });
    const [page] = await browser.pages();
    await page.setRequestInterception(true);
    page.on("request", (interSeptedRequest) => {
      //Still not sure if it is okay to be "!==" instead of "==="
      interSeptedRequest.resourceType !== "document"
        ? interSeptedRequest.abort()
        : interSeptedRequest.continue();
    });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36"
    );
    await page.goto("https://www.google.com/", { waitUntil: "networkidle2" });
    await page.waitForSelector('input[aria-label="Search"]', { visable: true });
    await page.type('input[aria-label="Search"]', "Ali express");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      page.keyboard.press("Enter"),
    ]);
    await page.waitForSelector(".LC20lb", { visible: true });

    const scrappedResult = await pahe.$$eval(".LC20lb", (els) =>
      els.map((e) => ({ title: e.innerText, link: e.parentNode.href }))
    );
    console.log(scrappedResult);
    scrapedData = scrappedResult;
    browser.close();
  } catch (e) {
    console.error("the search scrape failed due to:", e);
    console.log("the search scrape failed due to", e);
  }
};

searchScraping();

//Making the API rsquest/respose
app.get("/api", (req, res) => {
  res.json({ name: "Bill", age: "99", data: scrapedData });
});

//Connection to python
app.post("/pyth", (req, res, next) => {
  var Price = Number(req.body.Price);
  var OutsideEbits = String(req.body.OutsideEbits);
  var OutsideEU = String(req.body.OutsideEU);
  var Currency = String(req.body.Currency);
  var dataToSend = String();
  console.log(req.body);
  console.log(
    `Received this: ${Price}, ${OutsideEbits}, ${OutsideEU}, ${Currency}`
  );
  const python3 = spawn("python", [
    "Calculator.py",
    Price,
    OutsideEbits,
    OutsideEU,
    Currency,
  ]);
  python3.stdout.on("data", function (data) {
    dataToSend = data.toString();
    const formatter = new Intl.NumberFormat("dk-DK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    dataToSend = formatter.format(dataToSend);
    console.log(`Heres the data, sir: ${dataToSend}`);
  });

  // in close event we are sure that stream from child process is closed
  python3.on("close", (code) => {
    console.log(`child process close all stdio with code ${code}`);
    // send data to browser
    res.end(dataToSend);
  });
});

app.listen(5000, () => {
  console.log("server started on port 5000");
});
