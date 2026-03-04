// frontend/src/components/bundle-detail/ui/BundleSkeleton.jsx

import React from 'react';

const BundleSkeleton = () => {
  return (
    <div className="min-h-screen"
      style={{ backgroundImage: 'url(/assets/doodle_bg.png)', backgroundRepeat: 'repeat', backgroundSize: 'auto' }}
    >
      <div className="sticky top-0 z-30">
        <div className="h-16 bg-white dark:bg-tppdarkgray border-b border-slate-200 dark:border-tppdarkwhite/10">
          <div className="max-w-9xl mx-auto px-4 h-full flex items-center justify-between">
            <div className="skeleton-shimmer h-8 w-32 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
            <div className="flex items-center gap-4">
              <div className="skeleton-shimmer h-8 w-8 rounded-full bg-slate-200 dark:bg-tppdarkwhite/10" />
              <div className="skeleton-shimmer h-8 w-8 rounded-full bg-slate-200 dark:bg-tppdarkwhite/10" />
            </div>
          </div>
        </div>
        <div className="h-12 bg-white/95 dark:bg-tppdark/95 border-b border-slate-100 dark:border-tppdarkwhite/10">
          <div className="max-w-9xl mx-auto px-4 h-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              {[16, 3, 20, 3, 24].map((w, i) => (
                <div key={i} className={`skeleton-shimmer h-3 w-${w} rounded bg-slate-200 dark:bg-tppdarkwhite/10`} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="skeleton-shimmer h-8 w-8 rounded-lg bg-slate-200 dark:bg-tppdarkwhite/10" />
              <div className="skeleton-shimmer h-8 w-8 rounded-lg bg-slate-200 dark:bg-tppdarkwhite/10" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-9xl mx-auto md:px-6 md:py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-4 md:gap-12">

          <div className="space-y-4 md:space-y-0">
            <div className="bg-white dark:bg-tppdarkgray rounded-lg border border-slate-200 dark:border-tppdarkwhite/10 shadow-sm overflow-hidden">
              <div className="grid md:grid-cols-1 lg:grid-cols-[45%_55%]">
                <div className="relative">
                  <div className="aspect-square bg-slate-100 dark:bg-tppdarkwhite/5 relative overflow-hidden">
                    <div className="skeleton-shimmer absolute inset-0 bg-slate-200 dark:bg-tppdarkwhite/10" />
                  </div>
                  <div className="hidden md:block border-t border-slate-200 dark:border-tppdarkwhite/10 bg-slate-50 dark:bg-tppdarkwhite/5 p-4">
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(i => <div key={i} className="skeleton-shimmer w-20 h-20 rounded-lg bg-slate-200 dark:bg-tppdarkwhite/10 flex-shrink-0" />)}
                    </div>
                  </div>
                  <div className="md:hidden border-t border-slate-200 dark:border-tppdarkwhite/10 bg-slate-50 dark:bg-tppdarkwhite/5 p-2">
                    <div className="flex gap-2">
                      {[1,2,3].map(i => <div key={i} className="skeleton-shimmer w-20 h-20 rounded-lg bg-slate-200 dark:bg-tppdarkwhite/10 flex-shrink-0" />)}
                    </div>
                  </div>
                </div>
                <div className="p-3 md:p-6 md:border-l border-slate-200 dark:border-tppdarkwhite/10 space-y-6">
                  <div>
                    <div className="skeleton-shimmer h-9 w-4/5 rounded bg-slate-200 dark:bg-tppdarkwhite/10 mb-2" />
                    <div className="skeleton-shimmer h-9 w-3/5 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                  </div>
                  <div className="space-y-2">
                    {[1,2,3].map(i => <div key={i} className={`skeleton-shimmer h-4 ${i === 3 ? 'w-4/5' : 'w-full'} rounded bg-slate-200 dark:bg-tppdarkwhite/10`} />)}
                  </div>
                  <div className="border-t border-slate-200 dark:border-tppdarkwhite/10 pt-4 space-y-3">
                    <div className="flex items-end gap-2">
                      <div className="skeleton-shimmer h-10 w-32 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                      <div className="skeleton-shimmer h-6 w-20 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="skeleton-shimmer w-2 h-2 rounded-full bg-slate-200 dark:bg-tppdarkwhite/10" />
                      <div className="skeleton-shimmer h-4 w-20 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                    </div>
                    <div className="skeleton-shimmer h-4 w-48 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                  </div>
                  <div className="border-t border-slate-200 dark:border-tppdarkwhite/10 pt-4 space-y-3">
                    <div className="skeleton-shimmer h-3 w-16 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                    <div className="flex items-center gap-2">
                      <div className="skeleton-shimmer w-9 h-9 rounded-md bg-slate-200 dark:bg-tppdarkwhite/10" />
                      <div className="skeleton-shimmer w-16 h-9 rounded-md bg-slate-200 dark:bg-tppdarkwhite/10" />
                      <div className="skeleton-shimmer w-9 h-9 rounded-md bg-slate-200 dark:bg-tppdarkwhite/10" />
                    </div>
                    <div className="skeleton-shimmer h-12 w-full rounded-lg bg-slate-200 dark:bg-tppdarkwhite/10" />
                  </div>
                  <div className="border-t border-slate-200 dark:border-tppdarkwhite/10 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="skeleton-shimmer h-4 w-40 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                      <div className="skeleton-shimmer h-4 w-4 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                    </div>
                    <div className="space-y-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-tppdarkwhite/5 rounded-lg border border-slate-200 dark:border-tppdarkwhite/10">
                          <div className="skeleton-shimmer w-12 h-12 rounded-md bg-slate-200 dark:bg-tppdarkwhite/10 flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="skeleton-shimmer h-3 w-3/4 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                            <div className="skeleton-shimmer h-3 w-1/2 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                          </div>
                          <div className="skeleton-shimmer w-8 h-5 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200 dark:border-tppdarkwhite/10 p-3 md:p-6 space-y-3">
                <div className="skeleton-shimmer h-5 w-48 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                <div className="space-y-2">
                  {[1,2,3,4].map(i => <div key={i} className={`skeleton-shimmer h-4 ${i > 2 ? (i === 3 ? 'w-4/5' : 'w-3/5') : 'w-full'} rounded bg-slate-200 dark:bg-tppdarkwhite/10`} />)}
                </div>
              </div>
            </div>

            <div className="md:hidden bg-white dark:bg-tppdarkgray rounded-lg border border-slate-200 dark:border-tppdarkwhite/10 shadow-sm overflow-hidden">
              <div className="p-4 space-y-3">
                <div className="skeleton-shimmer h-4 w-24 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                <div className="skeleton-shimmer h-12 w-full rounded-lg bg-slate-200 dark:bg-tppdarkwhite/10" />
                <div className="skeleton-shimmer h-24 w-full rounded-lg bg-slate-200 dark:bg-tppdarkwhite/10" />
                <div className="skeleton-shimmer h-12 w-full rounded-lg bg-slate-200 dark:bg-tppdarkwhite/10" />
              </div>
              <div className="p-4 space-y-3">
                <div className="skeleton-shimmer h-4 w-32 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                <div className="skeleton-shimmer h-24 w-full rounded-lg bg-slate-200 dark:bg-tppdarkwhite/10" />
              </div>
              <div className="p-4 space-y-3">
                <div className="skeleton-shimmer h-3 w-32 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="skeleton-shimmer h-12 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                  <div className="skeleton-shimmer h-12 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-tppdarkgray rounded-lg border border-slate-200 dark:border-tppdarkwhite/10 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-tppslate dark:bg-tppdark flex items-center justify-between">
                <div className="skeleton-shimmer h-5 w-40 rounded bg-white/20" />
                <div className="skeleton-shimmer h-5 w-5 rounded bg-white/20" />
              </div>
              <div className="px-4 py-4 space-y-4">
                <div className="flex items-center gap-6 pb-4 border-b border-slate-100 dark:border-tppdarkwhite/10">
                  <div className="text-center space-y-2">
                    <div className="skeleton-shimmer h-10 w-16 rounded bg-slate-200 dark:bg-tppdarkwhite/10 mx-auto" />
                    <div className="flex gap-1 justify-center">{[1,2,3,4,5].map(i => <div key={i} className="skeleton-shimmer w-3 h-3 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />)}</div>
                    <div className="skeleton-shimmer h-3 w-20 rounded bg-slate-200 dark:bg-tppdarkwhite/10 mx-auto" />
                  </div>
                  <div className="flex-1 space-y-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="skeleton-shimmer w-2 h-3 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                        <div className="skeleton-shimmer w-2 h-2 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                        <div className="skeleton-shimmer flex-1 h-2 rounded-full bg-slate-200 dark:bg-tppdarkwhite/10" />
                        <div className="skeleton-shimmer w-8 h-3 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="pb-3 border-b border-slate-100 dark:border-tppdarkwhite/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="skeleton-shimmer w-8 h-8 rounded-full bg-slate-200 dark:bg-tppdarkwhite/10" />
                          <div className="space-y-1">
                            <div className="skeleton-shimmer h-4 w-32 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                            <div className="skeleton-shimmer h-3 w-20 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                          </div>
                        </div>
                        <div className="flex gap-1">{[1,2,3,4,5].map(j => <div key={j} className="skeleton-shimmer w-3 h-3 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />)}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="skeleton-shimmer h-3 w-full rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                        <div className="skeleton-shimmer h-3 w-full rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                        <div className="skeleton-shimmer h-3 w-3/4 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                      </div>
                      <div className="skeleton-shimmer h-4 w-24 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                    </div>
                  ))}
                </div>
                <div className="skeleton-shimmer h-12 w-full rounded-lg bg-slate-200 dark:bg-tppdarkwhite/10" />
                <div className="skeleton-shimmer h-12 w-full rounded-lg bg-slate-200 dark:bg-tppdarkwhite/10" />
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-20">
              <div className="bg-white dark:bg-tppdarkgray rounded-xl border-2 border-dashed border-tppslate/50 dark:border-tppdarkwhite/20 shadow-lg overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="skeleton-shimmer h-4 w-24 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                  <div className="skeleton-shimmer h-12 w-full rounded-lg bg-slate-200 dark:bg-tppdarkwhite/10" />
                  <div className="skeleton-shimmer h-24 w-full rounded-lg bg-slate-200 dark:bg-tppdarkwhite/10" />
                  <div className="skeleton-shimmer h-12 w-full rounded-lg bg-slate-200 dark:bg-tppdarkwhite/10" />
                </div>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center px-4">
                    <div className="w-full border-t border-gray-200 dark:border-tppdarkwhite/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <div className="bg-white dark:bg-tppdarkgray px-3">
                      <div className="skeleton-shimmer w-2 h-2 rounded-full bg-gray-300 dark:bg-tppdarkwhite/20" />
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="skeleton-shimmer h-4 w-32 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                  <div className="skeleton-shimmer h-32 w-full rounded-lg bg-slate-200 dark:bg-tppdarkwhite/10" />
                </div>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center px-4">
                    <div className="w-full border-t border-gray-200 dark:border-tppdarkwhite/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <div className="bg-white dark:bg-tppdarkgray px-3">
                      <div className="skeleton-shimmer w-2 h-2 rounded-full bg-gray-300 dark:bg-tppdarkwhite/20" />
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="skeleton-shimmer h-3 w-32 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="skeleton-shimmer h-14 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                    <div className="skeleton-shimmer h-14 rounded bg-slate-200 dark:bg-tppdarkwhite/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .skeleton-shimmer {
          animation: shimmer 2s infinite;
          background: linear-gradient(to right, #e2e8f0 0%, #f1f5f9 20%, #e2e8f0 40%, #e2e8f0 100%);
          background-size: 1000px 100%;
        }
        .dark .skeleton-shimmer {
          background: linear-gradient(to right, #2a2a2a 0%, #4a4a4a 20%, #2a2a2a 40%, #2a2a2a 100%);
          background-size: 1000px 100%;
        }
      `}</style>
    </div>
  );
};

export default BundleSkeleton;