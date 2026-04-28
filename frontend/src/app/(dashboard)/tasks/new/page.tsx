'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { attachmentsApi } from '../../../../features/attachments/api/attachments.api';
import { useCategoriesQuery } from '../../../../features/categories/hooks/use-categories-query';
import { TaskForm } from '../../../../features/tasks/components/TaskForm';
import { useCreateTaskMutation } from '../../../../features/tasks/hooks/use-create-task-mutation';
import { getApiErrorMessage } from '../../../../lib/api-client';

/**
 * Yeni talep olusturma sayfasi.
 */
export default function NewTaskPage() {
  const router = useRouter();
  const categoriesQuery = useCategoriesQuery();
  const createTaskMutation = useCreateTaskMutation();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Yeni Talep</h1>
          <p className="mt-1 text-sm text-slate-600">Kategori, oncelik ve aciklama ile yeni talep olustur.</p>
        </div>
        <Link href="/tasks" className="text-sm font-semibold text-brand-700 hover:underline">
          Listeye don
        </Link>
      </div>

      {categoriesQuery.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {getApiErrorMessage(categoriesQuery.error)}
        </div>
      ) : null}

      {createTaskMutation.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {getApiErrorMessage(createTaskMutation.error)}
        </div>
      ) : null}

      {uploadError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{uploadError}</div>
      ) : null}

      {categoriesQuery.isLoading ? (
        <p className="text-sm text-slate-500">Kategoriler yukleniyor...</p>
      ) : (
        <TaskForm
          categories={categoriesQuery.data ?? []}
          isSubmitting={createTaskMutation.isPending || isUploadingFiles}
          onSubmit={async (payload, files) => {
            setUploadError(null);
            try {
              const createdTask = await createTaskMutation.mutateAsync(payload);

              if (files.length) {
                try {
                  setIsUploadingFiles(true);
                  await attachmentsApi.uploadToTask(createdTask.id, files);
                } catch (error) {
                  setUploadError(getApiErrorMessage(error));
                  return;
                } finally {
                  setIsUploadingFiles(false);
                }
              }

              router.push(`/tasks/${createdTask.id}`);
            } catch {
              // createTaskMutation.isError blokunda gosterilecek.
            }
          }}
        />
      )}
    </section>
  );
}
