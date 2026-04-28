'use client';

import { useState } from 'react';

import { useReportsOverviewQuery } from '../../../features/reports/hooks/use-reports-overview-query';
import { getApiErrorMessage } from '../../../lib/api-client';
import { statusLabel } from '../../../lib/format';

const now = new Date();

export default function ReportsPage() {
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const reportsQuery = useReportsOverviewQuery({ month, year });
  const report = reportsQuery.data;

  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Raporlar</h1>
          <p className="mt-1 text-sm text-slate-600">Kategori, durum, SLA ve cozum performansi.</p>
        </div>

        <div className="flex gap-2">
          <label className="block">
            <span className="mb-1 block text-xs text-slate-600">Ay</span>
            <select
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2"
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-600">Yil</span>
            <input
              type="number"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="w-28 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2"
            />
          </label>
        </div>
      </div>

      {reportsQuery.isLoading ? <p className="text-sm text-slate-500">Rapor yukleniyor...</p> : null}

      {reportsQuery.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {getApiErrorMessage(reportsQuery.error)}
        </div>
      ) : null}

      {report ? (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Metric label="Toplam Degerlendirilen" value={report.slaPerformance.totalConsidered} />
            <Metric label="SLA Basari" value={`%${report.slaPerformance.onTimeRate}`} />
            <Metric label="Geciken" value={report.slaPerformance.overdue} />
            <Metric
              label="Ort. Cozum"
              value={report.averageResolutionHours === null ? '-' : `${report.averageResolutionHours} saat`}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DistributionPanel
              title="Kategori Dagilimi"
              items={report.categoryDistribution.map((item) => ({
                label: item.categoryName,
                value: item.taskCount,
              }))}
            />
            <DistributionPanel
              title="Durum Dagilimi"
              items={report.statusDistribution.map((item) => ({
                label: statusLabel(item.status),
                value: item.taskCount,
              }))}
            />
          </div>

          <div className="rounded-lg border border-slate-200 p-3">
            <h2 className="text-base font-semibold text-slate-900">Cozum Trendi</h2>
            <div className="mt-3 space-y-2">
              {report.resolutionTrend.length === 0 ? (
                <p className="text-sm text-slate-500">Bu donemde cozulmus talep yok.</p>
              ) : (
                report.resolutionTrend.map((item) => (
                  <div key={item.date} className="flex items-center gap-3">
                    <span className="w-28 text-sm text-slate-600">{item.date}</span>
                    <div className="h-3 flex-1 rounded-full bg-slate-100">
                      <div
                        className="h-3 rounded-full bg-brand-500"
                        style={{ width: `${Math.max(8, item.resolvedCount * 18)}px` }}
                      />
                    </div>
                    <span className="w-12 text-right text-sm font-medium text-slate-900">
                      {item.resolvedCount}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function DistributionPanel({ title, items }: { title: string; items: Array<{ label: string; value: number }> }) {
  const maxValue = Math.max(1, ...items.map((item) => item.value));

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3">
        {items.length === 0 ? <p className="text-sm text-slate-500">Veri yok.</p> : null}
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{item.label}</span>
              <span className="text-slate-600">{item.value}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100">
              <div
                className="h-3 rounded-full bg-brand-500"
                style={{ width: `${Math.max(6, (item.value / maxValue) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
