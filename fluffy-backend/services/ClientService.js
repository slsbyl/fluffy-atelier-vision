class ClientService {
  constructor(clientModel) {
    this.clientModel = clientModel;
  }

  async createClient(data) {
    const { companyName, contactPerson, phone, email, address } = data;
    if (!companyName || !contactPerson) {
      throw new Error('Missing required fields');
    }
    return await this.clientModel.create({
      companyName, contactPerson, phone, email, address, totalOrders: 0, balance: 0
    });
  }

  async getAllClients() {
    return await this.clientModel.find().sort({ createdAt: -1 });
  }

  async getClientById(id) {
    const client = await this.clientModel.findById(id);
    if (!client) throw new Error('Factory client not found');
    return client;
  }

  async updateClient(id, data) {
    const client = await this.clientModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!client) throw new Error('Factory client not found');
    return client;
  }

  async deleteClient(id) {
    const client = await this.clientModel.findByIdAndDelete(id);
    if (!client) throw new Error('Factory client not found');
    return client;
  }
}

module.exports = ClientService;
