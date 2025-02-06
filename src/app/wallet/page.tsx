'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublicKey } from '@solana/web3.js';
import { getBalance } from '@/lib/solana';

export default function WalletPage() {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate Solana address
      new PublicKey(address);
      
      // Check if address has balance
      const balance = await getBalance(address);
      
      if (balance <= 0) {
        setError('Cüzdanında hiç SOL yok. Lütfen önce biraz SOL yükle.');
        return;
      }

      // Store wallet address in localStorage
      localStorage.setItem('walletAddress', address);
      
      // Redirect to puzzle
      router.push('/puzzle');
    } catch (err) {
      setError('Geçersiz Solana cüzdan adresi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-zinc-800">
        <h1 className="text-2xl font-bold text-center mb-6">Cüzdanını Bağla</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Solana Cüzdan Adresi
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-zinc-700 dark:border-zinc-600"
              placeholder="Solana cüzdan adresini gir"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Bağlanıyor...' : 'Cüzdanı Bağla'}
          </button>
        </form>
      </div>
    </main>
  );
} 