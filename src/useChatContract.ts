import { ethers } from "ethers";
import { useState, useEffect } from "react";

const useChatContract = (
  contractAddress: string,
  web3ChatAbi: ethers.ContractInterface,
  account?: string
): ethers.Contract | undefined => {
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>();
  const [webThreeProvider, setWebThreeProvider] =
    useState<ethers.providers.Web3Provider>();
  const { ethereum } = window;

  useEffect(() => {
    if (ethereum) {
      setWebThreeProvider(new ethers.providers.Web3Provider(window.ethereum));
    }
  }, [ethereum]);

  useEffect(() => {
    if (webThreeProvider && account) {
      setSigner(webThreeProvider.getSigner());
    }
  }, [account, webThreeProvider]);

  if (!contractAddress || !web3ChatAbi || !ethereum || !webThreeProvider)
    return;

  /**
   * Returns a new instance of the Contract.
   * By passing in a Provider, this will return a downgraded Contract which only has read-only access (i.e. constant calls).
   * By passing a signer (a logged in user), this will return a Contract with read and write access.
   */
  return new ethers.Contract(
    contractAddress,
    web3ChatAbi,
    signer || webThreeProvider
  );
};

export default useChatContract;
