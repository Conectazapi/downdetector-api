const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");

const app = express();
app.use(cors());

// Lista de serviços suportados
const allowedServices = [
  "whatsapp", "instagram", "facebook", "nubank", "pix", "govbr", "vivo",
  "bradesco", "banco-do-brasil", "caixa-economica-federal", "tim", "openai"
];

// Rota de status simples
app.get("/", (req, res) => {
  res.send("✅ API do Downdetector-Scraper está funcionando!");
});

// Scraper usando Puppeteer
async function callDowndetector(service) {
  const options = process.env.NODE_ENV === 'test' ? { args: ['--no-sandbox'] } : {};
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
  const url = `https://downdetector.com.br/fora-do-ar/${service}/`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

  const html = await page.content();
  await browser.close();

  let status = "up";
  let title = "✅ Nenhuma instabilidade detectada";

  if (html.includes("Problemas em") || html.includes("sem informar o motivo")) {
    status = "down";
    title = `🔴 Instabilidade detectada em ${service}`;
  } else if (html.includes("relatos de problemas")) {
    status = "warn";
    title = `⚠️ Relatos de possíveis falhas no ${service}`;
  }

  return { service, status, title };
}

// Rota da API principal
app.get("/api/service/:name", async (req, res) => {
  const name = req.params.name.toLowerCase();

  if (!allowedServices.includes(name)) {
    return res.status(400).json({ error: "Serviço não monitorado" });
  }

  try {
    const result = await callDowndetector(name);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Erro ao acessar Downdetector", detalhes: err.message });
  }
});

// Porta para Railway
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("✅ API online na porta " + port);
});
