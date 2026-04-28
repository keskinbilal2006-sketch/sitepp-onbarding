import { apiClient } from '../../../lib/api-client';

export interface Category {
  id: string;
  name: string;
  slaHours: number;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export const categoriesApi = {
  async list(): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>('/categories');
    return data;
  },
};
