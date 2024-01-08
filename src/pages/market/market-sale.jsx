import React, { useEffect, useRef, useState } from "react";
import { useLoaderData, useNavigate, useOutletContext } from "react-router-dom";
import {
  AiOutlineSearch,
  AiOutlineAreaChart,
  AiOutlineLoading3Quarters,
  AiOutlineCheckCircle,
} from "react-icons/ai";
import { FaBurn } from "react-icons/fa";
import { BiTransfer } from "react-icons/bi";
import ButtonPrimary from "../../component/basic/btn-primary";
import Modal from "react-modal";
import { postJSON } from "../../js/postJson";

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

Modal.setAppElement("#root");

export default function MarketSale() {

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
  console.log(`MarketSale : `, useOutletContext());

  const sale_item_info = useLoaderData(); // 콜렉션의 정보를 가져온다. collection_name, author, market_fee 등등.
  const navigate = useNavigate();


  const handleBuyNFT = () => {
    console.log("handleBuyNFT 호출");
    openWaitingModal();

    const user_name = localStorage.getItem('account_name'); // 세션 요청으로부터 user의 이름을 가져와야함.
    const new_data = [
      {
        action_account: "eosio.token",
        action_name: "transfer",
        data: {
          from: user_name,
          to: sale_item_info.seller,
          quantity: sale_item_info.ori_price,
          memo: "dd",
        },
      },
      {
        action_account: "eosio.market",
        action_name: "buynft",
        data: {
          buyer: user_name,
          asset_id: [sale_item_info.asset_id],
          sale_id: sale_item_info.sale_id,
          offer_id: sale_item_info.offer_id,
        },
      },
    ];
    
    console.log(`ref_trx_data : `, ref_trx_data);
    console.log(`ref_trx_data : `, ref_trx_data.ref_trx_data);
    
    ref_trx_data.ref_trx_data.current.value = JSON.stringify(new_data);  
    ref_user_data.ref_user_data.current.value = localStorage.getItem('account_name');
    if (ref_wallet_start.ref_wallet_start.current && ref_wallet_finish.ref_wallet_finish.current) {
      console.log(`트랜잭션 발생 버튼 클릭시키기123..`,ref_trx_data.ref_trx_data.current.value, ref_user_data.ref_user_data.current.value);
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
    navigate(`/profile?selectedTab=Bought`);  
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

      <SaleItemDescription sale_item_info={sale_item_info} handleBuyNFT={handleBuyNFT}/> 
      <NFTAtt nft_att={sale_item_info.nft_att} />  
      
    </>
  );
}


function SaleItemDescription({ sale_item_info, handleBuyNFT }) {
  return (
    <>
      <div className="mt-3 text-xs font-bold">
        {`Market > Listing > ${sale_item_info.asset_name}`}
      </div>
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="col-span-1 bg-card rounded-xl p-5">
          <img className="mt-10" src={sale_item_info.asset_img}></img>
        </div>
        <div className="col-span-3 bg-card rounded-xl p-10 grid grid-cols-1 lg:grid-cols-2 gap-7">
          <div className="col-span-2 font-bold text-2xl">
            <div>{sale_item_info.asset_name}</div>
          </div>

          <div className="font-bold">
            <div className="text-slate-500">판매 ID</div>
            <div className="p-1">{`# ${sale_item_info.sale_id}`}</div>
          </div>
          <div className="font-bold">
            <div className="text-slate-500">NFT ID</div>
            <div className="p-1">{`# ${sale_item_info.asset_id}`}</div>
          </div>
          <div className="font-bold">
            <div className="text-slate-500">콜렉션</div>
            <div className="p-1">{`${sale_item_info.collection_name}`}</div>
          </div>
          <div className="font-bold">
            <div className="text-slate-500">판매자</div>
            <div className="p-1">{`${sale_item_info.seller}`}</div>
          </div>
          <div className="font-bold">
            <div className="text-slate-500">카테고리</div>
            <div className="p-1">{`${sale_item_info.schema_name}`}</div>
          </div>

          <div className="col-span-2 bg-mint p-5 rounded-xl grid grid-cols-1 lg:grid-cols-2">
            <div>
              <div className="text-slate-500">가격</div>
              <div className="text-lime-500 font-bold p-1">
                {sale_item_info.price}
              </div>
            </div>
            {sale_item_info.seller ===
            localStorage.getItem("account_name") ? null : (
              <ButtonPrimary
                text={"구매하기"}
                css={"justify-self-end self-center"}
                onClick={handleBuyNFT}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}


function NFTAtt({nft_att}) {  
  console.log(`nft att :`, nft_att);

  return (
    <>
      <div className="mt-5 bg-card rounded-xl p-5">
        <div className="font-bold">NFT Attributes</div>
        <table className="w-full mt-7 table-auto border-2 border-slate-500 rounded-lg border-collapse">
          <tbody>
            {nft_att.map((item) => {
              return (
                <tr key={item.key}>
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
    </>
  );
  
}