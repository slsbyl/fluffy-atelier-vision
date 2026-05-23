const { Client } = require("@gradio/client");

async function testTryOn() {
  try {
    const client = await Client.connect("yisol/IDM-VTON", { hf_token: "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" });
    console.log("Connected to yisol/IDM-VTON");
    
    const personUrl = "https://replicate.delivery/pbxt/MjVIo8ENgFG5SBbMep5WKSJFakH3AxBX9YDzROldiNVK53VK/model%201.jpg";
    const garmentUrl = "https://replicate.delivery/pbxt/MjVInxdHWaHcHcbQcmiEyf7vm9gMwo59uItGH3vYAaK1G1ir/example_jacket.png";

  
    const personRes = await fetch(personUrl);
    const personBlob = await personRes.blob();
    const garmentRes = await fetch(garmentUrl);
    const garmentBlob = await garmentRes.blob();

    console.log("Images fetched, starting predict...");

    const result = await client.predict("/tryon", { 
        dict: {
            background: personBlob,
            layers: [],
            composite: null
        }, 
        garm_img: garmentBlob, 
        garment_des: "A nice jacket", 
        is_checked: true, 
        is_checked_crop: false, 
        denoise_steps: 30, 
        seed: 42, 
    });

    console.log(result.data);
  } catch (e) {
    console.error("yisol/IDM-VTON failed", e);
  }
}
testTryOn();