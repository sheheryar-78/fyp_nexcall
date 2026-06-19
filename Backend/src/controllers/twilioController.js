/* export const handleIncomingCall = async (req, res) => {
  try {
    res.set("Content-Type", "text/xml");

    res.send(`
      <Response>
        <Say voice="alice">
          Hello! Your AI agent is now active.
        </Say>
      </Response>
    `);
    console.log("📞 Twilio hit ho raha hai");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
}; */

/* export const handleIncomingCall = (req, res) => {
  console.log("📞 Twilio CALL HIT");

  res.writeHead(200, { "Content-Type": "text/xml" });

  res.end(`
    <?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say voice="alice">Hello Ahmad! Your AI agent is working now.</Say>
      <Pause length="1"/>
      <Say>Thank you for calling.</Say>
    </Response>
  `);
}; */

/* export const handleIncomingCall = async (req, res) => {
  try {
    console.log("🔥 TWILIO HIT SUCCESS");

    res.set("Content-Type", "text/xml");

    res.send(`
      <Response>
        <Say voice="alice">
          Hello Ahmad! Your AI agent is working perfectly.
        </Say>
      </Response>
    `);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
}; */

import twilio from "twilio";
import { transcribeAudio } from "../services/groqService.js";
import { generateRAGResponse } from "../services/searchService.js";
import Agent from "../models/Agent.js";
import Call from "../models/Call.js";

const getTwilioClient = () => {
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
};

export const getConfig = (req, res) => {
  res.json({ twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER });
};

// Helper to escape special characters for Twilio XML
const escapeXml = (unsafeStr) => {
  if (!unsafeStr) return "";
  return unsafeStr.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
    }
  });
};

export const handleIncomingCall = async (req, res) => {
  try {
    const callerNumber = req.body.From || "Unknown Caller";
    const twilioNumber = req.body.To;
    const callSid = req.body.CallSid;
    // 🔹 Find Agent & Save Call Log
    // Since this is a single Twilio number environment, always prioritize the MOST RECENTLY UPDATED agent.
    // This ensures if the user just toggled an agent to active/inactive, that exact agent is used.
    let agent = await Agent.findOne().sort({ updatedAt: -1 });

    // DEBUG LOG TO FILE
    import("fs").then(fs => {
      fs.writeFileSync("twilio_debug.txt", JSON.stringify({
        twilioNumber,
        callerNumber,
        agentFound: agent ? agent.name : "None",
        agentUserId: agent ? agent.userId : "None"
      }, null, 2));
    });

    if (agent) {
      // 🔥 NEW: Check if agent is inactive
      if (agent.status === "inactive") {
        console.log(`Call rejected: Agent ${agent.name} is INACTIVE.`);
        
        // Save the call as missed/failed
        const missedCall = new Call({
          userId: agent.userId,
          callSid: callSid,
          caller: callerNumber,
          agent: agent.name,
          duration: "0s",
          status: "missed", 
          summary: "Call rejected because agent was inactive."
        });
        await missedCall.save();

        const VoiceResponse = twilio.twiml.VoiceResponse;
        const twiml = new VoiceResponse();
        twiml.say({ voice: "Polly.Joanna-Neural" }, "Sorry, the AI agent you are trying to reach is currently inactive. Please try again later.");
        twiml.hangup();
        
        res.type("text/xml");
        return res.send(twiml.toString());
      }

      const newCall = new Call({
        userId: agent.userId,
        callSid: callSid,
        caller: callerNumber,
        agent: agent.name,
        duration: "0s", // Start at 0s, will dynamically update during the call
        status: "in-progress", // 🔥 CHANGED from completed to in-progress
      });
      await newCall.save();
      console.log("Call successfully saved to database for Agent:", agent.name);
    } else {
      console.log("CRITICAL: No Agents exist in the database at all!");
    }

    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();

    twiml.say({ voice: "Polly.Joanna-Neural" }, "Welcome to NexCall AI. How can I help you?");
    twiml.record({
      action: "/api/twilio/process-audio",
      maxLength: 15,
      playBeep: true,
      trim: "trim-silence"
    });

    res.type("text/xml");
    res.send(twiml.toString());
  } catch (err) {
    console.error("Incoming Call Error:", err);
    res.type("text/xml").send("<Response><Say>Sorry, an error occurred.</Say></Response>");
  }
};

export const processAudio = async (req, res) => {
  const callSid = req.body.CallSid;
  const recordingUrl = req.body.RecordingUrl;
  const VoiceResponse = twilio.twiml.VoiceResponse;

  if (!recordingUrl || !callSid) {
    const twiml = new VoiceResponse();
    twiml.say({ voice: "Polly.Joanna-Neural" }, "I didn't hear anything. Let's try again.");
    twiml.record({ action: "/api/twilio/process-audio", maxLength: 10 });
    return res.type("text/xml").send(twiml.toString());
  }

  // 1. QUICK SYNCHRONOUS TRANSCRIPTION
  let userText = "";
  try {
    userText = await transcribeAudio(recordingUrl);
    console.log("User said:", userText);
  } catch (err) {
    console.error("Transcription Error:", err);
  }

  const lowerText = userText ? userText.toLowerCase() : "";
  const isBye = lowerText.match(/\b(bye|goodbye|allah hafiz|khuda hafiz|see you later)\b/i) !== null;

  // If user says bye, hang up IMMEDIATELY without filler words
  if (isBye) {
    console.log("User said bye. Hanging up immediately.");
    const twiml = new VoiceResponse();
    twiml.hangup();
    
    // Save transcript asynchronously
    (async () => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await Call.findOneAndUpdate(
        { callSid: callSid },
        {
          $push: {
            transcript: { speaker: "customer", message: userText, timestamp }
          }
        }
      ).catch(err => console.error("Failed to update DB:", err));
    })();

    return res.type("text/xml").send(twiml.toString());
  }

  // 2. FOR NORMAL QUERIES: INSTANT FILLER WORD TO PREVENT TIMEOUT
  const initialTwiml = new VoiceResponse();
  initialTwiml.say({ voice: "Polly.Joanna-Neural" }, "Let me quickly check that for you.");
  initialTwiml.pause({ length: 60 }); // Keep call active while APIs process

  res.type("text/xml");
  res.send(initialTwiml.toString());

  // 3. PROCESS RAG IN BACKGROUND (Asynchronous)
  (async () => {
    try {
      let aiResponse = "";
      if (!userText || userText.trim().length === 0) {
        aiResponse = "I didn't catch that. Could you please repeat?";
      } else {
        // Query RAG System (Slow part)
        const agent = await Agent.findOne().sort({ updatedAt: -1 });
        aiResponse = await generateRAGResponse(userText, agent);
        console.log("AI Response:", aiResponse);
      }

      // UPDATE THE LIVE CALL VIA REST API
      const client = getTwilioClient();
      const updatedTwiml = new VoiceResponse();
      
      updatedTwiml.say({ voice: "Polly.Joanna-Neural" }, aiResponse);
      
      const actionUrl = `${process.env.BASE_URL}/api/twilio/process-audio`;
      updatedTwiml.record({
        action: actionUrl,
        maxLength: 15,
        playBeep: true,
        trim: "trim-silence"
      });

      await client.calls(callSid).update({
        twiml: updatedTwiml.toString()
      });
      console.log("Call successfully updated with AI response!");

      // Save to DB and Update Real Duration
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const existingCall = await Call.findOne({ callSid: callSid });
      let dynamicDuration = "0s";
      
      if (existingCall && existingCall.createdAt) {
        const seconds = Math.floor((Date.now() - existingCall.createdAt.getTime()) / 1000);
        dynamicDuration = `${seconds}s`;
      }

      await Call.findOneAndUpdate(
        { callSid: callSid },
        {
          duration: dynamicDuration,
          $push: {
            transcript: {
              $each: [
                { speaker: "customer", message: userText || "(silence)", timestamp },
                { speaker: "agent", message: aiResponse, timestamp }
              ]
            }
          }
        },
        { new: true }
      ).catch(err => console.error("Failed to update DB:", err));

    } catch (error) {
      console.error("Audio Process Error:", error);
      try {
        const client = getTwilioClient();
        const errorTwiml = new VoiceResponse();
        errorTwiml.say({ voice: "Polly.Joanna-Neural" }, "Sorry, I encountered an internal error.");
        
        const actionUrl = `${process.env.BASE_URL}/api/twilio/process-audio`;
        errorTwiml.record({ action: actionUrl, maxLength: 10 });
        
        await client.calls(callSid).update({ twiml: errorTwiml.toString() });
      } catch (updateError) {
        console.error("Failed to play error message:", updateError);
      }
    }
  })();
};

// 🔥 NEW: Handle Twilio Status Callback
export const handleCallStatus = async (req, res) => {
  try {
    const callSid = req.body.CallSid;
    const callStatus = req.body.CallStatus; // "completed", "failed", "busy", "no-answer", "canceled"
    const callDuration = req.body.CallDuration; // in seconds

    if (callSid) {
      const updateData = { status: callStatus };
      if (callDuration) {
        updateData.duration = `${callDuration}s`;
      }
      
      await Call.findOneAndUpdate({ callSid: callSid }, updateData);
      console.log(`Call ${callSid} status updated to ${callStatus} (Duration: ${callDuration}s)`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Error in handleCallStatus:", err);
    res.sendStatus(500);
  }
};