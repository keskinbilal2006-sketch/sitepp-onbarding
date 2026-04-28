'use client';

import { useParams } from 'next/navigation';
import { useState, type ChangeEvent } from 'react';

import { attachmentsApi } from '../../../../features/attachments/api/attachments.api';
import { useMeQuery } from '../../../../features/auth/hooks/use-me-query';
import { useCreateCommentMutation } from '../../../../features/comments/hooks/use-create-comment-mutation';
import { StatusTimeline } from '../../../../features/tasks/components/StatusTimeline';
import { TaskStepper } from '../../../../features/tasks/components/TaskStepper';
import type { TaskStatus } from '../../../../features/tasks/api/tasks.api';
import { useTaskDetailQuery } from '../../../../features/tasks/hooks/use-task-detail-query';
import { useUpdateTaskStatusMutation } from '../../../../features/tasks/hooks/use-update-task-status-mutation';
import { getAllowedNextStatuses } from '../../../../features/tasks/lib/status-transition';
import { getApiErrorMessage } from '../../../../lib/api-client';
import { buildUploadUrl, formatFileSize } from '../../../../lib/files';
import { formatDateTime, priorityLabel, statusLabel } from '../../../../lib/format';

/**
 * Talep detay ekrani:
 * - Stepper
 * - Timeline
 * - Temel task bilgileri
 */
export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const taskId = params?.id ?? '';
  const meQuery = useMeQuery();
  const taskQuery = useTaskDetailQuery(taskId);
  const updateStatusMutation = useUpdateTaskStatusMutation(taskId);
  const createCommentMutation = useCreateCommentMutation(taskId);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [newCommentBody, setNewCommentBody] = useState('');
  const [newCommentFiles, setNewCommentFiles] = useState<File[]>([]);
  const [commentFileError, setCommentFileError] = useState<string | null>(null);
  const [commentUploadError, setCommentUploadError] = useState<string | null>(null);
  const [uploadingCommentFiles, setUploadingCommentFiles] = useState(false);

  if (taskQuery.isLoading) {
    return <p className="text-sm text-slate-500">Talep yukleniyor...</p>;
  }

  if (taskQuery.isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {getApiErrorMessage(taskQuery.error)}
      </div>
    );
  }

  if (!taskQuery.data) {
    return <p className="text-sm text-slate-500">Talep bulunamadi.</p>;
  }

  const task = taskQuery.data;
  const me = meQuery.data;
  const allowedStatuses = me
    ? getAllowedNextStatuses({
        role: me.role,
        userId: me.id,
        task,
      })
    : [];
  const actionUnavailableMessage =
    task.status === 'CANCELLED'
      ? 'Bu talep iptal edilmis; iptal edilen taleplerde durum tekrar degistirilemez.'
      : task.status === 'CLOSED'
        ? 'Bu talep kapanmis; sadece uygun roldeki kullanicilar tekrar acabilir.'
        : 'Bu talep icin su anda durum degistirme yetkin yok.';

  const handleUpdateStatus = () => {
    if (!selectedStatus) {
      return;
    }

    updateStatusMutation.mutate(
      {
        status: selectedStatus,
        note: statusNote.trim() || undefined,
        assignedStaffId: selectedStatus === 'ASSIGNED' ? assignedStaffId.trim() || undefined : undefined,
      },
      {
        onSuccess: () => {
          setStatusNote('');
          setAssignedStaffId('');
          setSelectedStatus('');
        },
      }
    );
  };

  const handleCommentFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 3) {
      setCommentFileError('En fazla 3 dosya secilebilir.');
      setNewCommentFiles(files.slice(0, 3));
      return;
    }

    const hasTooLarge = files.some((file) => file.size > 5 * 1024 * 1024);
    if (hasTooLarge) {
      setCommentFileError('Her dosya en fazla 5MB olabilir.');
      setNewCommentFiles(files);
      return;
    }

    setCommentFileError(null);
    setNewCommentFiles(files);
  };

  const handleCreateComment = async () => {
    const trimmed = newCommentBody.trim();
    if (trimmed.length < 2) {
      return;
    }
    if (commentFileError) {
      return;
    }
    setCommentUploadError(null);

    try {
      const created = await createCommentMutation.mutateAsync({
        taskId,
        body: trimmed,
      });

      if (newCommentFiles.length) {
        setUploadingCommentFiles(true);
        await attachmentsApi.uploadToComment(created.id, newCommentFiles);
      }

      setNewCommentBody('');
      setNewCommentFiles([]);
      await taskQuery.refetch();
    } catch (error) {
      setCommentUploadError(getApiErrorMessage(error));
    } finally {
      setUploadingCommentFiles(false);
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Talep Detay</h1>
        <p className="mt-1 text-sm text-slate-600">ID: {task.id}</p>
      </div>

      <TaskStepper status={task.status} statusHistory={task.statusHistory} />

      <div className="rounded-lg border border-slate-200 p-3">
        <h2 className="text-base font-semibold text-slate-900">Bilgiler</h2>
        <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-slate-700 md:grid-cols-2">
          <p>
            <span className="font-medium">Kategori:</span> {task.category.name}
          </p>
          <p>
            <span className="font-medium">Durum:</span> {statusLabel(task.status)}
          </p>
          <p>
            <span className="font-medium">Oncelik:</span> {priorityLabel(task.priority)}
          </p>
          <p>
            <span className="font-medium">Olusturma:</span> {formatDateTime(task.createdAt)}
          </p>
          <p>
            <span className="font-medium">SLA Bitis:</span> {formatDateTime(task.deadlineAt)}
          </p>
          <p>
            <span className="font-medium">SLA Durumu:</span>{' '}
            {task.isOverdue ? <span className="text-red-600">Gecikmis</span> : 'Normal'}
          </p>
        </div>
        <p className="mt-3 rounded-md bg-slate-50 p-2 text-sm text-slate-800">{task.description}</p>
      </div>

      <div className="rounded-lg border border-slate-200 p-3">
        <h2 className="text-base font-semibold text-slate-900">Durum Aksiyonu</h2>
        {allowedStatuses.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">{actionUnavailableMessage}</p>
        ) : (
          <div className="mt-3 space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm text-slate-700">Yeni Durum</span>
              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value as TaskStatus | '')}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2"
              >
                <option value="">Durum sec</option>
                {allowedStatuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status)}
                  </option>
                ))}
              </select>
            </label>

            {selectedStatus === 'ASSIGNED' ? (
              <label className="block">
                <span className="mb-1 block text-sm text-slate-700">Gorevli ID (STAFF kullanici UUID)</span>
                <input
                  value={assignedStaffId}
                  onChange={(event) => setAssignedStaffId(event.target.value)}
                  placeholder="ornek: 00000000-0000-0000-0000-000000000000"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="mb-1 block text-sm text-slate-700">Not (opsiyonel)</span>
              <textarea
                value={statusNote}
                onChange={(event) => setStatusNote(event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2"
                placeholder="Durum degisikligi ile ilgili not..."
              />
            </label>

            {updateStatusMutation.isError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {getApiErrorMessage(updateStatusMutation.error)}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleUpdateStatus}
              disabled={updateStatusMutation.isPending || !selectedStatus}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {updateStatusMutation.isPending ? 'Guncelleniyor...' : 'Durumu Guncelle'}
            </button>
          </div>
        )}
      </div>

      <StatusTimeline history={task.statusHistory} />

      <div className="rounded-lg border border-slate-200 p-3">
        <h2 className="text-base font-semibold text-slate-900">Yorumlar</h2>

        <div className="mt-3 space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3">
          <label className="block">
            <span className="mb-1 block text-sm text-slate-700">Yeni Yorum</span>
            <textarea
              value={newCommentBody}
              onChange={(event) => setNewCommentBody(event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2"
              placeholder="Bu talep icin yorumunu yaz..."
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-slate-700">Yorum fotograflari (0-3 adet)</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleCommentFilesChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </label>

          {commentFileError ? <p className="text-sm text-red-600">{commentFileError}</p> : null}

          {newCommentFiles.length ? (
            <div className="rounded-md border border-slate-200 bg-white p-2">
              <p className="text-sm font-medium text-slate-700">Secilen yorum dosyalari:</p>
              <ul className="mt-1 space-y-1 text-xs text-slate-600">
                {newCommentFiles.map((file) => (
                  <li key={`${file.name}-${file.size}`}>
                    {file.name} ({formatFileSize(file.size)})
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {createCommentMutation.isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {getApiErrorMessage(createCommentMutation.error)}
            </div>
          ) : null}

          {commentUploadError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {commentUploadError}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleCreateComment}
            disabled={
              createCommentMutation.isPending ||
              uploadingCommentFiles ||
              newCommentBody.trim().length < 2 ||
              Boolean(commentFileError)
            }
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {createCommentMutation.isPending || uploadingCommentFiles ? 'Kaydediliyor...' : 'Yorum Ekle'}
          </button>
        </div>

        {task.attachments.length ? (
          <div className="mt-4 rounded-md border border-slate-200 bg-white p-3">
            <h3 className="text-sm font-semibold text-slate-800">Talep Fotograflari</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {task.attachments.map((file) => (
                <li key={file.id}>
                  {file.mimeType.startsWith('image/') ? (
                    <a href={buildUploadUrl(file.fileName)} target="_blank" rel="noreferrer">
                      <img
                        src={buildUploadUrl(file.fileName)}
                        alt={file.originalName}
                        className="mb-1 h-24 w-24 rounded-md border border-slate-200 object-cover"
                      />
                    </a>
                  ) : null}
                  <a
                    href={buildUploadUrl(file.fileName)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-700 hover:underline"
                  >
                    {file.originalName} ({formatFileSize(file.size)})
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-3 space-y-2">
          {task.comments.length === 0 ? (
            <p className="text-sm text-slate-500">Henuz yorum yok.</p>
          ) : (
            task.comments.map((comment) => (
              <div key={comment.id} className="rounded-md border border-slate-200 bg-slate-50 p-2">
                <p className="text-sm text-slate-800">{comment.body}</p>
                <p className="mt-1 text-xs text-slate-600">
                  {comment.author.name} - {formatDateTime(comment.createdAt)}
                </p>
                {comment.attachments.length ? (
                  <ul className="mt-2 space-y-2 text-xs">
                    {comment.attachments.map((file) => (
                      <li key={file.id}>
                        {file.mimeType.startsWith('image/') ? (
                          <a href={buildUploadUrl(file.fileName)} target="_blank" rel="noreferrer">
                            <img
                              src={buildUploadUrl(file.fileName)}
                              alt={file.originalName}
                              className="mb-1 h-20 w-20 rounded-md border border-slate-200 object-cover"
                            />
                          </a>
                        ) : null}
                        <a
                          href={buildUploadUrl(file.fileName)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-700 hover:underline"
                        >
                          {file.originalName} ({formatFileSize(file.size)})
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
