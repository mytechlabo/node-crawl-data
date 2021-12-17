const puppeteer = require("puppeteer");

let electronicUrl = "https://nshopvn.com/";
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(electronicUrl);

  let electronicData = await page.evaluate(() => {
    let products = [];
    let product_wrapper = document.querySelectorAll(".product");
    product_wrapper.forEach((product) => {
      let dataJson = {};
      try {
        dataJson.img = product.querySelector(".product-object .image > img").src;
        dataJson.title = product.querySelector(".product-body h2").innerText;
        dataJson.price = product.querySelector(".product-body .price").innerText;
      } catch (err) {
        console.log(err);
      }
      products.push(dataJson);
    });
    return products;
  });

  console.log(electronicData);
  await browser.close();
})();
