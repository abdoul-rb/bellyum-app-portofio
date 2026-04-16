import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/auth/AuthForm';
import { AppLayout } from '@/components/layout/AppLayout';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Portfolios = lazy(() => import('@/pages/Portfolios'));
const PortfolioDetail = lazy(() => import('@/pages/PortfolioDetail'));
const Settings = lazy(() => import('@/pages/Settings'));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <AuthForm />;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
        <Route path="/portfolios" element={<Suspense fallback={<PageLoader />}><Portfolios /></Suspense>} />
        <Route path="/portfolios/:id" element={<Suspense fallback={<PageLoader />}><PortfolioDetail /></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
