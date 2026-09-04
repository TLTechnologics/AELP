import AuthShellLayout from '@/components/layout/auth-shell-layout';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthShellLayout>{children}</AuthShellLayout>;
}
