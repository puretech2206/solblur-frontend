'use client';

import { useEffect, useState } from 'react';
import { getWalletTransactions, type Transaction } from '@/lib/supabase';

interface LeaderboardEntry {
  wallet_address: string;
  total_transactions: number;
  total_amount: number;
}

export default function LeaderboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // For demo purposes, we'll use the current wallet's transactions
        const walletAddress = localStorage.getItem('walletAddress');
        if (!walletAddress) return;

        const txs = await getWalletTransactions(walletAddress);
        setTransactions(txs);

        // Calculate leaderboard
        const walletStats = new Map<string, LeaderboardEntry>();
        
        txs.forEach(tx => {
          const existing = walletStats.get(tx.wallet_address) || {
            wallet_address: tx.wallet_address,
            total_transactions: 0,
            total_amount: 0
          };

          walletStats.set(tx.wallet_address, {
            ...existing,
            total_transactions: existing.total_transactions + 1,
            total_amount: existing.total_amount + tx.amount
          });
        });

        const leaderboardData = Array.from(walletStats.values())
          .sort((a, b) => b.total_amount - a.total_amount);

        setLeaderboard(leaderboardData);
      } catch (err) {
        setError('Failed to load leaderboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-xl">Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-red-500">{error}</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-3xl font-bold mb-8">Leaderboard</h1>

      <div className="w-full max-w-4xl space-y-8">
        {/* Top Players */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Top Players</h2>
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
              <thead className="bg-gray-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Wallet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pieces
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total SOL
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-zinc-700">
                {leaderboard.map((entry, index) => (
                  <tr key={entry.wallet_address}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {entry.wallet_address.slice(0, 4)}...{entry.wallet_address.slice(-4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {entry.total_transactions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {(entry.total_amount / 1e9).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recent Transactions</h2>
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
              <thead className="bg-gray-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Wallet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-zinc-700">
                {transactions.slice(0, 10).map((tx) => (
                  <tr key={tx.signature}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {tx.wallet_address.slice(0, 4)}...{tx.wallet_address.slice(-4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {(tx.amount / 1e9).toFixed(2)} SOL
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
} 