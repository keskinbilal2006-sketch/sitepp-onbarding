import { apiClient } from '../../../lib/api-client';

export interface AttachmentItem {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: string;
  taskId: string | null;
  commentId: string | null;
  uploadedById: string;
}

interface UploadResponse {
  created: AttachmentItem[];
}

function toFormData(files: File[]): FormData {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }
  return formData;
}

export const attachmentsApi = {
  async uploadToTask(taskId: string, files: File[]): Promise<UploadResponse> {
    const { data } = await apiClient.post<UploadResponse>(`/attachments/task/${taskId}`, toFormData(files));
    return data;
  },

  async uploadToComment(commentId: string, files: File[]): Promise<UploadResponse> {
    const { data } = await apiClient.post<UploadResponse>(
      `/attachments/comment/${commentId}`,
      toFormData(files)
    );
    return data;
  },
};
