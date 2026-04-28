import type { Attachment } from '@prisma/client';

export interface AttachmentView extends Omit<Attachment, 'createdAt'> {
  createdAt: string;
}

export interface UploadFilesResult {
  created: AttachmentView[];
}
