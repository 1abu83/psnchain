'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../../lib/api';
import { createWalletFromPrivateKey, generateNewWallet } from '../../lib/wallet-utils';

// Initial state
const initialState = {
  wallet: null,
  balance: null,
  transactions: [],
  tokens: [],
  pools: [],
  blockchainInfo: null,
  loading: false,
  error: null,
  connected: false,
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_WALLET: 'SET_WALLET',
  SET_BALANCE: 'SET_BALANCE',
  SET_TRANSACTIONS: 'SET_TRANSACTIONS',
  SET_TOKENS: 'SET_TOKENS',
  SET_POOLS: 'SET_POOLS',
  SET_BLOCKCHAIN_INFO: 'SET_BLOCKCHAIN_INFO',
  SET_CONNECTED: 'SET_CONNECTED',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
function walletReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ActionTypes.SET_WALLET:
      return { ...state, wallet: action.payload };
    case ActionTypes.SET_BALANCE:
      return { ...state, balance: action.payload };
    case ActionTypes.SET_TRANSACTIONS:
      return { ...state, transactions: action.payload };
    case ActionTypes.SET_TOKENS:
      return { ...state, tokens: action.payload };
    case ActionTypes.SET_POOLS:
      return { ...state, pools: action.payload };
    case ActionTypes.SET_BLOCKCHAIN_INFO:
      return { ...state, blockchainInfo: action.payload };
    case ActionTypes.SET_CONNECTED:
      return { ...state, connected: action.payload };
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
}

// Context
const WalletContext = createContext();

// Provider component
export function WalletProvider({ children }) {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  // Check API connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Load wallet from localStorage on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('psnchain_wallet');
    if (savedWallet) {
      try {
        const wallet = JSON.parse(savedWallet);
        dispatch({ type: ActionTypes.SET_WALLET, payload: wallet });
        loadWalletData(wallet.address);
      } catch (error) {
        console.error('Failed to load saved wallet:', error);
      }
    }
  }, []);

  // Helper functions
  const setLoading = (loading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  };

  const clearError = () => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  };

  // API functions
  const checkConnection = async () => {
    try {
      setLoading(true);
      const health = await api.getHealth();
      dispatch({ type: ActionTypes.SET_CONNECTED, payload: health.status === 'OK' });

      // Load initial data
      await loadTokens();
      await loadPools();
      await loadBlockchainInfo();
    } catch (error) {
      console.error('Connection check failed:', error);
      dispatch({ type: ActionTypes.SET_CONNECTED, payload: false });
      setError('Failed to connect to PSNChain API');
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async () => {
    try {
      setLoading(true);
      clearError();

      // Generate wallet on client-side so the private key never leaves the device
      const wallet = await generateNewWallet();

      dispatch({ type: ActionTypes.SET_WALLET, payload: wallet });

      // Save to localStorage
      localStorage.setItem('psnchain_wallet', JSON.stringify(wallet));

      // Load wallet data
      await loadWalletData(wallet.address);

      return wallet;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const importWallet = async (privateKey) => {
    try {
      setLoading(true);
      clearError();

      // Create wallet from private key using utility function
      const wallet = await createWalletFromPrivateKey(privateKey);

      dispatch({ type: ActionTypes.SET_WALLET, payload: wallet });

      // Save to localStorage
      localStorage.setItem('psnchain_wallet', JSON.stringify(wallet));

      // Load wallet data
      await loadWalletData(wallet.address);

      return wallet;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadWalletData = async (address) => {
    if (!address) return;

    try {
      // Load balance
      const balanceResponse = await api.getBalance(address);
      if (balanceResponse.success) {
        dispatch({ type: ActionTypes.SET_BALANCE, payload: balanceResponse.data });
      }

      // Load transaction history
      const txResponse = await api.getTransactionHistory(address);
      if (txResponse.success) {
        dispatch({ type: ActionTypes.SET_TRANSACTIONS, payload: txResponse.data });
      }
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    }
  };

  const sendTransaction = async (transactionData) => {
    try {
      setLoading(true);
      clearError();

      const response = await api.sendTransaction(transactionData);
      if (response.success) {
        // Refresh wallet data
        if (state.wallet) {
          await loadWalletData(state.wallet.address);
        }
        return response.data;
      } else {
        throw new Error(response.error || 'Transaction failed');
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const mineBlock = async () => {
    if (!state.wallet) {
      throw new Error('No wallet connected');
    }

    try {
      setLoading(true);
      clearError();

      const response = await api.mineBlock(state.wallet.address);
      if (response.success) {
        // Refresh data
        await loadWalletData(state.wallet.address);
        await loadBlockchainInfo();
        return response.data;
      } else {
        throw new Error(response.error || 'Mining failed');
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadTokens = async () => {
    try {
      const response = await api.getTokens();
      if (response.success) {
        dispatch({ type: ActionTypes.SET_TOKENS, payload: response.data });
      }
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
  };

  const loadPools = async () => {
    try {
      const response = await api.getPools();
      if (response.success) {
        dispatch({ type: ActionTypes.SET_POOLS, payload: response.data });
      }
    } catch (error) {
      console.error('Failed to load pools:', error);
    }
  };

  const loadBlockchainInfo = async () => {
    try {
      const response = await api.getBlockchainInfo();
      if (response.success) {
        dispatch({ type: ActionTypes.SET_BLOCKCHAIN_INFO, payload: response.data });
      }
    } catch (error) {
      console.error('Failed to load blockchain info:', error);
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem('psnchain_wallet');
    dispatch({ type: ActionTypes.SET_WALLET, payload: null });
    dispatch({ type: ActionTypes.SET_BALANCE, payload: null });
    dispatch({ type: ActionTypes.SET_TRANSACTIONS, payload: [] });
    
    // Redirect to welcome page
    if (typeof window !== 'undefined') {
      window.location.href = '/welcome';
    }
  };

  const value = {
    ...state,
    // Actions
    createWallet,
    importWallet,
    sendTransaction,
    mineBlock,
    loadWalletData,
    loadTokens,
    loadPools,
    loadBlockchainInfo,
    disconnectWallet,
    checkConnection,
    clearError,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// Hook to use wallet context
export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}