const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");

const app = express();
app.use(cors());

// Lista de serviços
const allowedServices = [
  "whatsapp", "instagram", "facebook", "nubank", "pix", "govbr", "vivo",
  "bradesco", "banco-do-brasil", "caixa-economica-federal", "tim", "openai"
];

// Status simples
app.get("/", (req, res) => {
  res.send("✅ API do Downdetector-Scraper está funcionando!");
});

// Função principal de scraping
async function callDowndetector(service) {
  const options = process.env.NODE_ENV === "test" ? { args: ['--no-sandbox'] } : {};
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();

  const url = `https://downdetector.com.br/fora-do-ar/${service}/`;
  await page.goto(url, { waitUntil: 'networkidle2' });

  const content = await page.content();
  await browser.close();
  return content.includes("picos de reclamações") ? "instabilidade" : "ok";
}

// Endpoint para checar serviço
app.get("/check/:service", async (req, res) => {
  const service = req.params.service.toLowerCase();
  if (!allowedServices.includes(service)) {
    return res.status(400).send("❌ Serviço não suportado.");
  }
  try {
    const status = await callDowndetector(service);
    res.send(`🔎 ${service.toUpperCase()}: ${status}`);
  } catch (err) {
    res.status(500).send("⚠️ Erro ao acessar o Downdetector.");
  }
});

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Rodando na porta ${PORT}`));