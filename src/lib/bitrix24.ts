const BITRIX_WEBHOOK_URL = import.meta.env.VITE_BITRIX_WEBHOOK_URL || 'https://promobrindes.bitrix24.com.br/rest/1/ipkwbb32nhewia33';

interface Bitrix24Response<T = any> {
  result: T;
  error?: string;
  error_description?: string;
}

export const bitrix24 = {
  async call<T = any>(method: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const response = await fetch(`${BITRIX_WEBHOOK_URL}/${method}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Bitrix24Response<T> = await response.json();
      
      if (data.error) {
        throw new Error(`Bitrix24 Error: ${data.error_description || data.error}`);
      }
      
      return data.result;
    } catch (error) {
      console.error(`Bitrix24 API Error [${method}]:`, error);
      throw error;
    }
  },

  async getContacts(params?: { select?: string[]; filter?: Record<string, any> }) {
    return this.call('crm.contact.list', params);
  },

  async getDeals(params?: { select?: string[]; filter?: Record<string, any> }) {
    return this.call('crm.deal.list', params);
  },

  async getProducts(params?: { select?: string[]; filter?: Record<string, any> }) {
    return this.call('crm.product.list', params);
  },

  async createDeal(fields: Record<string, any>) {
    return this.call('crm.deal.add', { fields });
  },

  async updateDeal(id: string, fields: Record<string, any>) {
    return this.call('crm.deal.update', { id, fields });
  },

  async getSPAItems(entityTypeId: number, params?: { select?: string[]; filter?: Record<string, any> }) {
    return this.call('crm.item.list', { entityTypeId, ...params });
  },
};
