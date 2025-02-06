import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('Missing SUPABASE_URL');
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) throw new Error('Missing SUPABASE_ANON_KEY');

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export interface Piece {
  id: number;
  piece_id: number;
  wallet_address: string;
  transaction_id: number;
  created_at: string;
}

export interface Transaction {
  id: number;
  signature: string;
  wallet_address: string;
  amount: number;
  created_at: string;
}

export async function searchPiecesByWallet(walletAddress: string): Promise<Piece[]> {
  const { data, error } = await supabase
    .from('pieces')
    .select('*')
    .ilike('wallet_address', `%${walletAddress}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getWalletPieces(walletAddress: string): Promise<Piece[]> {
  const { data, error } = await supabase
    .from('pieces')
    .select('*')
    .eq('wallet_address', walletAddress);

  if (error) throw error;
  return data || [];
}

export async function getWalletTransactions(walletAddress: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('wallet_address', walletAddress)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
} 