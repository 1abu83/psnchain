"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../providers/wallet-provider';
import { AlertTriangle } from 'lucide-react';
import { importWalletFromJSON, validatePrivateKey, createWalletFromPrivateKey, exportWallet } from '../../lib/wallet-utils';

export default function WalletPage() {
  const { wallet, importWallet } = useWallet();
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState({ address: false, privateKey: false });
  const [importKey, setImportKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(prev => ({ ...prev, [type]: true }));
      setTimeout(() => setCopied(prev => ({ ...prev, [type]: false })), 2000);
    } catch {}
  };

  const downloadBackup = () => {
    if (!wallet) return;
    const data = exportWallet(wallet);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `psnchain-wallet-${wallet.address.substring(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    setError('');
    setSuccess('');
    setIsImporting(true);
    try {
      if (!importKey.trim()) throw new Error('Please enter a private key');
      const validation = validatePrivateKey(importKey.trim());
      if (!validation.valid) throw new Error(validation.error);
      const newWallet = await createWalletFromPrivateKey(importKey.trim());
      await importWallet(newWallet.privateKey);
      setSuccess('Wallet imported successfully');
      setImportKey('');
    } catch (e) {
      setError(e.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = e.target.result;
        const imported = await importWalletFromJSON(jsonData);
        setImportKey(imported.privateKey);
        setError('');
      } catch (err) {
        setError(err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <motion.div
          className="glass p-8 rounded-2xl border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-6">Wallet</h1>

          {/* Current Wallet */}
          {wallet ? (
            <div className="space-y-6">
              <div className="bg-card/30 backdrop-blur-sm p-4 rounded-xl border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Address</span>
                  <button onClick={() => copyToClipboard(wallet.address, 'address')} className="text-xs px-2 py-1 bg-blue-500/10 text-blue-500 rounded-lg">
                    {copied.address ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm font-mono break-all text-foreground">{wallet.address}</p>
              </div>

              <div className="bg-card/30 backdrop-blur-sm p-4 rounded-xl border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Private Key</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowPrivateKey(!showPrivateKey)} className="text-xs px-2 py-1 bg-gray-500/10 text-gray-500 rounded-lg">
                      {showPrivateKey ? 'Hide' : 'Show'}
                    </button>
                    <button onClick={() => copyToClipboard(wallet.privateKey, 'privateKey')} className="text-xs px-2 py-1 bg-blue-500/10 text-blue-500 rounded-lg">
                      {copied.privateKey ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <p className="text-sm font-mono break-all text-foreground">{showPrivateKey ? wallet.privateKey : '•'.repeat(64)}</p>
              </div>

              <div className="flex gap-3">
                <button onClick={downloadBackup} className="px-4 py-2 bg-card/50 border border-border/50 rounded-xl">Download Backup (JSON)</button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm text-yellow-700">
              No wallet connected. Create or import a wallet below.
            </div>
          )}

          {/* Import Section */}
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Import Wallet</h2>
            <div className="space-y-3">
              <textarea
                value={importKey}
                onChange={(e) => setImportKey(e.target.value)}
                placeholder="Paste your private key here..."
                className="w-full px-4 py-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-none h-24 font-mono text-sm"
              />
              <div className="flex gap-3">
                <button onClick={handleImport} disabled={isImporting || !importKey.trim()} className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl disabled:opacity-50">
                  {isImporting ? 'Importing...' : 'Import from Private Key'}
                </button>
                <label className="px-4 py-2 bg-card/50 border border-border/50 rounded-xl cursor-pointer">
                  Upload Wallet File (JSON)
                  <input type="file" accept=".json" className="hidden" onChange={handleFileImport} />
                </label>
              </div>
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-600 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-600">
                  {success}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

