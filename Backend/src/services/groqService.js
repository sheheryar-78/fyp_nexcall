import fs from "fs";
import path from "path";
import axios from "axios";
import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY?.trim() });

export const transcribeAudio = async (audioUrl) => {
  try {
    // 1. Download Twilio Audio File (Added Twilio Auth to fix 401 error)
    const response = await axios({
      method: "GET",
      url: `${audioUrl}.wav`, // Enforce WAV format
      responseType: "stream",
      auth: {
        username: process.env.TWILIO_ACCOUNT_SID?.trim(),
        password: process.env.TWILIO_AUTH_TOKEN?.trim()
      }
    });

    // Save to temp file
    const tempPath = path.resolve(`temp_audio_${Date.now()}.wav`);
    const writer = fs.createWriteStream(tempPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // 2. Send to Groq Whisper
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model: "whisper-large-v3",
      response_format: "json",
    });

    // Cleanup temp file
    fs.unlinkSync(tempPath);

    return transcription.text;
  } catch (error) {
    console.error("Groq Transcription Error:", error);
    throw error;
  }
};
