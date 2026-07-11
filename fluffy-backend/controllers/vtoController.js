import { Client } from '@gradio/client';

export const tryOn = async (req, res) => {
  try {
    const { humanImage, productImage, category } = req.body;
    if (!humanImage || !productImage) {
      return res.status(400).json({ status: 'error', message: 'Human image and product image are required' });
    }

    const getBlobFromBase64 = (base64) => {
        const base64Data = base64.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        return new Blob([buffer]);
    };

    const humanBlob = getBlobFromBase64(humanImage);
    const productBlob = getBlobFromBase64(productImage);

    const client = await Client.connect("fashn-ai/fashn-vton-1.5", { hf_token: process.env.HUGGINGFACE_API_KEY });
    
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
      person_image: humanBlob,
      garment_image: productBlob,
      category: mappedCategory,
      garment_photo_type: "model",
      num_timesteps: 30,
      guidance_scale: 1.5,
      seed: 42,
      segmentation_free: true
    });

    const imageUrl = result.data[0]?.url || result.data[0];
    res.json({ status: 'success', data: { resultImage: imageUrl } });
  } catch (error) {
    console.error('VTO Error:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Error during virtual try-on' });
  }
};
