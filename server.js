import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// omogućava Renderu da pronađe tvoju frontend datoteku (index.html)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// API endpoint za chat
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await fetch(
      "https://api.githubcopilot.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2023-07-01",
        },
        body: JSON.stringify({
          model: "microsoft/Phi-3-mini-4k-instruct",
          messages: [
            { role: "system", content: "Ti si Ćirilko, učitelj ćirilice." },
            ...messages,
          ],
          max_tokens: 500,
        }),
      }
    );

const data = await response.json();
console.log("GitHub API odgovor:", data); // 👈 dodaj ovaj redak

if (data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
  res.json({ reply: data.choices[0].message.content });
} else if (data.message) {
  res.json({ reply: "Greška: " + data.message });
} else {
  res.json({ reply: "Nema odgovora 😢" });
}
  } catch (err) {
    console.error("Greška:", err);
    res.status(500).json({ error: "Došlo je do pogreške na serveru." });
  }
});

// pokretanje servera
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server pokrenut na portu ${PORT}`));
