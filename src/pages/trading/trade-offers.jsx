import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import Modal from "react-modal";
import ButtonPrimary from "../../component/basic/btn-primary";
import { GetOffer } from "../../js/api_nft";
import { FaExchangeAlt } from "react-icons/fa";
import { VscRefresh } from "react-icons/vsc";
import { FaRegTrashAlt } from "react-icons/fa";
import {
    AiOutlineLoading3Quarters,
    AiOutlineCheckCircle,
  } from "react-icons/ai";

const customModalStyles = {
    overlay: {
      backgroundColor: " rgba(0, 0, 0, 0.4)",
      width: "100%",
      height: "100vh",
      zIndex: "10",
      position: "fixed",
      top: "0",
      left: "0",
    },
    content: {
      width: "500px",
      height: "480px",
      zIndex: "150",
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -70%)",
      borderRadius: "10px",
      borderColor: "rgb(0,0,0)",
      boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
      color: "white",
      backgroundColor: "#1A203C",
      justifyContent: "center",
      overflow: "auto",
    },
  };


export default function TradingOffer() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedTab = searchParams.get("selectedTab");
  console.log(`selectedTab : `, selectedTab);
  const [selectedTabByUser, setselectedTabByUser] = useState(selectedTab);

  const selectList = [
    "Sent", "Received"
  ]

  const renderUI = () => {
    if (selectedTabByUser === "Sent") {
      return <TabSend />;
    } else if (selectedTabByUser === "Received") {
      return <TabReceive />;
    }
  };

  return (
    <>

<div className="mt-5 grid grid-cols-1 lg:grid-cols-2">
        <div className="text-2xl font-bold">Trade Offers</div>
        
      </div>

    <div className="my-10 grid grid-cols-5">
          {selectList.map((item) => {
            return (
              <SelectBtn
                key={item}
                text={item}
                onClick={setselectedTabByUser}
                isClick={selectedTabByUser === item ? true : false}
              />
            );
          })}
    </div>
      {renderUI()}
    </>
  );
}

function SelectBtn({text, isClick, onClick}) {
    const handleClick = () => {
      console.log("handleClick 호출");
      onClick(text);  
    }
  
    return (
      <button
        className={`${
          isClick === true ? "border-b-4 border-orange-400 text-white" : "border-b border-slate-500 text-slate-500"
        } hover:text-white font-bold pb-2`}
        onClick={handleClick}
      >
        {text}
      </button>
    );
  }

function TabSend(params) {

  const navigate = useNavigate();
  const [sendOffers, setSendOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState('');

  const handleSelectOffer = (item) => {
    console.log("handleSelectOffer 호출", item);
    setSelectedOffer(item);
  }
  
  
  const [isMoreData, setIsMoreData] = useState(false);
  const [page, setPage] = useState(1);
  let perPage = 6;

  useEffect(() => {
    getSenderOffer()
  }, [page]);

  const handleLoadMore = () => {
    console.log("handleLoadMore 호출");
    setPage((prev) => prev + 1);
  };

  const user_name = localStorage.getItem('account_name');
  async function getSenderOffer() {
    const params = {
        datas: {
          sort_type: "sender",
          scope : user_name,
          bound: [user_name, user_name],
          page: page,
          perPage: perPage,
        },
      };
      console.log(`load data - `, params);
      const offerInfo = await GetOffer(params);

      console.log(`offerInfo : `, offerInfo);
      setSendOffers((prev) => [...prev, ...offerInfo]);
      if(page === 1) {
        setSelectedOffer(offerInfo[0])
      }
      if (offerInfo.length < perPage) {
        setIsMoreData(false);
      } else {
        setIsMoreData(true);
      }
  }


  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-4">
          {sendOffers.map((item) => (
            <OfferSentItem
              key={item.offer_id}
              offer_info={item}
              handleSelectOffer={handleSelectOffer}
            />
          ))}
          {isMoreData && (
            <div className="mx-4 mt-10 flex justify-center">
              <button
                className="border-2 flex items-center rounded-xl py-4 px-20"
                onClick={handleLoadMore}
              >
                <VscRefresh size={25} />
                <div className="ml-2 text-lg font-bold ">Load More</div>
              </button>
            </div>
          )}
        </div>
        {sendOffers.length !== 0 ? (
          <div className="col-span-8">
            <SelectedSentOffer
              offer_info={selectedOffer}
              getSenderOffer={getSenderOffer}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}

function OfferSentItem({offer_info, handleSelectOffer}) {

  return (
    <>
      <div 
        className="my-2 p-8 grid grid-cols-2 gap-10 justify-items-center bg-card rounded-xl"
        onClick={()=>handleSelectOffer(offer_info)}
      >
        <div className="flex flex-col justify-center text-xl">
            <div>
                Sent to
            </div>
            <div className="mt-2 font-bold">
                {offer_info.recipient}                           
            </div>
        </div>
        <div className="flex items-center">
            <div className="p-4">
                <img className="w-20 rounded-lg" src={offer_info.sender_asset_img}></img>
            </div>
            <FaExchangeAlt size={20} />
            <div className="p-4">
                <img className="w-20 rounded-lg" src={offer_info.recipient_asset_img}></img>
            </div>
            
        </div>
      </div>
    </>
  );
}

function SelectedSentOffer({offer_info, getSenderOffer}) {
  const {
    isLogin,
    setIsLogin,
    ref_user_data,
    ref_trx_data,
    ref_wallet_start,
    ref_status,
    ref_result,
    ref_wallet_finish,
  } = useOutletContext();
  console.log(`SelectedSentOffer : `, useOutletContext());

  const handleCancelOffer = () => {
    console.log("handleCancelOffer 호출");

    openWaitingModal();
    const new_data = [
      {
        action_account: "eosio.nft",
        action_name: "canceloffer",
        data: {
          offer_id: offer_info.offer_id,
        },
      },
    ];

    console.log(`ref_trx_data : `, ref_trx_data);
    console.log(`ref_trx_data : `, ref_trx_data.ref_trx_data);

    ref_trx_data.ref_trx_data.current.value = JSON.stringify(new_data);
    ref_user_data.ref_user_data.current.value =
      localStorage.getItem("account_name");
    if (
      ref_wallet_start.ref_wallet_start.current &&
      ref_wallet_finish.ref_wallet_finish.current
    ) {
      console.log(
        `트랜잭션 발생 버튼 클릭시키기123..`,
        ref_trx_data.ref_trx_data.current.value,
        ref_user_data.ref_user_data.current.value
      );
      ref_wallet_finish.ref_wallet_finish.current.addEventListener(
        "click",
        handleCompleteTrx
      );
      ref_wallet_start.ref_wallet_start.current.click();
    }
  };

  // 모달 창 관련 변수
  const [modalWaitingIsOpen, setModalWaitingIsOpen] = useState(false);
  const [modalSuccessIsOpen, setModalSuccessIsOpen] = useState(false);

  // 트랜잭션 대기 관련 모달..?
  function openWaitingModal() {
    setModalWaitingIsOpen(true);
  }

  function closeWaitingModal() {
    setModalWaitingIsOpen(false);
  }

  function afterWaitingModal() {
    console.log("트랜잭션 실행");
  }

  // 트랜잭션 성공 시 모달

  const [trxId, setTrxId] = useState("");
  const [shortId, setShortId] = useState("");
  function openSuccessModal(trx_id) {
    setModalSuccessIsOpen(true);
    console.log(`성공 모달 띄어짐`);
    setTrxId(trx_id);
    setShortId(short_trx_id(trx_id));
  }

  function short_trx_id(keyString) {
    const maxLength = 10; // 원하는 최대 길이

    if (keyString.length <= maxLength) {
      return keyString;
    }

    const shortenedKey = `${keyString.substring(
      0,
      maxLength / 2
    )}...${keyString.substring(keyString.length - maxLength / 2)}`;
    return shortenedKey;
  }

  function closeSuccessModal() {
    setModalSuccessIsOpen(false);
    // navigate(`/profile?selectedTab=Bought`);
    // getSenderOffer(); // 화면 갱신
  }

  function afterSuccessModal() {}

  const handleCompleteTrx = () => {
    console.log("handleCompleteTrx 호출");

    console.log(`transaction id : `, ref_result.ref_result.current.value);
    console.log(
      `transaction id2 : `,
      JSON.parse(ref_result.ref_result.current.value).transaction_id
    );

    closeWaitingModal();
    openSuccessModal(JSON.parse(ref_result.ref_result.current.value)[0]);
    ref_wallet_finish.ref_wallet_finish.current.removeEventListener(
      "click",
      handleCompleteTrx
    );
  };

  return (
    <>
      <Modal
        isOpen={modalWaitingIsOpen}
        onAfterOpen={afterWaitingModal}
        style={customModalStyles}
      >
        <div className="font-san w-full h-full flex flex-col justify-center items-center">
          <AiOutlineLoading3Quarters size={80} />
          <div className="mt-10 text-4xl">트랜잭션 생성 중</div>
          <div className="mt-10">지갑을 통해 트랜잭션을 확인해주세요. </div>
          {/* <button onClick={closeWaitingModal}>닫기</button> */}
        </div>
      </Modal>

      <Modal
        isOpen={modalSuccessIsOpen}
        onAfterOpen={afterSuccessModal}
        style={customModalStyles}
      >
        <div className="font-san w-full h-full flex flex-col justify-center">
          <div className="flex-grow flex flex-col justify-center items-center">
            <AiOutlineCheckCircle className="text-lime-500" size={80} />
            <div className="mt-10 text-4xl">트랜잭션 성공</div>
            <div className="mt-10">
              트랜잭션 ID :{" "}
              <a
                className=" text-orange-500 font-bold"
                href={`http://cryptoexplorer.store/Transaction/${trxId}`}
                target="_blank"
              >
                {shortId}
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              className="mt-10 border rounded-3xl w-11/12 h-9"
              onClick={closeSuccessModal}
            >
              닫기
            </button>
          </div>
        </div>
      </Modal>

      <div className="my-2 p-8 bg-card rounded-xl">
        <div className="flex items-center">
          <div className="font-bold flex-1">
            Offer ID :
            <span className="ml-3 text-orange-400">{`#${offer_info.offer_id}`}</span>
          </div>
          <button className="text-sm flex justify-center items-center py-2 px-5 border-slate-400 border rounded-3xl"
          onClick={handleCancelOffer}>
            <FaRegTrashAlt />
            <div className="ml-2 font-bold">취소</div>
          </button>
        </div>
        <div className="my-6 p-10 grid grid-cols-3 justify-items-center content-center gap-5 bg-mint rounded-xl">
          <div className="flex flex-col items-center">
            <div className="mb-3 text-orange-400 font-bold">
              {offer_info.sender}
            </div>
            <NFTComponent
              item={{
                nft_img: offer_info.sender_asset_img,
                collection_name: offer_info.sender_collection_name,
                nft_name: offer_info.sender_asset_name,
                asset_id: offer_info.sender_asset_ids,
              }}
            />
          </div>
          <div className="flex items-center">
            <FaExchangeAlt size={30} />
          </div>
          <div className="flex flex-col items-center">
            <div className="mb-3 text-orange-400 font-bold">
              {offer_info.recipient}
            </div>
            <NFTComponent
              item={{
                nft_img: offer_info.recipient_asset_img,
                collection_name: offer_info.recipient_collection_name,
                nft_name: offer_info.recipient_asset_name,
                asset_id: offer_info.recipient_asset_ids,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function NFTComponent({item}) {
    return (
      <div
        className="bg-card flex flex-col items-start rounded-xl p-5"
      >
        <img src={item.nft_img} alt=""></img>
        <div className="mt-2 text-sm font-bold">{item.collection_name}</div>
        <div className="mt-2 text-orange-400 font-bold">{item.nft_name}</div>
        <div className="mt-2 font-bold text-slate-500">{`# ${item.asset_id}`}</div>
      </div>
    );
  }



function TabReceive(params) {
  const navigate = useNavigate();
  const [sendOffers, setSendOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState("");

  const handleSelectOffer = (item) => {
    console.log("handleSelectOffer 호출", item);
    setSelectedOffer(item);
  };

  const [isMoreData, setIsMoreData] = useState(true);
  const [page, setPage] = useState(1);
  let perPage = 6;

  useEffect(() => {
    getSenderOffer();
  }, [page]);

  const handleLoadMore = () => {
    console.log("handleLoadMore 호출");
    setPage((prev) => prev + 1);
  };

  const user_name = localStorage.getItem("account_name");
  async function getSenderOffer() {
    const params = {
      datas: {
        sort_type: "receiver",
        scope: user_name,
        bound: [user_name, user_name],
        page: page,
        perPage: perPage,
      },
    };
    console.log(`load data - `, params);
    const offerInfo = await GetOffer(params);

    console.log(`offerInfo : `, offerInfo);
    setSendOffers((prev) => [...prev, ...offerInfo]);
    if (page === 1) {
      setSelectedOffer(offerInfo[0]);
    }
    if (offerInfo.length < perPage) {
      setIsMoreData(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-4">
          {sendOffers.map((item) => (
            <OfferSentItem
              key={item.offer_id}
              offer_info={item}
              handleSelectOffer={handleSelectOffer}
            />
          ))}
          {isMoreData && (
            <div className="mx-4 mt-10 flex justify-center">
              <button
                className="border-2 flex items-center rounded-xl py-4 px-20"
                onClick={handleLoadMore}
              >
                <VscRefresh size={25} />
                <div className="ml-2 text-lg font-bold ">Load More</div>
              </button>
            </div>
          )}
        </div>
        {sendOffers.length !== 0 ? (
          <div className="col-span-8">
            <SelectedReceiveOffer
              offer_info={selectedOffer}
              getSenderOffer={getSenderOffer}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}

function SelectedReceiveOffer({offer_info, getSenderOffer}) {
    const {
      isLogin,
      setIsLogin,
      ref_user_data,
      ref_trx_data,
      ref_wallet_start,
      ref_status,
      ref_result,
      ref_wallet_finish,
    } = useOutletContext();
    console.log(`SelectedSentOffer : `, useOutletContext());

    const handleAcceptOffer = () => {
        console.log("handleAcceptOffer 호출");
    
        openWaitingModal();
        const new_data = [
          {
            action_account: "eosio.nft",
            action_name: "acceptoffer",
            data: {
              offer_id: offer_info.offer_id,
            },
          },
        ];
    
        console.log(`ref_trx_data : `, ref_trx_data);
        console.log(`ref_trx_data : `, ref_trx_data.ref_trx_data);
    
        ref_trx_data.ref_trx_data.current.value = JSON.stringify(new_data);
        ref_user_data.ref_user_data.current.value =
          localStorage.getItem("account_name");
        if (
          ref_wallet_start.ref_wallet_start.current &&
          ref_wallet_finish.ref_wallet_finish.current
        ) {
          console.log(
            `트랜잭션 발생 버튼 클릭시키기123..`,
            ref_trx_data.ref_trx_data.current.value,
            ref_user_data.ref_user_data.current.value
          );
          ref_wallet_finish.ref_wallet_finish.current.addEventListener(
            "click",
            handleCompleteTrx
          );
          ref_wallet_start.ref_wallet_start.current.click();
        }
      };
  
    const handleDeclineOffer = () => {
      console.log("handleDeclineOffer 호출");
  
      openWaitingModal();
      const new_data = [
        {
          action_account: "eosio.nft",
          action_name: "declineoffer",
          data: {
            offer_id: offer_info.offer_id,
          },
        },
      ];
  
      console.log(`ref_trx_data : `, ref_trx_data);
      console.log(`ref_trx_data : `, ref_trx_data.ref_trx_data);
  
      ref_trx_data.ref_trx_data.current.value = JSON.stringify(new_data);
      ref_user_data.ref_user_data.current.value =
        localStorage.getItem("account_name");
      if (
        ref_wallet_start.ref_wallet_start.current &&
        ref_wallet_finish.ref_wallet_finish.current
      ) {
        console.log(
          `트랜잭션 발생 버튼 클릭시키기123..`,
          ref_trx_data.ref_trx_data.current.value,
          ref_user_data.ref_user_data.current.value
        );
        ref_wallet_finish.ref_wallet_finish.current.addEventListener(
          "click",
          handleCompleteTrx
        );
        ref_wallet_start.ref_wallet_start.current.click();
      }
    };
  
    // 모달 창 관련 변수
    const [modalWaitingIsOpen, setModalWaitingIsOpen] = useState(false);
    const [modalSuccessIsOpen, setModalSuccessIsOpen] = useState(false);
  
    // 트랜잭션 대기 관련 모달..?
    function openWaitingModal() {
      setModalWaitingIsOpen(true);
    }
  
    function closeWaitingModal() {
      setModalWaitingIsOpen(false);
    }
  
    function afterWaitingModal() {
      console.log("트랜잭션 실행");
    }
  
    // 트랜잭션 성공 시 모달
  
    const [trxId, setTrxId] = useState("");
    const [shortId, setShortId] = useState("");
    function openSuccessModal(trx_id) {
      setModalSuccessIsOpen(true);
      console.log(`성공 모달 띄어짐`);
      setTrxId(trx_id);
      setShortId(short_trx_id(trx_id));
    }
  
    function short_trx_id(keyString) {
      const maxLength = 10; // 원하는 최대 길이
  
      if (keyString.length <= maxLength) {
        return keyString;
      }
  
      const shortenedKey = `${keyString.substring(
        0,
        maxLength / 2
      )}...${keyString.substring(keyString.length - maxLength / 2)}`;
      return shortenedKey;
    }
  
    function closeSuccessModal() {
      setModalSuccessIsOpen(false);
      // navigate(`/profile?selectedTab=Bought`);
    //   getSenderOffer(); // 화면 갱신
    }
  
    function afterSuccessModal() {}
  
    const handleCompleteTrx = () => {
      console.log("handleCompleteTrx 호출");
  
      console.log(`transaction id : `, ref_result.ref_result.current.value);
      console.log(
        `transaction id2 : `,
        JSON.parse(ref_result.ref_result.current.value).transaction_id
      );
  
      closeWaitingModal();
      openSuccessModal(JSON.parse(ref_result.ref_result.current.value)[0]);
      ref_wallet_finish.ref_wallet_finish.current.removeEventListener(
        "click",
        handleCompleteTrx
      );
    };
  
    return (
      <>
        <Modal
          isOpen={modalWaitingIsOpen}
          onAfterOpen={afterWaitingModal}
          style={customModalStyles}
        >
          <div className="font-san w-full h-full flex flex-col justify-center items-center">
            <AiOutlineLoading3Quarters size={80} />
            <div className="mt-10 text-4xl">트랜잭션 생성 중</div>
            <div className="mt-10">지갑을 통해 트랜잭션을 확인해주세요. </div>
            {/* <button onClick={closeWaitingModal}>닫기</button> */}
          </div>
        </Modal>
  
        <Modal
          isOpen={modalSuccessIsOpen}
          onAfterOpen={afterSuccessModal}
          style={customModalStyles}
        >
          <div className="font-san w-full h-full flex flex-col justify-center">
            <div className="flex-grow flex flex-col justify-center items-center">
              <AiOutlineCheckCircle className="text-lime-500" size={80} />
              <div className="mt-10 text-4xl">트랜잭션 성공</div>
              <div className="mt-10">
                트랜잭션 ID :{" "}
                <a
                  className=" text-orange-500 font-bold"
                  href={`http://cryptoexplorer.store/Transaction/${trxId}`}
                  target="_blank"
                >
                  {shortId}
                </a>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                className="mt-10 border rounded-3xl w-11/12 h-9"
                onClick={closeSuccessModal}
              >
                닫기
              </button>
            </div>
          </div>
        </Modal>
  
        <div className="my-2 p-8 bg-card rounded-xl">
          <div className="flex items-center">
            <div className="font-bold flex-1">
              Offer ID :
              <span className="ml-3 text-orange-400">{`#${offer_info.offer_id}`}</span>
            </div>
            <button className="text-sm flex justify-center items-center py-2 px-5 border-slate-400 border rounded-3xl"
            onClick={handleAcceptOffer}>
              <FaRegTrashAlt />
              <div className="ml-2 font-bold">수락</div>
            </button>
            <button className="ml-5 text-sm flex justify-center items-center py-2 px-5 border-slate-400 border rounded-3xl"
            onClick={handleDeclineOffer}>
              <FaRegTrashAlt />
              <div className="ml-2 font-bold">거절</div>
            </button>
          </div>
          <div className="my-6 p-10 grid grid-cols-3 justify-items-center content-center gap-5 bg-mint rounded-xl">
            <div className="flex flex-col items-center">
              <div className="mb-3 text-orange-400 font-bold">
                {offer_info.sender}
              </div>
              <NFTComponent
                item={{
                  nft_img: offer_info.sender_asset_img,
                  collection_name: offer_info.sender_collection_name,
                  nft_name: offer_info.sender_asset_name,
                  asset_id: offer_info.sender_asset_ids,
                }}
              />
            </div>
            <div className="flex items-center">
              <FaExchangeAlt size={30} />
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-3 text-orange-400 font-bold">
                {offer_info.recipient}
              </div>
              <NFTComponent
                item={{
                  nft_img: offer_info.recipient_asset_img,
                  collection_name: offer_info.recipient_collection_name,
                  nft_name: offer_info.recipient_asset_name,
                  asset_id: offer_info.recipient_asset_ids,
                }}
              />
            </div>
          </div>
        </div>
      </>
    );
  }