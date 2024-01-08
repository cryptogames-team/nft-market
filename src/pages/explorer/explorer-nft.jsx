import React, { useEffect, useRef, useState } from 'react'
import { useLoaderData, useNavigate, useOutletContext } from "react-router-dom";
import ButtonPrimary from '../../component/basic/btn-primary';
import Modal from "react-modal";
import { GiCancel } from "react-icons/gi";
import {
  AiOutlineSearch,
  AiOutlineAreaChart,
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

export default function ExplorerNFT() {
  const nft_info = useLoaderData(); // nft의 정보를 가져온다.
  console.log(`nft_info : `, nft_info);

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

  const navigate = useNavigate();
  const [isMine, setIsMine] = useState(false);
  useEffect(() => {
    // if(nft_info.ram_player === localStorage.getItem("account_name")) {
    //   setIsMine(true);
    // }
  }, []);

  console.log(`explorer-nft : `, useOutletContext());
  


  const [modalListingIsOpen, setModalListingIsOpen] = useState(false);
  const handleMarketModalOpen = () => {
    console.log("handleMarketModalOpen 호출");
    setModalListingIsOpen(true);  
  }

  const handleMarketModalClose = () => {
    console.log("handleMarketModalClose 호출");
    setModalListingIsOpen(false);    
  }


  const handleSellNFT = (price) => {
    console.log("handleSellNFT 호출");
    openWaitingModal();

    const user_name = localStorage.getItem('account_name'); // 세션 요청으로부터 user의 이름을 가져와야함.
    const new_data = [
      {
        action_account: "eosio.market",
        action_name: "uploadmarket",
        data: {
          seller: user_name,
          col_name: nft_info.collection_name,
          schema_name: nft_info.schema_name,
          asset_id: parseInt(nft_info.asset_id),
          price: price,
          asset_name: nft_info.nft_name.split(' ').join(''),
          asset_img: nft_info.nft_ori_img,
        },
      },
      {
        action_account: "eosio.nft",
        action_name: "createoffer",
        data: {
          sender: user_name,
          recipient: "eosio.market",
          sender_asset_ids: [parseInt(nft_info.asset_id)],
          recipient_asset_ids: [],
          memo: "dd",
        },
      },
    ];

    console.log(`트랜잭션에 담아줄 데이터 : `, new_data);
    
    ref_trx_data.ref_trx_data.current.value = JSON.stringify(new_data);  
    ref_user_data.ref_user_data.current.value = localStorage.getItem('account_name');
    if (ref_wallet_start.ref_wallet_start.current && ref_wallet_finish.ref_wallet_finish.current) {
      console.log(`트랜잭션 발생 버튼 클릭시키기..`);
      ref_wallet_finish.ref_wallet_finish.current.addEventListener('click', handleCompleteTrx);
      ref_wallet_start.ref_wallet_start.current.click();      
    }
  
  }

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
    navigate(`/profile?selectedTab=MyListings`);  
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
    ref_wallet_finish.ref_wallet_finish.current.removeEventListener('click', handleCompleteTrx);
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

      <NFTMarketModal handleSellNFT={handleSellNFT} nft_info={nft_info} modalIsOpen={modalListingIsOpen} modalClose={handleMarketModalClose} />

      <div className="mt-7 text-xs font-bold">
        {`Explorer > ${nft_info.collection_name} > ${nft_info.nft_name}`}
      </div>

      <div className="mt-5 text-2xl font-bold">
        <span>NFT : </span>
        <span className="text-orange-400">{`${nft_info.nft_name}`}</span>
      </div>

      <NFTInfo nft_info={nft_info} marketModalBtn={handleMarketModalOpen} />
      <NFTAttritute nft_info={nft_info} />
      
    </>
  );
}

function NFTInfo({nft_info, marketModalBtn}) {
  return (
    <div className="mt-5 grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="col-span-1 bg-card rounded-xl p-5">
          <img className="mt-10" src={nft_info.nft_img}></img>
        </div>
        <div className="col-span-3 bg-card rounded-xl p-10 grid grid-cols-1 lg:grid-cols-2 gap-7">
          <div className="col-span-2 font-bold text-2xl">
            <div>{nft_info.nft_name}</div>
          </div>

          <div className="font-bold">
            <div className="text-slate-500">템플릿 ID</div>
            <div className="p-1">{`# ${nft_info.asset_id}`}</div>
          </div>
          <div className="font-bold">
            <div className="text-slate-500">콜렉션</div>
            <div className="p-1 ">{`${nft_info.collection_name}`}</div>
          </div>
          <div className="font-bold">
            <div className="text-slate-500">카테고리</div>
            <div className="p-1 text-orange-400">{`${nft_info.schema_name}`}</div>
          </div>
          <div className="font-bold">
            <div className="text-slate-500">템플릿</div>
            <div className="p-1 text-orange-400">{`# ${nft_info.template_id}`}</div>
          </div>

          <div className="col-span-2 bg-mint p-5 rounded-xl grid grid-cols-1 lg:grid-cols-2">
            <div>
              <div className="text-slate-500">최저 제안 가격</div>
              <div className="text-lime-500 font-bold p-1">-</div>
            </div>
            {

            }
            <ButtonPrimary
              text={"마켓 등록"}
              css={"justify-self-end self-center"}
              onClick={marketModalBtn}
            />
          </div>          
        </div>
      </div>
  )  
}

function NFTAttritute({ nft_info }) {
  return (
    <div className="mt-5 bg-card rounded-xl p-5">
      <div className="font-bold">NFT Attributes</div>
      <table className="w-full mt-7 table-auto border-2 border-slate-500 rounded-lg border-collapse">
        <tbody>
          {nft_info.immutable_serialized_data.map((item) => {
            return (
              <tr key={item.key} >
                <td className="p-4 border border-slate-500 font-bold">
                  {item.key}
                </td>
                <td className="p-4 border border-slate-500 font-bold">
                  {item.value[1]}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function NFTMarketModal({handleSellNFT, nft_info, modalIsOpen, modalClose}) {
  const ModalStyles = {
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
      width: "650px",
      height: "750px",
      zIndex: "150",
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -55%)",
      borderRadius: "10px",
      borderColor: "rgb(0,0,0)",
      boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
      color: "white",
      backgroundColor: "#1A203C",
      justifyContent: "center",
      overflow: "auto",
    },
  };

  const [price, setPrice] = useState();

  const handleGoMarket = () => {
    const formattedString = formatNumberWithHep(parseInt(price));
    console.log("handleGoMarket 호출", formattedString);
    handleSellNFT(formattedString)    
    modalClose();
  }

  return (
    <>
      <Modal isOpen={modalIsOpen} style={ModalStyles}>
        <div className="flex flex-col items-center">
          <GiCancel size={25} className="self-end" onClick={modalClose} />
          <div className="font-bold text-2xl">마켓에 NFT 등록하기</div>
          <div className="mt-7 grid grid-cols-1 lg:grid-cols-12 w-full gap-7">
            <div className="lg:col-span-4">
              <NFTComponent item={nft_info} />
            </div>
            <div className="lg:col-span-8">
              <div className="lg:col-span-4 p-2 rounded-2xl flex border border-slate-400">
                <button className="flex-grow bg-orange-400 p-1 rounded-2xl">
                  Listing
                </button>
                <button className="mx-2 flex-grow p-1 rounded-2xl">
                  Auctions
                </button>
              </div>

              <ListingPrice price={price} setPrice={setPrice} />
              <div className="mt-4 bg-body rounded-lg p-3">
                <div className="font-bold text-lg">
                  <span>수수료 :</span>
                  <span className="ml-3  text-orange-400">4.00%</span>
                </div>

                <div className="mt-4 flex p-1 items-center">
                  <table className="w-full table-auto border-2 border-slate-500 rounded-lg border-collapse">
                    <tbody>
                      <tr>
                        <td className="p-4 border border-slate-500 font-bold text-orange-400">
                          2.00%
                        </td>
                        <td className="p-4 border border-slate-500">
                          <div className="font-bold text-sm">
                            NFT 거래소 수수료
                          </div>
                          <div className="mt-2 text-xs">
                            NFT 거래소의 유지 및 개선을 위한 요금입니다.
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 border border-slate-500 font-bold text-orange-400">
                          2.00%
                        </td>
                        <td className="p-4 border border-slate-500">
                          <div className="font-bold text-sm">
                            로열티 수수료
                          </div>
                          <div className="mt-2 text-xs">
                            거래시, NFT 창작자가 받는 로열티 수수료 입니다.
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <ButtonPrimary text={"등록하기"} css={"mt-6 w-full"} onClick={handleGoMarket} />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );  
}

function formatNumberWithHep(input) {
  if (Number.isInteger(input)) {
    const formattedNumber = input.toFixed(4); // 소수점 자리수를 4자리로 설정
    return `${formattedNumber} HEP`;
  } else {
    // 입력이 정수가 아닌 경우에 대한 처리
    return '유효한 정수가 아닙니다';
  }
}

function NFTComponent({ item}) {
  return (
    <div
      key={item.asset_id}
      className="bg-card flex flex-col items-start rounded-xl p-5 shadow-2xl"
    >
      <img src={item.nft_img} alt=""></img>
      <div className="mt-2 text-sm font-bold">{item.collection_name}</div>
      <div className="mt-2 text-orange-400 font-bold">{item.nft_name}</div>
    </div>
  );
}

function ListingPrice({ price, setPrice }) {

  const handleOnChange = (e) => {
    console.log("handleOnChange 호출", e.target.value);
    setPrice(e.target.value);  
  }
  
  return (
    <div className="mt-4 bg-body rounded-lg p-3">
      <div className="font-bold text-lg">가격 제시</div>

      <div className="mt-4 flex p-1 items-center">
        <div className="font-bold">판매가</div>
        <div className="ml-4 flex-grow border border-slate-400 rounded-md">
          <input
            className="bg-inherit w-full p-2"
            type="number"
            placeholder="단위 : Hep"
            value={price}
            onChange={handleOnChange}
          ></input>
        </div>
      </div>
      {/* <div className="mt-4 flex p-1 items-center">
        <div className="font-bold">순수익</div>
        <div className="ml-4 flex-grow border border-slate-400 rounded-md">
          <input
            className="bg-inherit w-full p-2"
            type="number"
            placeholder="단위 : Hep"
          ></input>
        </div>
      </div> */}
    </div>
  );
}