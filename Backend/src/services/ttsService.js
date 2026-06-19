import { EdgeTTS } from "node-edge-tts";
import fs from "fs";
import path from "path";

export const generateSpeech = async (text) => {
  try {
    const tts = new EdgeTTS({
      voice: "en-US-AriaNeural", 
      lang: "en-US",
      outputFormat: "audio-24khz-48kbitrate-mono-mp3"
    });

    // Create public/audio folder if it doesn't exist
    const outputDir = path.resolve("public", "audio");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Give a unique filename
    const fileName = `response_${Date.now()}.mp3`;
    const outputPath = path.join(outputDir, fileName);

    await tts.ttsPromise(text, outputPath);
    
    // Return relative path so Twilio can fetch it via BASE_URL
    return `/audio/${fileName}`;
  } catch (error) {
    console.error("TTS Generation Error:", error);
    throw error;
  }
};
