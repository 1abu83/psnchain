// PSNChain API Client
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class PSNChainAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async getHealth() {
    return this.request('/health');
  }

  // API info
  async getInfo() {
    return this.request('/info');
  }

  // Wallet operations
  async createWallet() {
    return this.request('/wallet/create', {
      method: 'POST',
    });
  }

  async getBalance(address) {
    return this.request(`/balance/${address}`);
  }

  // Transaction operations
  async sendTransaction(transactionData) {
    console.log('API: Sending transaction request:', transactionData);
    const result = await this.request('/transaction/send', {
      method: 'POST',
      body: transactionData,
    });
    console.log('API: Transaction response:', result);
    return result;
  }

  async getTransactionHistory(address, limit = 50) {
    return this.request(`/transactions/${address}?limit=${limit}`);
  }

  // Mining
  async mineBlock(minerAddress) {
    return this.request('/mine', {
      method: 'POST',
      body: { minerAddress },
    });
  }

  // Token operations
  async createToken(tokenData) {
    return this.request('/token/create', {
      method: 'POST',
      body: tokenData,
    });
  }

  async getTokens() {
    return this.request('/tokens');
  }

  // AMM/Swap operations
  async swap(swapData) {
    return this.request('/swap', {
      method: 'POST',
      body: swapData,
    });
  }

  async getPools() {
    return this.request('/pools');
  }

  // Blockchain info
  async getBlockchainInfo() {
    return this.request('/blockchain/info');
  }

  async getBlocks(limit = 10, offset = 0) {
    return this.request(`/blockchain/blocks?limit=${limit}&offset=${offset}`);
  }
}

// Create singleton instance
const api = new PSNChainAPI();

export default api;

// Export individual methods for convenience
export const {
  getHealth,
  getInfo,
  createWallet,
  getBalance,
  sendTransaction,
  getTransactionHistory,
  mineBlock,
  createToken,
  getTokens,
  swap,
  getPools,
  getBlockchainInfo,
  getBlocks,
} = api;