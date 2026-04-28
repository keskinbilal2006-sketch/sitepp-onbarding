import { mkdirSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

import multer from 'multer';

import { env } from '../config/env.js';

export interface StoredFile {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  absolutePath: string;
}

export interface StorageService {
  saveUploadedFile(file: Express.Multer.File): Promise<StoredFile>;
  deleteFile(fileName: string): Promise<void>;
  getAbsolutePath(fileName: string): string;
}

// Upload klasoru uygulama acilirken garanti olsun diye olusturulur.
const uploadRoot = resolve(process.cwd(), env.UPLOAD_DIR);
mkdirSync(uploadRoot, { recursive: true });

const diskStorage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadRoot);
  },
  filename: (_req, file, callback) => {
    // Orijinal isim yerine UUID kullanmak cakisma ve guvenlik risklerini azaltir.
    const extension = extname(file.originalname);
    callback(null, `${randomUUID()}${extension}`);
  },
});

// MVP icin local disk yeterli; ileride S3/MinIO implementasyonu ayni interface'e takilir.
export const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 3,
  },
});

class LocalStorageService implements StorageService {
  constructor(private readonly baseDir: string) {}

  async saveUploadedFile(file: Express.Multer.File): Promise<StoredFile> {
    // Multer dosyayi zaten diske yazdigi icin burada metadata donuyoruz.
    return {
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      absolutePath: file.path,
    };
  }

  async deleteFile(fileName: string): Promise<void> {
    const absolutePath = this.getAbsolutePath(fileName);
    await rm(absolutePath, { force: true });
  }

  getAbsolutePath(fileName: string): string {
    return resolve(this.baseDir, fileName);
  }
}

export const storageService = new LocalStorageService(uploadRoot);
