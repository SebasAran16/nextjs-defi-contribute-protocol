import { useWeb3Contract } from "react-moralis";
import styles from "/styles/components/DoneeBox.module.css";
import { Input, Modal } from "web3uikit";
import { useNotification } from "@web3uikit/core";
import { useEffect, useState } from "react";
import abiDoc from "../../constants/defiContributeAbi.json";
import contractDoc from "../../constants/DefiContributeAddress.json";
import { ethers } from "ethers";
import { useMoralis } from "react-moralis";

export const DoneeBox = ({ cause, doneeId, message, address, path }) => {
  const dispatch = useNotification();
  const contractAddress = contractDoc.gor.contractAddress;
  const abi = abiDoc.abi;

  const { isWeb3Enabled, account, enableWeb3 } = useMoralis();

  const [modalVisible, setModalVisible] = useState(false);
  const [amountInput, setAmountInput] = useState();
  const [msgValue, setMsgValue] = useState();
  const [redFlags, setRedFlags] = useState();

  useEffect(() => {
    if (amountInput > 0) {
      setMsgValue(ethers.utils.parseEther(amountInput).toString());
    }
  }, [amountInput]);

  const getRedFlags = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const defiContribute = new ethers.Contract(contractAddress, abi, signer);
      const redFlags = await defiContribute.idToRedFlags(doneeId);
      setRedFlags(redFlags);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getRedFlags();
  });

  const { runContractFunction: donate } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: "donate",
    msgValue: msgValue,
    params: {
      _doneeId: doneeId,
      _wallet: address,
    },
  });

  return (
    <>
      <div className={styles.doneeContainer}>
        <div className={`${styles.causeRedFlagsContainer} ${styles.doneeItem}`}>
          <h3>{cause}</h3>
          <div className={styles.redFlagsContainer}>
            {redFlags > 0 ? (
              Array.from({ length: redFlags }, (_, i) => (
                <img
                  className={styles.redFlagImg}
                  key={i}
                  src="/red-flag.png"
                />
              ))
            ) : (
              <p>No Red Flags</p>
            )}
          </div>
        </div>
        <h4 className={styles.doneeItem}>Donee Id: {doneeId}</h4>
        {address == account ? (
          <h5 className={styles.doneeItem}>You</h5>
        ) : (
          <h5 className={styles.doneeItem}>
            {address.slice(0, 10)}...{address.slice(-8)}
          </h5>
        )}

        <p className={styles.doneeItem}>{message}</p>
        <div className={`${styles.buttonsContainer} ${styles.doneeItem}`}>
          {isWeb3Enabled && account ? (
            <>
              <button
                onClick={() => {
                  setModalVisible(true);
                }}
                className={styles.donateButton}
              >
                Donate
              </button>
              {/* <Link href={path || "/"}>
                <button>Go to Donee</button>
              </Link> */}
            </>
          ) : (
            "Not Connected"
          )}
        </div>
      </div>
      <Modal
        className={styles.donationModal}
        id="donationModal"
        title={`You are donating to ${cause}...`}
        isVisible={modalVisible}
        okText="Donate"
        onCloseButtonPressed={() => {
          setModalVisible(false);
        }}
        onCancel={() => {
          setModalVisible(false);
        }}
        onOk={async () => {
          await enableWeb3();
          await donate({
            onError: (error) => {
              dispatch({
                type: "error",
                title: "Donation Error",
                message: `Some error occurred on the transaction.`,
                position: "topR",
              });
              console.log(error);
            },
            onSuccess: () => {
              dispatch({
                type: "success",
                title: "Donation Successful",
                message: `You have donated to the donee with ID: ${doneeId} correctly!`,
                position: "topR",
              });
            },
          });
          setModalVisible(false);
        }}
      >
        <p>Type the amount you would like to contribute with</p>
        <div className={styles.donationInput}>
          <Input
            label="Amount on ETH"
            onChange={(event) => setAmountInput(event.target.value)}
          />
        </div>
      </Modal>
    </>
  );
};
