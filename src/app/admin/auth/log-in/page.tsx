'use client';
import { useState } from 'react';
import { supabase } from '../../../../../utils/supabase/admin-browser'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const fakeEmail = `${username}@admin.local`;
      console.log('🔐 Logging in with:', fakeEmail);

      const { error } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password,
      });

      if (error) {
        alert(error.message || 'Login failed');
      } else {
        location.href = '/admin';
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      alert('Something went wrong during login.');
    }
  };

  const handleSignUp = async () => {
    try {
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Signup failed');
      } else {
        alert('Signup successful! You can now log in.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong during sign-up.');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 mb-3 w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-4 w-full"
        />
        <button onClick={handleLogin} className="bg-black text-white px-4 py-2 w-full">
          Login
        </button>
        <button onClick={handleSignUp} className="bg-gray-800 text-white px-4 py-2 w-full mt-2">
          Sign Up (Temp)
        </button>
      </div>
    </main>
  );
}
