import React, { useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import ButtonPrimary from "../../component/basic/btn-primary";
import { IoIosArrowDown } from "react-icons/io";
import {
  AiOutlineSearch,
  AiOutlineAreaChart,
  AiOutlineLoading3Quarters,
  AiOutlineCheckCircle,
} from "react-icons/ai";
import { VscRefresh } from "react-icons/vsc";
import { postJSON } from "../../js/postJson";
import { GetNFT } from "../../js/api_nft";
import { useNavigate } from "react-router-dom";

Modal.setAppElement("#root");

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

export default function TradingHome() {

  const navigate = useNavigate();

  let perPage = 12;
  
  const [nftsInfo, setNftsInfo] = useState([]);
  const [isMoreData, setIsMoreData] = useState(true);
  const [page, setPage] = useState(1);
  const [choiceNfts, setChoiceNfts] = useState([]);
  

  const [opponentName, setOpponentName] = useState("");
  const [opponentNfts, setOpponentNfts] = useState([]);
  const [isMoreOpponentData, setIsMoreOpponentData] = useState(true);
  const [opponentPage, setOpponentPage] = useState(1);
  const [opponentChoiceNfts, setOpponentChoiceNfts] = useState([]);

  useEffect(() => {
    getNFT();   
  }, [page]);

  useEffect(() => {
    getOpponentNFT();      
  }, [opponentName]);

  useEffect(() => {
  
  }, [opponentPage]);

  useEffect(() => {
    console.log(`상대편의 nft..`, opponentNfts);  
  }, [opponentNfts]);



  const user_name = localStorage.getItem("account_name"); // 세션 처리후 해당 데이터에 user_name을 입력해주어야한다.
  async function getNFT() {
    const params = {
      datas: {
        sort_type: "user_name",
        scope : user_name,
        bound: [user_name, user_name],
        page: page,
        perPage: perPage,
      },
    };
    console.log(`load data - `, params);
    const response = await GetNFT(params);

    process_nft_data(response);
  }

  function process_nft_data(data) {
    console.log("응답 후 데이터 : ", data); // JSON 객체이다. by `data.json()` call
    const nftsInfo = data.result.map((item) => {
      return {
        user_name: item.ram_player,
        asset_id: item.asset_id,
        collection_name: item.collection_name,
        schema_name: item.schema_name,
        nft_name: item.immutable_serialized_data.find(
          (item) => item.key === "name"
        ).value[1],
        nft_img:
          "https://ipfs.io/ipfs/" +
          item.immutable_serialized_data.find((item) => item.key === "img")
            .value[1],
      };
    });
    console.log(`nftInfo : `, nftsInfo);
    setNftsInfo((prev) => [...prev, ...nftsInfo]);
    if (data.result.length < perPage) {
      setIsMoreData(false);
    } else {
      setIsMoreData(true);
    }
  }

  const handleLoadMore = () => {
    console.log("handleLoadMore 호출");
    setPage((prev) => prev + 1);
  };

  const handleChoiceNFT = (asset_id) => {
    console.log("handleChoiceNFT 호출");
    
    if(choiceNfts.find(item => item.asset_id === asset_id)) {
      alert("이미 선택한 아이템입니다.")
    } else {
      const choiceItem = nftsInfo.find((item) => item.asset_id === asset_id);
      setChoiceNfts(prev => [...prev, choiceItem]);
      console.log(`choiceItem : `, choiceItem);
    }
    
  };

  const handleRemoveNFT = (asset_id) => {
    console.log("handleRemoveNFT 호출");
    setChoiceNfts(prev => {
      const newItems = prev.filter(item => item.asset_id !== asset_id)
      return newItems;
    });
  };


  const handleOnChangeOpponentName = (e) => {
    console.log("handleOnChangeOpponentName 호출", e.target.value);
    setOpponentName(e.target.value);
  };

  async function getOpponentNFT() {
    const params = {
      datas: {
        sort_type: "user_name",
        scope : opponentName,
        bound: [opponentName, opponentName],
        page: page,
        perPage: perPage,
      },
    };
    console.log(`load data - `, params);
    const response = await GetNFT(params);

    process_opponentNft_data(response);
  }

  function process_opponentNft_data(data) {
    console.log("응답 후 데이터 : ", data); // JSON 객체이다. by `data.json()` call
    const nftsInfo = data.result.map((item) => {
      return {
        user_name: item.ram_player,
        asset_id: item.asset_id,
        collection_name: item.collection_name,
        schema_name: item.schema_name,
        nft_name: item.immutable_serialized_data.find(
          (item) => item.key === "name"
        ).value[1],
        nft_img:
          "https://ipfs.io/ipfs/" +
          item.immutable_serialized_data.find((item) => item.key === "img")
            .value[1],
      };
    });
    console.log(`상대편의 nftInfo : `, nftsInfo);
    // setOpponentNfts((prev) => [...prev, ...nftsInfo]);
    setOpponentNfts(nftsInfo);
    if (data.result.length < perPage) {
      setIsMoreOpponentData(false);
    }
  }

  const handleLoadMoreOpponent = () => {
    console.log("handleLoadMoreOpponent 호출");
    setOpponentPage((prev) => prev + 1);
  };

  
  const handleOpponentChoiceNFT = (asset_id) => {
    
    console.log("handleOpponentChoiceNFT 호출");
    
    if(opponentChoiceNfts.find(item => item.asset_id === asset_id)) {
      alert("이미 선택한 아이템입니다.")
    } else {
      const choiceItem = opponentNfts.find((item) => item.asset_id === asset_id);
      setOpponentChoiceNfts(prev => [...prev, choiceItem]);
      console.log(`choiceItem : `, choiceItem);
    }
  };

  const handleRemoveNFTOpponent = (asset_id) => {
    console.log("handleRemoveNFTOpponent 호출");
    setOpponentChoiceNfts(prev => {
      const newItems = prev.filter(item => item.asset_id !== asset_id)
      return newItems;
    });
  };


  const handleOffer = () => {
    console.log("handleOffer 호출");
    openWaitingModal();
    const my_assetId = parseInt(choiceNfts.asset_id, 10);
    const opponent_assetId = parseInt(opponentChoiceNfts.asset_id, 10);

    const new_data = {
      sender: localStorage.getItem("account_name"),
      recipient: opponentName,
      sender_asset_ids: choiceNfts.map(item => parseInt(item.asset_id, 10)),
      recipient_asset_ids: opponentChoiceNfts.map(item => parseInt(item.asset_id, 10)),
      memo: "교환 제안",
    };

    console.log(`handleOffer - 생성된 데이터 : `, new_data);
    data_Ref.current.value = JSON.stringify(new_data);  
    if (btnRef.current) {
      console.log(`트랜잭션 발생 버튼 클릭시키기..`);
      btnRef.current.click();      
    }
  };

  const btnRef = useRef(null);
  const data_Ref = useRef(null);

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
  const ref_result = useRef();
  const ref_status = useRef();
  const [trxId, setTrxId] = useState("");
  const [shortId, setShortId] = useState("");
  function openSuccessModal(trx_id) {
    setModalSuccessIsOpen(true);
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
    navigate("/trading/trade-offers?selectedTab=Sent");
  }

  function afterSuccessModal() {}

  const handleCompleteTrx = () => {
    console.log("handleCompleteTrx 호출");

    console.log(`transaction id : `, ref_result.current.value);
    console.log(
      `transaction id2 : `,
      JSON.parse(ref_result.current.value).transaction_id
    );

    closeWaitingModal();
    openSuccessModal(JSON.parse(ref_result.current.value).transaction_id);
  };

  return (
    <>
      <input id="auth_name" type="hidden" value={localStorage.getItem("account_name")} readOnly></input>
      <input ref={data_Ref} id="data" type="hidden" />
      <input
        id="action_account"
        type="hidden"
        value={"eosio.nft"}
        readOnly
      ></input>
      <input
        id="action_name"
        type="hidden"
        value={"createoffer"}
        readOnly
      ></input>
      <button id="transaction" ref={btnRef}></button>

      <button
        id="transaction_complete"
        className="sr-only"
        onClick={handleCompleteTrx}
      ></button>
      <input id="result" type="hidden" ref={ref_result}></input>
      <input id="status" type="hidden" ref={ref_status}></input>

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

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2">
        <div className="text-2xl font-bold">New Trade Offer</div>
        <ButtonPrimary
          text={"교환 제안"}
          css={"justify-self-end"}
          onClick={handleOffer}
        />
      </div>

      <div className="mt-7 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="col-span-2 lg:col-span-1">
          <div className="my-7 font-bold text-2xl">
            <div className="p-2">{localStorage.getItem("account_name")}</div>
          </div>
          <div className="border-2 border-orange-400 rounded-xl p-6 grid grid-cols-1 lg:grid-cols-3">
            {choiceNfts.map((item) => {
              return (
                <NFTComponent
                  key={item.asset_id}
                  item={item}
                  handleClickNFT={handleRemoveNFT}
                />
              );
            })}
          </div>
          {/* <div className="bg-card p-6 mt-6 rounded-xl">
            <div className="flex grow border border-orange-400 rounded-xl p-2 mt-3">
              <AiOutlineSearch size={25} />
              <span className="ml-3 text-slate-500">Search in NFTs</span>
            </div>
          </div> */}

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-7">
            {nftsInfo.map((item) => {
              return (
                <NFTComponent
                  key={item.asset_id}
                  item={item}
                  handleClickNFT={handleChoiceNFT}
                />
              );
            })}
          </div>

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

        <div className="col-span-2 lg:col-span-1">
          {/* <div className="invisible border-2 border-orange-400 rounded-md p-4 text-xl flex items-center justify-between">
            <div>Opponent Wishlist</div>
            <IoIosArrowDown size={23} />
          </div> */}
          <div className="my-7 font-bold text-xl">
            <input
              type="text"
              className="w-full bg-inherit border-2 rounded-lg p-2 active:border-orange-400"
              placeholder="상대 계정이름을 입력해주세요"
              onChange={handleOnChangeOpponentName}
            ></input>
          </div>

          <div className="border-2 border-orange-400 rounded-xl p-6 grid grid-cols-1 lg:grid-cols-3">
            {opponentChoiceNfts.map((item) => {
              return (
                <NFTComponent
                key={item.asset_id}
                item={item}
                handleClickNFT={handleRemoveNFTOpponent}
                />
              )
            })}
          </div>
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-7">
            {opponentNfts.map((item) => {
              return (
                <NFTComponent
                  key={item.asset_id}
                  item={item}
                  handleClickNFT={handleOpponentChoiceNFT}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function Test({item, handleClickNFT}) {
  return (
    <div>
      {item.asset_id}
    </div>
  )  
}


function NFTComponent({ item, handleClickNFT }) {
  return (
    <div
      key={item.asset_id}
      className="bg-card flex flex-col items-start rounded-xl p-5"
      onClick={() => handleClickNFT(item.asset_id)}
    >
      <img src={item.nft_img} alt=""></img>
      <div className="mt-2 text-sm font-bold">{item.collection_name}</div>
      <div className="mt-2 text-orange-400 font-bold">{item.nft_name}</div>
      <div className="mt-2 font-bold text-slate-500">{`# ${item.asset_id}`}</div>
    </div>
  );
}

function OppenentUI({opponentChoiceNfts, opponentNfts, handleOpponentChoiceNFT}) {

  return (
    <>
      <div className="border-2 border-orange-400 rounded-xl p-6 grid grid-cols-1 lg:grid-cols-3">
        {opponentChoiceNfts.map((item) => {
          <NFTComponent
            key={item.asset_id}
            item={item}
            handleClickNFT={handleOpponentChoiceNFT}
          />;
        })}
      </div>
      {/* <div className="bg-card p-6 mt-6 rounded-xl">
        <div className="flex grow border border-orange-400 rounded-xl p-2 mt-3">
          <AiOutlineSearch size={25} />
          <span className="ml-3 text-slate-500">Search in NFTs</span>
        </div>
        <div className="mt-5">
          <select
            className="w-full bg-inherit text-center"
            placeholder="All collections"
          >
            <option className="bg-card" name="type" value="string">
              All collections
            </option>
          </select>
        </div>
      </div> */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-7">
        {opponentNfts.map((item) => {
          <NFTComponent
            key={item.asset_id}
            item={item}
            handleClickNFT={handleOpponentChoiceNFT}
          />;
        })}
      </div>
    </>
  );
  
}
