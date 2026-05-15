const Replicate = require("replicate");
require('dotenv').config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function run() {
  try {
    const output = await replicate.run(
      "cedoysch/flux-fill-redux-try-on:cf5cb07a25e726fe2fac166a8c5ab52ddccd48657741670fb09d9954d4d8446f",
      {
        input: {
          cloth_type: "upper",
          cloth_image: "https://replicate.delivery/pbxt/MjVInxdHWaHcHcbQcmiEyf7vm9gMwo59uItGH3vYAaK1G1ir/example_jacket.png",
          person_image: "https://replicate.delivery/pbxt/MjVIo8ENgFG5SBbMep5WKSJFakH3AxBX9YDzROldiNVK53VK/model%201.jpg",
          output_format: "png",
          output_quality: 100
        }
      }
    );
    console.log("Success:", output);
  } catch (error) {
    console.error("Error:", error);
  }
}
run();