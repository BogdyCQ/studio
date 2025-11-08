
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth as useAppAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/firebase";
import { signInAnonymously } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icons } from "@/components/icons";

export default function LoginPage() {
  const { t } = useTranslation();
  const { user, loading } = useAppAuth();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);
  
  const handleGuestSignIn = async () => {
    if (!auth) return;
    try {
      await signInAnonymously(auth);
      router.push('/dashboard');
    } catch (error) {
      console.error("Error signing in anonymously", error);
    }
  };

  if (loading || user) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
             <div className="flex flex-col items-center gap-4">
              <Icons.logo className="h-16 w-16 animate-pulse text-primary/50" />
            </div>
        </div>
    )
  }

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm shadow-2xl">
          <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                  <Icons.logo className="h-12 w-12 text-primary" />
              </div>
            <CardTitle className="text-3xl font-headline">{t('appName')}</CardTitle>
            <CardDescription className="pt-2">{t('signIn')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGuestSignIn} className="w-full" variant="default" size="lg">
              {t('enterAsGuest')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
