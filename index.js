const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");

const app = express();
app.use(cors());

const allowedServices = [
  "whatsapp", "instagram", "facebook", "nubank", "pix", "govbr", "vivo",
  "bradesco", "banco-do-brasil", "caixa-economica-federal", "tim", "openai"
];

app.get("/", (req, res) => {
  res.send("✅ API do Downdetector-Scraper está funcionando!");
});

async function callDowndetector(service) {
  const options = process.env.NODE_ENV === 'test' ? { args: ['--no-sandbox'] } : {};
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36");
  const url = `https://downdetector.com/status/${service}/`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 });
  const content = await page.content();
  await browser.close();
  return content;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});