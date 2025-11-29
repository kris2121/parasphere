'use client';

import { useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);

      // ✅ If already logged in, go straight back to the app
      if (u) {
        router.push('/');
      }
    });

    return () => unsub();
  }, [router]);

  async function signInWithGoogle() {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will fire, then redirect to "/"
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0B0C0E] text-white p-6">
      <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-neutral-400">Use Google to continue.</p>

        <div className="mt-4 grid gap-2">
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="rounded-md border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800"
          >
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>
        </div>
      </div>
    </main>
  );
}
