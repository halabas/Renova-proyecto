import { AppHeader } from '@/components/app-header';
import { AppContent } from '@/components/app-content';
import { Footer } from '@/components/app-footer';


export default function AppRenovaLayout({ children, breadcrumbs }) {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader breadcrumbs={breadcrumbs} />
      <AppContent className="flex-1 p-6">{children}</AppContent>
      <Footer />
    </div>
  );
}
