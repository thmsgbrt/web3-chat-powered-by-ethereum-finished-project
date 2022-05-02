import React, { useEffect, useState } from "react";
import { Message } from "../types";
import ChatBubble from "./ChatBubble";
import { ethers } from "ethers";

interface Props {
  account?: string;
  chatContract: ethers.Contract | undefined;
}

const Chat = ({ account, chatContract }: Props) => {
  const [textareaContent, setTextareaContent] = useState("");
  const [txnStatus, setTxnStatus] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>();

  const getMessages = async () => {
    if (!chatContract || account) return;

    const messages = await chatContract.getMessages();
    setMessages(() => {
      return messages.map((w: any) => ({
        address: w.sender,
        date: w.timestamp._hex,
        content: w.content,
      }));
    });
  };

  const setupMessageListener = (): ethers.Contract | void => {
    if (!chatContract) return;

    const msgListener = chatContract.on(
      "NewMessage",
      (address, timestamp, content, _style) => {
        setMessages((prev) => {
          const newMessage = {
            address,
            date: timestamp._hex,
            content,
          };
          return prev ? [...prev, newMessage] : [newMessage];
        });
      }
    );

    return msgListener;
  };

  const sendMessage = async () => {
    if (!chatContract) return;
    try {
      setTxnStatus("WAIT");
      const messageTxn = await chatContract.sendMessage(textareaContent);
      setTxnStatus("SENDING");
      await messageTxn.wait();
    } catch (e) {
      console.warn("Transaction failed with error", e);
    } finally {
      setTextareaContent("");
      setTxnStatus(null);
    }
  };

  useEffect(() => {
    if (!chatContract || messages) return;
    getMessages();
    setupMessageListener();
  }, [chatContract]);

  return (
    <div className="chat">
      <div className="chat__messages">
        {!chatContract && (
          <p className="state-message">
            Connect to the chat in order to see the messages!
          </p>
        )}
        {account && messages && messages.length === 0 && (
          <p className="state-message">There is no message to display</p>
        )}
        {messages &&
          messages.length > 0 &&
          messages.map((m, i) => (
            <ChatBubble
              key={i}
              ownMessage={m.address === account}
              address={m.address}
              message={m.content}
            />
          ))}
      </div>
      <div className="chat__actions-wrapper">
        {!account && (
          <p className="state-message">Connect With Metamask to chat!</p>
        )}
        <div className="chat__input">
          <textarea
            disabled={!!txnStatus || !account}
            value={textareaContent}
            onChange={(e) => {
              setTextareaContent(e.target.value);
            }}
          ></textarea>
          <button onClick={sendMessage} disabled={!!txnStatus || !account}>
            {txnStatus || "send message"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
