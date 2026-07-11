import Settings from '../models/settingsModel.js';

export const getShippingRates = async (req, res) => {
  try {
    const settings = await Settings.findOne({ type: 'shipping' });
    res.json({ status: 'success', data: { rates: settings ? settings.rates : {} } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error fetching shipping rates' });
  }
};

export const updateShippingRates = async (req, res) => {
  try {
    const { rates } = req.body;
    const settings = await Settings.findOneAndUpdate(
      { type: 'shipping' },
      { rates },
      { new: true, upsert: true }
    );
    res.json({ status: 'success', data: { rates: settings.rates } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error updating shipping rates' });
  }
};