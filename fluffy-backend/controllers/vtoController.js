const { Client } = require("@gradio/client");

exports.tryOn = async (req, res) => {
  try {
    const { humanImage, productImage, category } = req.body;

    if (!humanImage || !productImage) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide both humanImage and productImage'
      });
    }

    console.log("Starting Virtual Try-On via Hugging Face Space (fashn-ai/fashn-vton-1.5)...");

    const getBlobFromUrlOrBase64 = async (source) => {
      try {
        const response = await fetch(source);
        return await response.blob();
      } catch (err) {
        console.error("Error fetching image as blob:", err);
        throw new Error("Invalid image source provided.");
      }
    };

    const personBlob = await getBlobFromUrlOrBase64(humanImage);
    const garmentBlob = await getBlobFromUrlOrBase64(productImage);

    
    const client = await Client.connect("fashn-ai/fashn-vton-1.5", { 
      hf_token: process.env.HUGGINGFACE_API_KEY || "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" 
    });

    
    let mappedCategory = 'tops';
    if (category) {
        const catLower = category.toLowerCase();
        if (catLower.includes('bottom') || catLower.includes('pant') || catLower.includes('skirt')) {
            mappedCategory = 'bottoms';
        } else if (catLower.includes('dress') || catLower.includes('one-piece')) {
            mappedCategory = 'one-pieces';
        }
    }

    const result = await client.predict("/try_on", { 
        person_image: personBlob,
        garment_image: garmentBlob,
        category: mappedCategory,
        garment_photo_type: "model",
        num_timesteps: 30,
        guidance_scale: 1.5,
        seed: 42,
        segmentation_free: true
    });

    let resultImage;
    if (result && result.data && result.data.length > 0) {
    
      resultImage = result.data[0].url || result.data[0].path;
    }

    if (!resultImage) {
        throw new Error("Failed to extract image URL from Hugging Face response");
    }

    res.status(200).json({
      status: 'success',
      data: {
        resultImage
      }
    });

  } catch (error) {
    console.error("VTO Error:", error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Something went wrong during virtual try-on'
    });
  }
};