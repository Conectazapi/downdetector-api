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
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
  try {
    await page.goto(`https://downdetector.com.br/fora-do-ar/${service}/`);
    const content = await page.content();
    await browser.close();
    return content;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

app.get("/status/:service", async (req, res) => {
  const { service } = req.params;
  if (!allowedServices.includes(service)) {
    return res.status(400).send({ error: "Serviço não suportado." });
  }
  try {
    const content = await callDowndetector(service);
    res.send(content);
  } catch (err) {
    res.status(500).send("Erro ao acessar o Downdetector.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
