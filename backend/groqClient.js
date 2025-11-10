

/**
 * Invoke Groq via an OpenAI-compatible chat completions endpoint.
 * Expects:
 *  - GROQ_API_URL (e.g. https://api.groq.com/openai/v1/chat/completions)
 *  - GROQ_API_KEY
 *  - GROQ_MODEL
 *
 * Body sent: { model, messages }
 */

import fetch from "node-fetch";

export async function invokeGroq(messages) {
  const url = process.env.GROQ_API_URL;
  const key = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL;

  if (!url || !key || !model) {
    throw new Error("GROQ_API_URL, GROQ_API_KEY, and GROQ_MODEL must be set in env");
  }

  const body = { model, messages };

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await resp.text();
  console.log("RAW GROQ RESPONSE:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`Groq response parse error: ${text}`);
  }

  if (!resp.ok) {
    throw new Error(`Groq API error: ${resp.status} ${JSON.stringify(data)}`);
  }

  // Extract assistant reply
  let assistantContent = "";
  if (data.choices?.[0]?.message?.content) {
    assistantContent = data.choices[0].message.content;
  } else if (data.choices?.[0]?.delta?.content) {
    assistantContent = data.choices[0].delta.content;
  } else if (data.output) {
    assistantContent = data.output;
  } else {
    assistantContent = JSON.stringify(data);
  }

  return assistantContent;
}
