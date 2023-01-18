const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let scrapedData;
const scrapeFunction = async (url) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const productHeading = await page.waitForSelector(".product-meta__title");
    // const [productHeading] = await page.$(
    //   '//*[@id="shopify-section-product-template"]/section/div/div[2]/div/div[2]/div/div[2]/div/h1'
    // );
    const innerTxt = await productHeading.getProperty("textContent");
    const headingTxt = await innerTxt.jsonValue();

    scrapedData = headingTxt;
    browser.close();
  } catch (e) {
    console.error("The scraping was depricated beacuse of", e);
  }
};
console.log(scrapedData);

scrapeFunction(
  "https://ebits.dk/collections/mikrokontrollere/products/arduino-nano-r3"
);

app.get("/api", (req, res) => {
  res.json({ name: "Bill", age: "99", data: scrapedData });
});

app.listen(5000, () => {
  console.log("server started on port 5000");
});
