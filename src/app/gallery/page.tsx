'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getWalletPieces, type Piece } from '@/lib/supabase';

export default function GalleryPage() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const walletAddress = localStorage.getItem('walletAddress');
    if (!walletAddress) {
      router.push('/wallet');
      return;
    }

    const fetchPieces = async () => {
      try {
        const walletPieces = await getWalletPieces(walletAddress);
        setPieces(walletPieces);
      } catch (err) {
        setError('Failed to load puzzle pieces');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPieces();
  }, [router]);

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
      <h1 className="text-3xl font-bold mb-8">Your Puzzle Pieces</h1>
      
      {pieces.length === 0 ? (
        <p className="text-gray-500">
          You haven't collected any puzzle pieces yet. Send some SOL to get started!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {pieces.map((piece) => (
            <div
              key={piece.id}
              className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4"
            >
              <div className="aspect-square bg-gray-200 dark:bg-zinc-700 rounded-lg mb-4">
                {/* Placeholder for puzzle piece image */}
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                  #{piece.piece_id}
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Collected: {new Date(piece.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
} 