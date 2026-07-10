import { AuthScreen } from "@/components/keepnoto/auth-screen";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return <AuthScreen error={error} />;
}