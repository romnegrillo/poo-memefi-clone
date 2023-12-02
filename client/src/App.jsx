import { useContext } from 'react';
import { PresaleContext } from './context/PresaleContext';
import shortenAddress from './utils/shortenAddress';

const App = () => {
  return (
    <div className="container mx-auto px-4">
      <Header />
      <Hero />
      <Footer />
    </div>
  );
};

const Header = () => {
  const { currentAccount, connectWallet, disconnectWallet } =
    useContext(PresaleContext);

  return (
    <header>
      <nav className="flex justify-between py-4">
        <h1 className="text-2xl font=bold">Poo Token Clone</h1>

        {!currentAccount && (
          <button
            className="bg-blue-400 text-white font-semibold px-4 py-2 rounded-md"
            onClick={connectWallet}
          >
            Connect MetaMask
          </button>
        )}

        {currentAccount && (
          <button
            className="bg-blue-400 text-white font-semibold px-4 py-2 rounded-md"
            onClick={disconnectWallet}
          >
            {shortenAddress(currentAccount)}
          </button>
        )}
      </nav>
    </header>
  );
};

const Hero = () => {
  const { currentAccount, currentEthBalance } = useContext(PresaleContext);
  return (
    <section className="h-screen">
      <p>
        Current Account:{' '}
        {currentAccount
          ? shortenAddress(currentAccount)
          : 'Please connect your wallet'}
      </p>
      <p>
        Current ETH:{' '}
        {currentAccount ? currentEthBalance : 'Please connect your wallet'}
      </p>
    </section>
  );
};

const Footer = () => {
  return (
    <footer>
      <p>Footer</p>
    </footer>
  );
};

export default App;

