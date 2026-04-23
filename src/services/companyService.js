import api from './api';

export const companyService = {
  getCompanies: async () => {
    const response = await api.get('/companies');
    return response.data;
  },
  createCompany: async (companyData) => {
    const response = await api.post('/companies', companyData);
    return response.data;
  }
};
