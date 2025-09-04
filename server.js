import express from "express";
import bodyParser from "body-parser";
import { Client, GatewayIntentBits } from "discord.js";
import { sendEmail } from "./src/email.js"; // you’ll make src/email.js
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

// ---- Discord Client ----
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once("ready", () => {
  console.log(`🤖 Discord bot logged in as ${client.user.tag}`);
});

// ---- API Route for Job Requests ----
app.post("/api/request", async (req, res) => {
  try {
    const { name, email, description } = req.body;

    if (!name || !email || !description) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    // ---- TEMPORARY TEST: Send plain text instead of embed/buttons ----
    const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);

    await channel.send(
      `🗑️ New Junk Removal Request\n\n**Name:** ${name}\n**Email:** ${email}\n**Job Description:** ${description}`
    );

    /* 
    // ---- ORIGINAL EMBED + BUTTONS ----
    const embed = new EmbedBuilder()
      .setTitle("🗑️ New Junk Removal Request")
      .addFields(
        { name: "Name", value: name, inline: true },
        { name: "Email", value: email, inline: true },
        { name: "Job Description", value: description }
      )
      .setColor(0x00ffcc)
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`accept_${email}`).setLabel("✅ Accept").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`reject_${email}`).setLabel("❌ Reject").setStyle(ButtonStyle.Danger)
    );

    await channel.send({ embeds: [embed], components: [row] });
    */

    res.json({ ok: true });
  } catch (err) {
    console.error("POST /api/request error", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// ---- Button Handler (Accept/Reject) ----
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const [action, email] = interaction.customId.split("_");

  if (action === "accept") {
    await sendEmail(email, "Job Accepted", "✅ Your junk removal request has been accepted! We’ll contact you shortly.");
    await interaction.reply({ content: `Accepted request for ${email}`, ephemeral: true });
  }

  if (action === "reject") {
    await sendEmail(email, "Job Rejected", "❌ Unfortunately, your junk removal request was not accepted at this time.");
    await interaction.reply({ content: `Rejected request for ${email}`, ephemeral: true });
  }
});

// ---- Start Server ----
const PORT = process.env.PORT || 3000;

async function start() {
  await client.login(process.env.DISCORD_TOKEN);
  app.listen(PORT, () => console.log(`🚚 Web listening on http://localhost:${PORT}`));
}

start().catch((e) => {
  console.error("Failed to start app", e);
  process.exit(1);
});
