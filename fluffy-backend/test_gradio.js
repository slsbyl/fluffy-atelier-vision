const { Client } = require("@gradio/client");

async function test() {
  try {
    const client = await Client.connect("fashn-ai/fashn-vton-1.5", { hf_token: "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" });
    console.log("Connected to fashn-ai/fashn-vton-1.5");
  } catch (e) {
    console.error("fashn-ai/fashn-vton-1.5 failed", e);
  }
}
test();