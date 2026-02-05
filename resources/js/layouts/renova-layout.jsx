import { AppHeader } from '@/components/app-header';
import { AppContent } from '@/components/app-content';
import { Footer } from '@/components/app-footer';
import CookieBanner from '@/components/cookie-banner';
import { usePage } from '@inertiajs/react';


export default function AppRenovaLayout({ children, breadcrumbs }) {
  const { flash, errors } = usePage().props;
  const errorMessages = errors ? Object.values(errors).flat() : [];

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader breadcrumbs={breadcrumbs} />
      <AppContent className="flex-1 p-6">
        {(flash?.success || flash?.error || errorMessages.length > 0) && (
          <div className="mb-4 space-y-2">
            {flash?.success && (
              <div className="rounded-md bg-green-100 px-4 py-2 text-sm text-green-800">
                {flash.success}
              </div>
            )}
            {flash?.error && (
              <div className="rounded-md bg-red-100 px-4 py-2 text-sm text-red-800">
                {flash.error}
              </div>
            )}
            {errorMessages.map((message, index) => (
              <div
                key={`${message}-${index}`}
                className="rounded-md bg-red-100 px-4 py-2 text-sm text-red-800"
              >
                {message}
              </div>
            ))}
          </div>
        )}
        {children}
      </AppContent>
      <Footer />
      <CookieBanner />
    </div>
  );
}
