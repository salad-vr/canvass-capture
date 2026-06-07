export type ExtractedRow = {
  name: string;
  address: string;
  contact: string;
  support_level: number | null;
  sign: boolean;
};

const systemPrompt = `You extract handwritten canvassing walk sheets. The sheet has columns: Name, Address/Unit, Email/Number, Support level (1-5), Sign (y/n). Return ONLY a JSON object with a "rows" array. Each row in the sheet becomes one record. Empty rows must be skipped. Support level must be an integer 1-5 or null if blank. Sign is true for y/yes/check, false otherwise.`;

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function extractWalkSheet(imageUrl: string): Promise<{ rows: ExtractedRow[] }> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error(
      "VITE_GEMINI_API_KEY is not set. Add it to your environment variables to enable AI extraction.",
    );
  }

  // Fetch image from Supabase signed URL and convert to base64
  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) throw new Error("Failed to fetch image from storage");
  const imageBlob = await imageRes.blob();
  const base64Image = await blobToBase64(imageBlob);
  const mimeType = imageBlob.type || "image/jpeg";

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [
              { text: "Extract every voter row from this walk sheet." },
              {
                inlineData: {
                  mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              rows: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    address: { type: "string" },
                    contact: { type: "string" },
                    support_level: { type: "integer" },
                    sign: { type: "boolean" },
                  },
                  required: ["name", "address", "contact", "support_level", "sign"],
                },
              },
            },
            required: ["rows"],
          },
        },
      }),
    },
  );

  if (res.status === 429) throw new Error("Rate limit reached. Try again in a moment.");
  if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("AI did not return structured rows");

  const parsed = JSON.parse(text);
  return { rows: parsed.rows as ExtractedRow[] };
}
