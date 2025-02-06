'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, type Piece } from '@/lib/supabase';
import debounce from 'lodash/debounce';

const GRID_SIZE = 100;
const CANVAS_SIZE = 1000; // Sabit canvas boyutu
const PIECE_SIZE = CANVAS_SIZE / GRID_SIZE;

export default function Home() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [searchWallet, setSearchWallet] = useState('');
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Canvas'a çizim yapma fonksiyonu
  const drawCanvas = useCallback((canvas: HTMLCanvasElement, currentPieces: Piece[], searchTerm: string = '') => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !imageRef.current) return;

    // Canvas'ı temizle
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Blurlu resmi çiz
    ctx.drawImage(imageRef.current, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Açılmış parçaları çiz
    currentPieces.forEach(piece => {
      const row = Math.floor(piece.piece_id / GRID_SIZE);
      const col = piece.piece_id % GRID_SIZE;
      const x = col * PIECE_SIZE;
      const y = row * PIECE_SIZE;

      // Parça açık ve aranan cüzdana ait ise vurgula
      if (searchTerm && piece.wallet_address.toLowerCase() === searchTerm.toLowerCase()) {
        ctx.strokeStyle = '#9333ea'; // Solana mor
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, PIECE_SIZE, PIECE_SIZE);
      }

      // Parçanın opaklığını ayarla
      ctx.globalAlpha = piece ? 1 : 0.3;
    });

    // Opaklığı sıfırla
    ctx.globalAlpha = 1;
  }, []);

  // Debounced arama
  const debouncedSearch = useCallback(
    (value: string) => {
      setSearchWallet(value);
      if (canvasRef.current) {
        drawCanvas(canvasRef.current, pieces, value);
      }
    },
    [pieces, drawCanvas]
  );

  const debouncedSearchWithDelay = useCallback(
    debounce((value: string) => debouncedSearch(value), 300),
    [debouncedSearch]
  );

  useEffect(() => {
    // Resmi yükle
    const img = new Image();
    img.src = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy02Mi85OEI2PTZFOT5ZXVlZfG1+fW6Ghn6QjpCOlZWVlZX/2wBDARUXFyAeIB4aGh4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICX/wAARCACWAJYDASIAAhEBAxEB/8QAGgAAAwEBAQEAAAAAAAAAAAAAAAIDAQQFBv/EACYQAAICAgICAgICAwAAAAAAAAABAhEDEiExBEETUTJhFHEigZH/xAAZAQADAQEBAAAAAAAAAAAAAAAAAQIDBAX/xAAeEQEBAQEBAAMBAQEAAAAAAAAAAQIRAxIhMUETUf/aAAwDAQACEQMRAD8A+OorHQaKJHqvJgUVjEjGLYaKqJLUeI6DReMSOodhqVjjOmGM6YYjphiN86c+nPHGVjjOiOI6I4jXzY+bljjKxxnTHEdEcRv5sPNyxxlljO2OEtHCa+bDzcCxFo4zvWEtHCaebH4uBYSscJ3rCWjhH5n8XnWEosJ6CwFVgKmbH4vOWEqsJ3rAVWA1mbH4vPWEqsJ3LAVWEvm5/F56wlVhPQWAqsBXNS/F5ywnHmj/AJM9pYTz/Kx0+jXy1/6x9MbvuLmxFliO6eOyMsVHVnbi3jOSOI6IYi8MZ0wxm+M/bLWfpzwxHRDEdEMR0QxG+M/bHWvpzwxHRDEdMcJeOI2zn7Y6194csMJeOI7Y4S8cJtjP2w3v6ckcJeOI744S8cJtjLDevpyRwlo4TujhLxwmucsdbikcJaOE744S0cJrnLHW4pHCVjhO5YSqwmucsdbikcJWOE71hKrCa5yx1uPP8mH+J5fkRqbPf8iPB5fkKpHTjXHN6T8fP+JDxB4BaJrK8d8cZaOMhBl4M0zWO63hiOiGI54MvBm+Yy1XRDEdEMRzwZeDNc5Y6rphiOiGI54MvBmucsdV0wxF4YjngzogzXOWOq6oYi8MRzwZeDNc5Y6rpjiLxxnNBl4M1zlz63HSsZVYzmgy8GaZjHVdKxlVjOaMSyiX8T+TkWMqsZdRHUS/h/KXgxkZeMjli+S8WX8R8pHnvH/YeNfR1J8lEuTLWr+pc/8AHLGLKxTFUeS0U0zpl/GFWiyKQfJaEn9lYyVKtCyg0TUuC0Z/s1zUaVjNryVUv2WjIhFjqRpD+kVNjqZzxY6ZWaVK6IyKJkYseLNM0qp2iyZBMopFZpVUUhkyaY6ZeaVVNkaHsm2aZqKrYUm2LZm2XmpVbCk2xbM2K1SqtgJZgL1Uqp0RY0ZckZM6Nfxy5EZCxYzNIlUoMpFlIsdEqp0ykWTixkyoVVky0WQixlIvNKqykMpEkx0y4VUUh0ySkMpFwqtZm4ikFhVLYUm2LYWFVWwpO4WFhVVsKTsLCqrYUnYWFVWwpOwsKqthSdhYVVbASsLA+LkZCTGbItnbn8cufwuwEwNYVUUh0yaYyZcTVEykWTTHTLhVVMZSJJjJlwqomOpE0x0yoVVTGTJJjJlwqrYykSsZMuFVbCxLCwqrYWJYWFVWwsSwsKqthYlhYVVsLEsLCqthYlhYVVsLEsLCqthYlhYVVsLEsLCv/9k='; // Base64 encoded blurlu resim
    img.onload = () => {
      imageRef.current = img;
      if (canvasRef.current) {
        drawCanvas(canvasRef.current, pieces);
      }
    };

    // Parçaları yükle
    const fetchPieces = async () => {
      try {
        const { data, error } = await supabase
          .from('pieces')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPieces(data || []);
      } catch (err) {
        console.error('Error fetching pieces:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPieces();
  }, [pieces, drawCanvas]);

  // Canvas yeniden çizim
  useEffect(() => {
    if (canvasRef.current) {
      drawCanvas(canvasRef.current, pieces, searchWallet);
    }
  }, [pieces, searchWallet, drawCanvas]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-purple-600">SolBlur</h1>
          <div className="w-full sm:w-96">
            <input
              type="text"
              placeholder="Search by wallet address..."
              onChange={(e) => debouncedSearchWithDelay(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="w-full h-full"
          />
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          {pieces.length} / 9999 pieces revealed
        </div>
      </div>
    </main>
  );
}
