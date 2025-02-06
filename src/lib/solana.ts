import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';

// Solana bağlantısı (testnet)
export const connection = new Connection(clusterApiUrl('testnet'), {
  commitment: 'confirmed',
  wsEndpoint: 'wss://api.testnet.solana.com/',
});

if (!process.env.NEXT_PUBLIC_TARGET_WALLET_ADDRESS) {
  throw new Error('TARGET_WALLET_ADDRESS is not set');
}

export const TARGET_WALLET = new PublicKey(process.env.NEXT_PUBLIC_TARGET_WALLET_ADDRESS);

export async function getBalance(address: string): Promise<number> {
  try {
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error getting balance:', error);
    throw error;
  }
}

export async function getRecentTransactions(address: string, limit: number = 10) {
  try {
    const publicKey = new PublicKey(address);
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit });
    
    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        const tx = await connection.getTransaction(sig.signature);
        return {
          signature: sig.signature,
          timestamp: sig.blockTime ? new Date(sig.blockTime * 1000) : new Date(),
          amount: tx?.meta?.postBalances[0] || 0,
        };
      })
    );

    return transactions;
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
} 