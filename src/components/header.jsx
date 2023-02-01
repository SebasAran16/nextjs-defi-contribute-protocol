import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "/styles/Header.module.css";
import { ConnectButton } from "./connect-button";
import { Modal, Input } from "web3uikit";
import { useNotification } from "@web3uikit/core";
import { useMoralis, useWeb3Contract, useChain } from "react-moralis";
import abiImport from "../../constants/defiContributeAbi.json";
import contract from "../../constants/DefiContributeAddress.json";
import { ethers } from "ethers";
import { useRouter } from "next/router";

export const Header = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [doneeStatus, setDoneeStatus] = useState();
  const [becomeDoneeVisible, setBecomeDoneeVisible] = useState(false);
  const [cause, setCause] = useState();
  const [messageToBecome, setMessageToBecome] = useState();
  const contractAddress = contract.gor.contractAddress;
  const abi = abiImport.abi;

  const { account, isWeb3Enabled, enableWeb3 } = useMoralis();
  const { chainId } = useChain();
  const dispatch = useNotification();
  const router = useRouter();

  const handleChainDif = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${Number(5).toString(16)}` }],
      });
    } catch (switchError) {
      if (switchError == 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x05",
                chainName: "Goerli",
                rpcUrls: ["https://..."],
              },
            ],
          });
        } catch (addError) {
          console.log(addError);
        }
      }
      dispatch({
        type: "error",
        title: "Network Switch Issue",
        message:
          "We had an issue when trying to switch your network to Goerli. Please switch manually.",
        position: "topR",
      });
      console.log(switchError);
    }
  };

  const toggleNav = () => {
    const nav = document.querySelector("nav");
    nav.classList.toggle("Header_hiddenNav__llBhf");
  };

  const closeNav = () => {
    const nav = document.querySelector("nav");
    nav.classList.add("Header_hiddenNav__llBhf");
  };

  const hideSwiper = () => {
    if (router.asPath == "/") {
      const swiper = document.querySelector("#Home_swiper__7QPjA");
      swiper.classList.add("Home_backgroundSwipper__EXNkx");
    }
  };

  const showSwiper = () => {
    if (router.asPath == "/") {
      const swiper = document.querySelector("#Home_swiper__7QPjA");
      swiper.classList.remove("Home_backgroundSwipper__EXNkx");
    }
  };

  const { runContractFunction: sendDoneePetition } = useWeb3Contract({
    abi,
    contractAddress,
    functionName: "doneePetition",
    params: { _message: message },
  });

  const { runContractFunction: becomeDonee } = useWeb3Contract({
    contractAddress,
    abi,
    functionName: "becomeDonee",
    params: { _cause: cause, _message: messageToBecome },
  });

  const getDoneeStatus = async () => {
    if (isWeb3Enabled) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const defiContribute = new ethers.Contract(
          contractAddress,
          abi,
          signer
        );
        const status = await defiContribute.doneeToStatus(account);
        setDoneeStatus(status);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // useEffect(() => {
  //   const navBar = document.querySelector("#Header_mainContainer__4f0nE");
  //   const sticky = navBar.offsetHeight;

  //   const handleScroll = () => {
  //     if (window.scrollY >= sticky) {
  //       navBar.classList.add("Header_stickyHeader__vlPGk");
  //     } else {
  //       navBar.classList.remove("Header_stickyHeader__vlPGk");
  //     }
  //   };

  //   window.addEventListener("scroll", handleScroll);

  //   return () => {
  //     window.removeEventListener("scroll", handleScroll);
  //   };
  // }, []);

  useEffect(() => {
    if (chainId != "0x5") {
      handleChainDif();
    }
  }, [chainId]);

  useEffect(() => {
    getDoneeStatus();
    console.log(doneeStatus);
  }, [modalVisible, account]);

  return (
    <header id={styles.headerBar}>
      <div className={styles.headerLeft}>
        <Link href="/" className={styles.logoLink} onClick={() => closeNav()}>
          <Image
            id={styles.logoImage}
            src="/Logo.png"
            alt="Logo Image"
            width={45}
            height={45}
          />
        </Link>
      </div>
      <div className={styles.headerRight}>
        <Modal
          cancelText="Cancel"
          title={"Become a Donee!"}
          isVisible={becomeDoneeVisible}
          okText="Become Donee"
          onCancel={() => {
            setBecomeDoneeVisible(false);
            showSwiper();
          }}
          onCloseButtonPressed={() => {
            setBecomeDoneeVisible(false);
            showSwiper();
          }}
          onOk={async () => {
            await enableWeb3();
            await becomeDonee({
              onError: (error) => {
                dispatch({
                  type: "error",
                  title: "Not a donee",
                  message:
                    "Some error happened and you could not become a donee.",
                  position: "topR",
                });
                console.log(error);
              },
              onSuccess: () => {
                dispatch({
                  type: "success",
                  title: "You are a donee!",
                  message: "You have successfully become a donee!",
                  position: "topR",
                });
              },
            });
          }}
        >
          <p className={styles.modalItem}>
            Set the information that will be displayed on your account as donee:
          </p>
          <div className={styles.becomeDoneeInput}>
            <Input
              label="Cause"
              className={styles.modalItem}
              name="Description of the cause the funds will go "
              onChange={(event) => {
                setCause(event.target.value);
              }}
            />
          </div>
          <div className={styles.becomeDoneeInput}>
            <Input
              label="Message"
              className={styles.modalItem}
              name="Further explanation about the cause"
              onChange={(event) => {
                setMessageToBecome(event.target.value);
              }}
            />
          </div>
        </Modal>
        <nav className={`${styles.navBar} ${styles.hiddenNav}`}>
          <div className={styles.navPartOne}>
            <Image
              src="/cross-icon.png"
              alt="Cross Image"
              className={styles.navCloser}
              onClick={() => {
                closeNav();
                showSwiper();
              }}
              width={30}
              height={30}
            />
            <Link
              className={styles.navFirstItem}
              href="/"
              onClick={() => {
                closeNav();
              }}
            >
              Home
            </Link>
            <Link
              className={styles.navFirstItem}
              href="/app/donate"
              onClick={() => {
                closeNav();
              }}
            >
              Donate
            </Link>
            <Link
              className={styles.navFirstItem}
              href="/app/donees"
              onClick={() => {
                closeNav();
              }}
            >
              Donee Area
            </Link>
            <Link
              className={styles.navFirstItem}
              href="/app/admin"
              onClick={() => {
                closeNav();
              }}
            >
              Admin
            </Link>
            <Link
              className={styles.navFirstItem}
              href="/about-us"
              onClick={() => {
                closeNav();
              }}
            >
              About Us
            </Link>
          </div>
          <div className={styles.navPartTwo}>
            {doneeStatus == 2 ? (
              <div className={styles.approvedDonee}>
                <p>You have been accepted as Donee!</p>
                <button
                  onClick={() => {
                    setBecomeDoneeVisible(true);
                    hideSwiper();
                  }}
                >
                  Become a Donee!
                </button>
              </div>
            ) : doneeStatus == 4 ? (
              <div>You are a donee</div>
            ) : doneeStatus == 5 ? (
              <p>You have been eliminated as Donee</p>
            ) : (
              <button
                className={`${styles.navSecondItem} ${styles.beDonee}`}
                onClick={() => {
                  setModalVisible(true);
                  hideSwiper();
                }}
              >
                Become a Donee!
              </button>
            )}
          </div>
        </nav>
        <ConnectButton />
        <Image
          src="/menu.png"
          id={styles.menuImg}
          alt="Menu Image"
          className={styles.navToggler}
          onClick={() => {
            toggleNav();
            hideSwiper();
          }}
          width={30}
          height={30}
        />
      </div>
      <Modal
        className={styles.doneePetitionModal}
        title={"Send Donee petition!"}
        isVisible={modalVisible}
        okText="Send Donee petition"
        onCloseButtonPressed={() => {
          setModalVisible(false);
          showSwiper();
        }}
        onCancel={() => {
          setModalVisible(false);
          showSwiper();
        }}
        onOk={async () => {
          await getDoneeStatus();
          if (doneeStatus == 1) {
            dispatch({
              type: "info",
              title: "Already Pending...",
              message:
                "You have already sent a Donee Petition. Please wait until we can evaluate your petition.",
              position: "topR",
            });
            setModalVisible(false);
            closeNav();
            return;
          }
          await enableWeb3();
          await sendDoneePetition({
            onError: (error) => {
              dispatch({
                type: "error",
                title: "Petitioin not sent",
                message: "We could not send the petition by an error.",
                position: "topR",
              });
              console.log(error);
            },
            onSuccess: () => {
              dispatch({
                type: "success",
                title: "Petitioin Sent!",
                message:
                  "You have sent the petition. Please wait until we can evaluate your petition.",
                position: "topR",
              });
            },
          });
          setModalVisible(false);
          closeNav();
        }}
      >
        <h4>
          Explain why you want to become a donee and how you have previously
          managed donations.
        </h4>
        <p>
          (For it to be cheaper on blockchain, we recomed to use the following
          form and send the link in the message...)
        </p>
        <div className={styles.messageInput}>
          <Input
            label="Message"
            name="Message Input"
            onChange={(event) => {
              setMessage(event.target.value);
            }}
          />
        </div>
      </Modal>
    </header>
  );
};
