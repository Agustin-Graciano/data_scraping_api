const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const cors = require('cors');
const spawn = require('child_process').spawn;

const app = express();

app.use(cors({
    origin: '*'
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());


let scrapedData;
const scrapeFunction = async (url) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const productHeading = await page.waitForSelector('.product-meta__title');
    /*
    const [productHeading] = await page.$(
      '//*[@id="shopify-section-product-template"]/section/div/div[1]/div/div[1]/div/div[1]/div/h1'
    );
    */

    const innerTxt = await productHeading.getProperty("textContent");
    
    const headingTxt = await innerTxt.jsonValue();
    scrapedData = headingTxt;

    browser.close();
  } catch (e) {
    console.error("The scraping was deprecated because of", e);
  }
};
console.log(scrapedData);

scrapeFunction(
  "https://ebits.dk/collections/mikrokontrollere/products/arduino-nano-r3"
);

app.get("/api", (req, res) => {
    res.json({ name: "Bill", age: "99", data: scrapedData });
});

app.post("/pyth", (req, res, next) => {
  var Price = Number(req.body.Price);
  var OutsideEbits = String(req.body.OutsideEbits);
  var OutsideEU = String(req.body.OutsideEU);
  var Currency = String(req.body.Currency);
  var dataToSend = String();
  console.log(req.body);
  console.log(`Received this: ${Price}, ${OutsideEbits}, ${OutsideEU}, ${Currency}`);
  const python3 = spawn('python', ['Calculator.py', Price, OutsideEbits, OutsideEU, Currency]);
    python3.stdout.on('data', function (data) {
        dataToSend = data.toString();
        const formatter = new Intl.NumberFormat('dk-DK',
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        dataToSend = formatter.format(dataToSend);
        console.log(`Heres the data, sir: ${dataToSend}`);
        }
    );

    // in close event we are sure that stream from child process is closed
    python3.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        // send data to browser
        res.end(dataToSend);
    });
})

app.listen(5000, () => {
  console.log("server started on port 5000");
});
