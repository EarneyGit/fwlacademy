import { GoogleGenAI } from "@google/genai";

try {
  console.log("Initializing with empty string...");
  const ai = new GoogleGenAI({ apiKey: "" });
  console.log("Initialized successfully!");
} catch (e) {
  console.error("Caught error:", e.message);
}

try {
  console.log("Initializing with undefined...");
  const ai = new GoogleGenAI({ apiKey: undefined });
  console.log("Initialized successfully!");
} catch (e) {
  console.error("Caught error:", e.message);
}
