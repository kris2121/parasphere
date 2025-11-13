'use client';
import { useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  async function signInWithGoogle() {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } finally {
      setLoading(false);
    }
  }

  async function signOutUser() {
    setLoading(true);
    try {
      await signOut(auth);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0B0C0E] text-white p-6">
      <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-neutral-400">Use Google to continue.</p>

        {!user ? (
          <div className="mt-4 grid gap-2">
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="rounded-md border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800"
            >
              Continue with Google
            </button>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            <div className="text-sm text-neutral-300">
              Signed in as{' '}
              <span className="text-cyan-300">
                {user.displayName || user.email}
              </span>
            </div>
            <button
              onClick={signOutUser}
              disabled={loading}
              className="rounded-md border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800"
            >
              Sign out
            </button>
            <a href="/" className="text-sm text-cyan-300 hover:underline">
              ← Back to app
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
