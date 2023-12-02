import { useState, useEffect, createContext } from 'react';
import { ethers } from 'ethers';
import { contractAddress, presaleAbi } from '../data';

const PresaleContext = createContext();

const PresaleProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [currentAccount, setCurrentAccount] = useState('');
  const [currentEthBalance, setCurrentEthBalance] = useState(0);
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Connect to Metamask.
  const connectWallet = async (displayToast) => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        const account = accounts[0];
        setCurrentAccount(account);
        updateBalance();
        initializeEthers();
      } catch (error) {
        if (error.code === -32002) {
          //displayToast('Pending connection detected.', 'error');
          return;
        } else if (error.code === 4001) {
          //displayToast('Wallet connection canceled.', 'error');
        } else {
          //displayToast('Wallet connection error occured.', 'error');
        }

        console.error('Error connecting to Metamask', error);
      }
    } else {
      console.error('Ethereum object not found, install Metamask.');
      //displayToast('MetaMask not detected.', 'error');
    }
  };

  // Disconnect Metamask.
  const disconnectWallet = async () => {
    //displayToast('Wallet can only be fully disconnected on MetaMask.', 'info');
    clearWalletStates();
  };

  // Clear wallet states when disconnected.
  // Actual disconnection is done on Metamask
  // and we have no control over it.
  const clearWalletStates = () => {
    setProvider(null);
    setSigner(null);
    setCurrentAccount(null);
    updateBalance();
    setContract(null);
  };

  // Initialize Ethers.
  // The provider, signer and smart contract will be intialized here.
  // Each time a page loads or a metamask account is changed,
  // this will be called.
  const initializeEthers = async () => {
    const newProvider = new ethers.BrowserProvider(window.ethereum);
    const newSigner = await newProvider.getSigner();
    const newContract = new ethers.Contract(
      contractAddress,
      presaleAbi,
      newSigner
    );
    setProvider(newProvider);
    setSigner(newSigner);
    setContract(newContract);
  };

  // Update ETH balance.
  const updateBalance = async () => {
    if (window.ethereum) {
      try {
        // Request account access if needed
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        const account = accounts[0];

        // Fetch the balance in Wei
        const balanceWei = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [account, 'latest'],
        });

        console.log('Balance: ', balanceWei);

        // Convert Wei to Ether
        const balanceEth = parseInt(balanceWei, 16) / 1e18;

        // Update the state with the new balance
        setCurrentEthBalance(balanceEth.toString());
      } catch (error) {
        console.error('Error updating balance: ', error);
      }
    } else {
      console.log('Please install MetaMask!');
    }
  };

  // Handle Metamask account change.
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        // Added async
        if (accounts.length > 0) {
          setCurrentAccount(accounts[0]);
          updateBalance();
          await initializeEthers(); // Await initializeEthers.
        } else {
          clearWalletStates();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  // Load initial connected account on first page load.
  useEffect(() => {
    const loadConnectedAccount = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          if (accounts.length > 0) {
            setCurrentAccount(accounts[0]);
            updateBalance();
            initializeEthers();
          }
        } catch (error) {
          console.error('Error loading connected account', error);
        }
      }
    };

    loadConnectedAccount();

    // Listener for account changes.
    window.ethereum?.on('accountsChanged', (accounts) => {
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
        updateBalance();
        initializeEthers();
      } else {
        clearWalletStates();
      }
    });

    // Listener for network changes.
    window.ethereum?.on('chainChanged', () => {
      window.location.reload();
    });
  }, []);

  // Contract function:

  return (
    <PresaleContext.Provider
      value={{
        currentAccount,
        currentEthBalance,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </PresaleContext.Provider>
  );
};

export { PresaleContext, PresaleProvider };
