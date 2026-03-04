// Skeleton Loading Components for User Dashboard Pages

import React from 'react';

const skeletonStyles = `
  @keyframes skeleton-shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  .skeleton-shimmer {
    background: linear-gradient(to right, #e2e8f0 0%, #ec4899 20%, #e2e8f0 40%);
    background-size: 1000px 100%;
    animation: skeleton-shimmer 2s infinite;
  }

  .dark .skeleton-shimmer {
    background: linear-gradient(to right, #2a2a2a 0%, #4a4a4a 20%, #2a2a2a 40%);
    background-size: 1000px 100%;
    animation: skeleton-shimmer 2s infinite;
  }

  .skeleton-shimmer-fast {
    background: linear-gradient(to right, #e2e8f0 0%, #ec4899 20%, #e2e8f0 40%);
    background-size: 1000px 100%;
    animation: skeleton-shimmer 1.5s infinite;
  }

  .dark .skeleton-shimmer-fast {
    background: linear-gradient(to right, #2a2a2a 0%, #4a4a4a 20%, #2a2a2a 40%);
    background-size: 1000px 100%;
    animation: skeleton-shimmer 1.5s infinite;
  }
`;

export const SkeletonPulse = ({
  className = 'w-full h-4 rounded',
  count = 1,
  shimmer = true
}) => (
  <>
    {Array(count).fill(0).map((_, i) => (
      <div
        key={i}
        className={`${className} ${shimmer ? 'skeleton-shimmer' : 'bg-slate-200 dark:bg-tppdarkwhite/10 animate-pulse'}`}
      />
    ))}
  </>
);

export const CardSkeleton = ({ lines = 3 }) => (
  <div className="bg-white dark:bg-tppdarkgray border border-slate-200 dark:border-tppdarkwhite/10 rounded-lg p-6">
    <div className="flex items-start gap-4 mb-4">
      <div className="w-12 h-12 bg-slate-200 dark:bg-tppdarkwhite/10 rounded-lg flex-shrink-0 skeleton-shimmer" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-3/4" />
        <div className="h-3 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      {Array(lines).fill(0).map((_, i) => (
        <div key={i} className="h-3 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-full" />
      ))}
    </div>
  </div>
);

export const TableRowSkeleton = ({ cells = 5 }) => (
  <tr className="border-b border-slate-200 dark:border-tppdarkwhite/10">
    {Array(cells).fill(0).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer" />
      </td>
    ))}
  </tr>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div>
      <div className="h-8 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-64 mb-2" />
      <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-96" />
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="bg-white dark:bg-tppdarkgray border border-slate-200 dark:border-tppdarkwhite/10 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="w-4 h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer" />
            <div className="w-12 h-12 bg-slate-200 dark:bg-tppdarkwhite/10 rounded-lg skeleton-shimmer" />
          </div>
          <div className="h-3 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-20 mb-2" />
          <div className="h-6 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-16" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white dark:bg-tppdarkgray border border-slate-200 dark:border-tppdarkwhite/10 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-tppdarkwhite/10">
          <div className="h-5 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-32" />
        </div>
        <div className="divide-y divide-slate-200 dark:divide-tppdarkwhite/10">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-24" />
                <div className="h-6 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-20" />
              </div>
              <div className="h-3 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-40" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="bg-white dark:bg-tppdarkgray border border-slate-200 dark:border-tppdarkwhite/10 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="w-4 h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer" />
              <div className="h-6 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-12" />
            </div>
            <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-32 mb-2" />
            <div className="h-3 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-24" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const AddressesSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-8 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-48" />
        <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-64" />
      </div>
      <div className="h-10 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-32" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="bg-white dark:bg-tppdarkgray border border-slate-200 dark:border-tppdarkwhite/10 rounded-lg p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-slate-200 dark:bg-tppdarkwhite/10 rounded-lg flex-shrink-0 skeleton-shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-full" />
              <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-4/5" />
              <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-3/4" />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-tppdarkwhite/10 flex gap-2">
            <div className="flex-1 h-8 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer" />
            <div className="flex-1 h-8 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer" />
            <div className="flex-1 h-8 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const OrdersSkeleton = () => (
  <div className="space-y-6">
    <div>
      <div className="h-8 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-48 mb-2" />
      <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-72" />
    </div>

    <div className="bg-white dark:bg-tppdarkgray rounded-lg border border-slate-200 dark:border-tppdarkwhite/10 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-10 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer" />
        <div className="h-10 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer" />
      </div>
    </div>

    <div className="space-y-4">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="bg-white dark:bg-tppdarkgray rounded-lg border border-slate-200 dark:border-tppdarkwhite/10 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <div className="h-5 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-32" />
              <div className="h-3 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-40" />
            </div>
            <div className="h-6 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-24" />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer" />
            <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer" />
            <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 h-9 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer" />
            <div className="flex-1 h-9 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-8">
    <div>
      <div className="h-8 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-64 mb-2" />
      <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-96" />
    </div>

    <div className="bg-white dark:bg-tppdarkgray rounded-lg border border-slate-200 dark:border-tppdarkwhite/10 p-8">
      <div className="flex items-center gap-8">
        <div className="w-32 h-32 bg-slate-200 dark:bg-tppdarkwhite/10 rounded-full flex-shrink-0 skeleton-shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-48" />
          <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-64" />
          <div className="h-3 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-56" />
        </div>
      </div>
    </div>

    <div className="bg-white dark:bg-tppdarkgray rounded-lg border border-slate-200 dark:border-tppdarkwhite/10 overflow-hidden">
      <div className="flex border-b border-slate-200 dark:border-tppdarkwhite/10 p-4 gap-4">
        <div className="h-5 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-32" />
        <div className="h-5 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-32" />
      </div>
      <div className="p-8 space-y-6">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-24" />
            <div className="h-10 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer" />
          </div>
        ))}
        <div className="flex gap-3 pt-4">
          <div className="flex-1 h-10 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer" />
          <div className="flex-1 h-10 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer" />
        </div>
      </div>
    </div>
  </div>
);

export const WishlistSkeleton = () => (
  <div className="space-y-6">
    <div>
      <div className="h-8 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-48 mb-2" />
      <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-72" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(6).fill(0).map((_, i) => (
        <div key={i} className="bg-white dark:bg-tppdarkgray rounded-lg border border-slate-200 dark:border-tppdarkwhite/10 overflow-hidden">
          <div className="h-64 bg-slate-200 dark:bg-tppdarkwhite/10 skeleton-shimmer" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-full" />
            <div className="h-3 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-4/5" />
            <div className="flex items-center justify-between">
              <div className="h-5 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-20" />
              <div className="h-8 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-24" />
            </div>
            <div className="h-9 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SettingsSkeleton = () => (
  <div className="space-y-6">
    <div>
      <div className="h-8 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-48 mb-2" />
      <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-72" />
    </div>

    <div className="bg-white dark:bg-tppdarkgray rounded-lg border border-slate-200 dark:border-tppdarkwhite/10 overflow-hidden">
      <div className="flex border-b border-slate-200 dark:border-tppdarkwhite/10 p-4 gap-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="h-5 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-32" />
        ))}
      </div>
      <div className="p-6 space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-tppdarkwhite/5 rounded-lg">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-32" />
              <div className="h-3 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-48" />
            </div>
            <div className="w-12 h-6 bg-slate-200 dark:bg-tppdarkwhite/10 rounded-full skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const NotificationsSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-8 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-48" />
        <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-72" />
      </div>
      <div className="h-10 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-40" />
    </div>

    <div className="space-y-3">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="border-2 border-slate-200 dark:border-tppdarkwhite/10 rounded-lg p-4">
          <div className="flex gap-4">
            <div className="w-6 h-6 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-40" />
              <div className="h-3 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-full" />
              <div className="h-3 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer w-32" />
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer" />
              <div className="w-8 h-8 bg-slate-200 dark:bg-tppdarkwhite/10 rounded skeleton-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export { skeletonStyles };

export default {
  SkeletonPulse,
  CardSkeleton,
  TableRowSkeleton,
  DashboardSkeleton,
  AddressesSkeleton,
  OrdersSkeleton,
  ProfileSkeleton,
  WishlistSkeleton,
  SettingsSkeleton,
  NotificationsSkeleton,
};