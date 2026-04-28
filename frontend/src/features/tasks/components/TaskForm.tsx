'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { formatFileSize } from '../../../lib/files';
import type { Category } from '../../categories/api/categories.api';
import type { CreateTaskPayload, TaskPriority } from '../api/tasks.api';

const taskFormSchema = z.object({
  categoryId: z.string().uuid('Kategori secimi zorunlu.'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  description: z.string().min(10, 'Aciklama en az 10 karakter olmali.').max(2000),
  apartmentNo: z.string().max(30).optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const priorityOptions: Array<{ value: TaskPriority; label: string }> = [
  { value: 'LOW', label: 'Dusuk' },
  { value: 'MEDIUM', label: 'Orta' },
  { value: 'HIGH', label: 'Yuksek' },
  { value: 'URGENT', label: 'Acil' },
];

interface TaskFormProps {
  categories: Category[];
  isSubmitting: boolean;
  submitLabel?: string;
  initialValues?: Partial<TaskFormValues>;
  onSubmit: (payload: CreateTaskPayload, files: File[]) => Promise<void> | void;
}

/**
 * Yeni task formu.
 * Task kaydi ve opsiyonel dosya secimi birlikte toplanir.
 */
export function TaskForm({
  categories,
  isSubmitting,
  submitLabel = 'Talebi Olustur',
  initialValues,
  onSubmit,
}: TaskFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitLocked, setSubmitLocked] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      categoryId: initialValues?.categoryId ?? '',
      priority: initialValues?.priority ?? 'MEDIUM',
      description: initialValues?.description ?? '',
      apartmentNo: initialValues?.apartmentNo ?? '',
    },
  });

  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length > 3) {
      setFileError('En fazla 3 dosya secilebilir.');
      setSelectedFiles(files.slice(0, 3));
      return;
    }

    const hasTooLargeFile = files.some((file) => file.size > 5 * 1024 * 1024);
    if (hasTooLargeFile) {
      setFileError('Her dosya en fazla 5MB olabilir.');
      setSelectedFiles(files);
      return;
    }

    setFileError(null);
    setSelectedFiles(files);
  };

  const submitHandler = async (values: TaskFormValues) => {
    if (submitLocked || isSubmitting) {
      return;
    }

    if (fileError) {
      return;
    }

    setSubmitLocked(true);
    try {
      await onSubmit(
        {
          categoryId: values.categoryId,
          priority: values.priority,
          description: values.description,
          apartmentNo: values.apartmentNo?.trim() || undefined,
        },
        selectedFiles
      );
    } finally {
      setSubmitLocked(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submitHandler)}>
      <label className="block">
        <span className="mb-1 block text-sm text-slate-700">Kategori</span>
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none ring-brand-500 focus:ring-2"
          {...register('categoryId')}
        >
          <option value="">Kategori sec</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name} ({category.slaHours} saat SLA)
            </option>
          ))}
        </select>
        {errors.categoryId ? (
          <span className="mt-1 block text-xs text-red-600">{errors.categoryId.message}</span>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-slate-700">Oncelik</span>
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none ring-brand-500 focus:ring-2"
          {...register('priority')}
        >
          {priorityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.priority ? <span className="mt-1 block text-xs text-red-600">{errors.priority.message}</span> : null}
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-slate-700">Aciklama</span>
        <textarea
          rows={5}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring-2"
          placeholder="Sorunu detayli acikla..."
          {...register('description')}
        />
        {errors.description ? (
          <span className="mt-1 block text-xs text-red-600">{errors.description.message}</span>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-slate-700">Daire No (opsiyonel)</span>
        <input
          type="text"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring-2"
          placeholder="A-12"
          {...register('apartmentNo')}
        />
        {errors.apartmentNo ? (
          <span className="mt-1 block text-xs text-red-600">{errors.apartmentNo.message}</span>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-slate-700">Fotograflar (0-3 adet, her biri max 5MB)</span>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFilesChange}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        />
      </label>

      {fileError ? <p className="text-sm text-red-600">{fileError}</p> : null}

      {selectedFiles.length ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
          <p className="text-sm font-medium text-slate-700">Secilen dosyalar:</p>
          <ul className="mt-1 space-y-1 text-xs text-slate-600">
            {selectedFiles.map((file) => (
              <li key={`${file.name}-${file.size}`}>
                {file.name} ({formatFileSize(file.size)})
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || submitLocked}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70"
      >
        {isSubmitting || submitLocked ? 'Kaydediliyor...' : submitLabel}
      </button>
    </form>
  );
}
