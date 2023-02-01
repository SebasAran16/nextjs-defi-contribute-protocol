import { useEffect, useState } from "react";
import { useMoralis, useNativeBalance } from "react-moralis";
import { useNotification } from "@web3uikit/core";
import { ENSAvatar } from "web3uikit";
import styles from "/styles/ConnectButton.module.css";

export const ConnectButton = () => {
  const {
    enableWeb3,
    isWeb3Enabled,
    account,
    isInitialized,
    deactivateWeb3,
    isWeb3EnableLoading,
  } = useMoralis();

  const {
    geteBalances,
    data: balance,
    nativeToken,
    error,
    isLoading,
  } = useNativeBalance();

  const dispatch = useNotification();

  let [hasWallet, setHasWallet] = useState();

  useEffect(() => {
    window.ethereum ? setHasWallet(true) : setHasWallet(false);
  }, []);

  useEffect(() => {
    if (isWeb3Enabled) {
      window.localStorage.setItem("connected", "injected");
      return;
    }

    if (typeof window !== "undefined") {
      if (window.localStorage.getItem("connected") == "injected") {
        enableWeb3();
      }
    }
  }, [isWeb3Enabled]);

  useEffect(() => {
    if (account == null) {
      window.localStorage.removeItem("connected");
      deactivateWeb3();
    }
  }, [account]);

  const connect = async () => {
    try {
      await enableWeb3();
      window.localStorage.setItem("connected", "injected");
      dispatch({
        type: "info",
        message: "You have successfully connected!",
        title: "Wallet Connected!",
        position: "topR",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const disconnect = async () => {
    try {
      window.localStorage.removeItem("provider");
      window.localStorage.removeItem("connected");
      await deactivateWeb3();
      if (isInitialized) await logout();
      dispatch({
        type: "info",
        message: "You have disconnected your wallet",
        title: "Wallet Disconnected",
        position: "topR",
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {
        (hasWallet = true ? (
          isWeb3Enabled && account ? (
            <div className={styles.accountContainer}>
              <div id={styles.avatarAndAddress}>
                <ENSAvatar address={account} size={30} />
                {/* <p>{`Balance: ${balance.formatted}`}</p> */}
                <p>{`${account.slice(0, 6)}...${account.slice(-4)}`}</p>
              </div>

              <button id={styles.disconnectButton} onClick={disconnect}>
                Disconnect
              </button>
            </div>
          ) : isWeb3EnableLoading ? (
            <p>Connecting Wallet...</p>
          ) : (
            <button id={styles.connectButton} onClick={connect}>
              Connect Wallet
            </button>
          )
        ) : (
          <p>Please install Metamask</p>
        ))
      }
    </>
  );
};
