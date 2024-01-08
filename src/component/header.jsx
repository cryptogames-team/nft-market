import { Link } from "react-router-dom";
import {
  AiOutlineSearch,
  AiOutlineShoppingCart,
  AiOutlineMenu,
  AiOutlineSetting,
  AiOutlineLoading3Quarters,
  AiOutlineCheckCircle,
} from "react-icons/ai";
import { BiLogOut } from "react-icons/bi";
import { GiCancel } from "react-icons/gi";
import { CiGrid41 } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { BsHandbag } from "react-icons/bs";
import { FiLogOut } from "react-icons/fi";
import { FaRegTrashAlt } from "react-icons/fa";

import {JsonRpc} from "eosjs";

import { useEffect, useState } from "react";
import ButtonPrimary from "./basic/btn-primary";
import Dropdown from "./basic/Dropdown";
import { postJSON } from "../js/postJson";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { isLogin_user, new_deleteJSON_by_token, new_deleteJSON_by_token_data, new_getJSON, new_getJSON_by_token, new_postJSON, new_postJSON_by_token } from "../js/api-new";
import { useRef } from "react";

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

export default function Header({
  isLogin, setIsLogin, setIsNeedLoginModal,
  ref_wallet_login_start,ref_wallet_login_complete,ref_user_name,ref_user_key,
  ref_user_data, ref_trx_data, ref_wallet_start, ref_status, ref_result, ref_wallet_finish}) {

  const navigate =  useNavigate();

  // 로그인 관련 로직
  const ex_userInfo = {
    accountName : "계정 이름",
    publicKey : "공개키",
    balance : "잔액"
  }
  const [userInfo, setUserInfo] = useState(ex_userInfo);

  useEffect(() => {
    if(isLogin) {
      setUserInfo((prev) => ({
        ...prev,
        accountName: localStorage.getItem("account_name"),
      }));   
      getAccountInfo(localStorage.getItem("account_name"))
    }
  }, [isLogin]);

  const handleLogin = () => {
    console.log("handleLogin 호출");
    if(ref_wallet_login_start.current && ref_wallet_login_complete.current){
      ref_wallet_login_complete.current.addEventListener("click", handleLoginComplete);
      ref_wallet_login_start.current.click();
    }
  }
  

  // 지갑을 통해 계정 정보 가져온 이후 실행되는 함수
  const handleLoginComplete = async () => {
    console.log("handleLoginComplete 호출");

    if (ref_user_name.current && ref_user_key.current) {
      const nameValue = ref_user_name.current.value; // 계정 이름
      const keyValue = ref_user_key.current.value; // 공개 키

      console.log(`계정 이름 : ${nameValue}, 공개 키 : ${keyValue}`);
      
      const url = "http://221.148.25.234:6666/user";
      const data = {
        user_name : nameValue
      };

      new_postJSON(url, data).then((response) => {
        setUserInfo((prev) => ({
          ...prev,
          accountName: nameValue,
        }));
        setIsLogin(true);

        console.log(`response : `,response);
        localStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('account_name', nameValue);
        console.log(`access token 저장 확인 : `, localStorage.getItem('access_token'));

        getAccountInfo(nameValue);
      });
    }    
  }

  async function getAccountInfo(accountName) {
    const rpc = new JsonRpc("http://14.63.34.160:8888");
    const response = await rpc.get_account(accountName);
    let balance = response.core_liquid_balance;
    let modifyBalance = balance.replace(".0000", "");
    setUserInfo((prev) => ({
      ...prev,
      balance: modifyBalance,
    }));    
  }
  

  // 메뉴바 관련 로직
  const [isDropBtnMouseOver, setIsDropBtnMouseOver] = useState(false);
  const [isDropDownMouseOver, setIsDropDownMouseOver] = useState(false);


  const handleDropBtnMouseOver = () => {
    setIsDropBtnMouseOver(true);  
  }
  const handleDropBtnMouseOut = () => {
    setTimeout(() => {
      setIsDropBtnMouseOver(false);  
    }, 700)
  }
  const handleDropDownMouseOver = () => {
    setIsDropDownMouseOver(true);  
  }
  const handleDropDownMouseOut = () => {
    setIsDropDownMouseOver(false);  
  }


   // 메뉴바 누를 시 나타나는 모달 관련 로직
   const [isOpen, setIsOpen] = useState(false);
   
   // 장바구니 누를 시 나타나는 모달 관련 변수
   const [isBasketOpen, setIsBasketOpen] = useState(false);
   const [cartList, setCartList] = useState([]);

   const handleClickCart = () => {
     console.log("handleClickCart 호출");
     const url = "http://221.148.25.234:6666/cart/";
     new_getJSON_by_token(url).then(response => {
      // console.log(`장바구니 데이터 : `, response);
      process_basket(response);
     })
   }

   function process_basket(data) {
     console.log("응답 후 데이터 : ", data); // JSON 객체이다. by `data.json()` call
     const basketInfo = data.map((item) => {
       return {
         cart_id : item.cart_id,
         sale_id: item.sale_id,
         item_name: item.nft_name,
         item_img: item.nft_image,
         collection_name: item.collection_name,
         price: item.price,
         offer_id : item.offer_id,
         seller : item.seller,
         asset_id : item.asset_id
       };
     });
     console.log(`basketInfo : `, basketInfo);
     setCartList((prev) => [...prev, ...basketInfo]);
     setIsBasketOpen(true)
   }


   const handleBuyCart = (finalList) => {
     console.log("handleBuyCart 호출", finalList);
     openWaitingModal(); // 트랜잭션 대기 모달 열기

     ref_trx_data.current.value = JSON.stringify(finalList);  
     ref_user_data.current.value = localStorage.getItem('account_name');
    if (ref_wallet_start.current && ref_wallet_finish.current) {
      console.log(`트랜잭션 발생 버튼 클릭시키기..`);
      ref_wallet_finish.current.addEventListener('click', handleCompleteTrx);
      ref_wallet_start.current.click(); // 지갑에서 주입한 이벤트를 발동시키 위해 버튼을 클릭해준다.      
    }
   
   }


   const handleCompleteTrx = () => {
    console.log("handleCompleteTrx 호출");
        
    if(ref_status.current.value === "SUCCESS") {
      // 지갑에서 트랜잭션 요청 성공 시 로직을 작성한다.
      console.log(`transaction id : `, ref_result.current.value);
      
      closeWaitingModal(); // 트랜잭션 대기 중인 모달을 닫아준다.
      openSuccessModal(JSON.parse(ref_result.current.value)[0]);
      setIsBasketOpen(false); // 장바구니 창을 닫아준다.

      // 장바구니 삭제 요청을 보낸다.
      cartList.map((item) => {
        let url = `http://221.148.25.234:6666/cart/bySaleId/${item.sale_id}`;
        new_deleteJSON_by_token_data(url, {
          secretKey: "crypto-games-market-scret-key",
        })
          .then((res) => {
            console.log(`장바구니 전체 삭제 성공`, res);
            setCartList(prev => prev.filter(pItem => pItem.sale_id !== item.sale_id));
          })
          .catch((error) => {
            console.log(`장바구니 전체 삭제 실패`, error);
          });
      });

      ref_wallet_finish.current.removeEventListener("click", handleCompleteTrx);

    } else {
      // 지갑에서 트랜잭션 요청 실패 시 로직을 작성한다.
      alert("장바구니 결제 실패")
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
    const url_explorer = "http://cryptoexplorer.store/Transaction/";
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
    navigate(`/profile?selectedTab=Bought`)   
  }

  function afterSuccessModal() {}

  const handleClickTrading = () => {
    console.log("handleClickTrading 호출");
    if(isLogin) {
      navigate("/trading")
    } else {
      setIsNeedLoginModal(true);            
    }
  }

  const handleClickCreator = () => {
    console.log("handleClickTrading 호출");
    if(isLogin) {
      navigate("/creator")
    } else {
      setIsNeedLoginModal(true);            
    }
  }

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

      <header className="border-b-2 border-gray-700 flex justify-center p-4 w-full h-24">
        <div className="flex container items-center">
          <Link to={"/"} className="md:grow-0 grow text-2xl font-bold">
            NFT 거래소
          </Link>

          <nav className="mx-6 md:flex hidden items-center justify-start space-x-4">
            <Link to={"explorer"}>Explorer</Link>
            <Link to={"market"}>Market</Link>
            <button onClick={handleClickTrading}>Trading</button>
            <button onClick={handleClickCreator}>NFT Creator</button>
          </nav>

          <div className="md:flex hidden grow border rounded-xl w-2/5 p-2 mx-3">
            <AiOutlineSearch size={25} />
          </div>

          <AiOutlineSearch size={25} className="md:hidden mx-3" />

          {isLogin === true ? (
            <>
              <div className=" relative">
                <div className="flex items-center">
                  <div className="md:flex hidden flex-col mx-3">
                    <div className="font-bold">
                      {userInfo.accountName}
                    </div>
                    <div className="font-bold text-lime-400">
                      {userInfo.balance}
                    </div>
                  </div>
                  <button onClick={handleClickCart}>
                    <AiOutlineShoppingCart size={25} className="mx-3" />
                  </button>
                  <button onClick={() => setIsOpen((prev) => !prev)}>
                    <AiOutlineMenu size={25} className="ml-3" />
                  </button>
                </div>

                {isDropBtnMouseOver || isDropDownMouseOver ? (
                  <Dropdown
                    onMouseOver={handleDropDownMouseOver}
                    onMouseOut={handleDropDownMouseOut}
                    css={"mr-10 flex flex-col w-56 -translate-x-32"}
                  >
                    <div className="flex my-3">
                      <CgProfile size={27} />
                      <Link to={""} className="mx-3 font-bold">
                        Profile
                      </Link>
                    </div>
                    <div className="flex my-3">
                      <AiOutlineSetting size={27} />
                      <Link to={""} className="mx-3 font-bold">
                        Setting
                      </Link>
                    </div>
                    <div className="flex items-center my-3">
                      <BiLogOut size={27} />
                      <button className="mx-3 font-bold">Logout</button>
                    </div>
                  </Dropdown>
                ) : null}
              </div>
            </>
          ) : (
            <button className="ml-5" onClick={handleLogin}>Login</button>
          )}
        </div>
      </header>

      <MenuModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setIsLogin={setIsLogin}
        userInfo={userInfo}
      />
      <BasketModal isOpen={isBasketOpen} setIsOpen={setIsBasketOpen} cartList={cartList} setCartList={setCartList} buyCart={handleBuyCart}/>

    </>
  );
}


function MenuModal({isOpen, setIsOpen, setIsLogin, userInfo}) {

  const navigate = useNavigate();


   const togglePopup = () => {
     setIsOpen(prev => !prev);
   };
 
   const menuModalStyles = {
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
       width: "25%",
       height: "100%",
       zIndex: "150",
       top : "0%",
       bottom : "0%",
       right : "0%",
       left : "75%",
       borderRadius: "10px",
       borderColor: "rgb(0,0,0)",
       boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
       color: "white",
       backgroundColor: "#1A203C",
       justifyContent: "center",
       overflow: "auto",
     },
   };

   const handlePageMove = (selectedTab) => {
     console.log("handle 호출");
     navigate(`/profile?selectedTab=${selectedTab}`)   
     setIsOpen(prev => !prev);
   }

   const handleSettingPageMove = () => {
    console.log("handleSettingPageMove 호출");
    navigate(`/profile/setting`)   
    setIsOpen(prev => !prev);
  }

   const handleLogout = () => {
     console.log("handleLogout 호출");
     setIsLogin(false);   
   }

  return (
    <>
      <Modal isOpen={isOpen} style={menuModalStyles} closeTimeoutMS={1000}>
        <div className="h-full flex flex-col">
          <GiCancel className="self-end" size={25} onClick={togglePopup} />
          <div className="my-3 flex">
            <img
              className="rounded-full"
              width={"70px"}
              src="https://atomichub-ipfs.com/ipfs/QmZNtS2AkpwqF4vfG4wr7JK4jVEsNKWyAcn63iWJ2tnap6"
            ></img>
            <div className="ml-3 flex flex-col">
              <div className="flex-grow font-bold text-lg">{localStorage.getItem('account_name')}</div>
              <div className="flex-grow font-bold text-slate-500">
                내 프로필 확인하기
              </div>
            </div>
          </div>

          <div className="my-5 flex flex-col py-4 px-4 bg-slate-700 rounded-xl">
            <div className="text-slate-500 font-bold">보유 잔액</div>
            <div className=" text-lime-400 font-bold text-2xl">{userInfo.balance}</div>
          </div>

          <div className="grow mt-7">
            <div className="flex items-center">
              <CiGrid41 className="text-white" size={35} />

              <div
                className="flex flex-col ml-3"
                onClick={() => handlePageMove("Inventory")}
              >
                <div className="text-xl font-bold">Inventory</div>
                <div className="text-slate-500 text-sm">
                  수집한 NFT를 볼 수 있고 관리할 수 있습니다.
                </div>
              </div>
            </div>

            <div className="mt-10 flex items-center">
              <BsHandbag className="text-white" size={35} />
              <div className="flex flex-col ml-3" onClick={() => handlePageMove("MyListings")}>
                <div className="text-xl font-bold">My Market</div>
                <div className="text-slate-500 text-sm">
                  마켓에 올린 NFT들의 리스트를 볼 수 있습니다.
                </div>
              </div>
            </div>

            <div className="mt-10 flex items-center">
              <AiOutlineSetting className="text-white" size={35} />
              <div className="flex flex-col ml-3" onClick={handleSettingPageMove}>
                <div className="text-xl font-bold">계정 설정</div>
                <div className="text-slate-500 text-sm">
                  계정을 관리할 수 있습니다.
                </div>
              </div>
            </div>
          </div>

          <div className="self-end flex items-center p-2" onClick={handleLogout}>
            <FiLogOut size={35} />
            <div className="ml-3 text-xl font-bold">Logout</div>
          </div>
        </div>
      </Modal>
    </>
  );
}

function BasketModal({isOpen, setIsOpen, cartList, setCartList, buyCart}) {

  const navigate = useNavigate();


   const togglePopup = () => {
     setIsOpen(prev => !prev);
     setCartList([])
   };
 
   const menuModalStyles = {
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
       width: "25%",
       height: "100%",
       zIndex: "150",
       top : "0%",
       bottom : "0%",
       right : "0%",
       left : "75%",
       borderRadius: "10px",
       borderColor: "rgb(0,0,0)",
       boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
       color: "white",
       backgroundColor: "#1A203C",
       justifyContent: "center",
       overflow: "auto",
     },
   };

  

  const handleRemoveItem = (cart_id) => {
    console.log("handleRemoveItem 호출");

    const url = `http://221.148.25.234:6666/cart/remove/${cart_id}`;
    new_deleteJSON_by_token(url).then(response => {
      console.log(`장바구니 삭제 `, response);
      setCartList(prev => {
        return prev.filter(item => item.cart_id !== cart_id)
      })  
    });  
  }

  const handleRemoveAllItem = () => {
    console.log("handleRemoveAllItem 호출");
    
    const url = `http://221.148.25.234:6666/cart/removeall`;
    new_deleteJSON_by_token(url).then(response => {
      console.log(`장바구니 모두 삭제 `, response);
      setCartList([])  
    }); 
  }

  const handleBuyCartList = () => {
    console.log("handleBuyCartList 호출");
    const account_name = localStorage.getItem('account_name');
    
    const finalList = cartList.flatMap(item => {
      return [
        {
          action_account: "eosio.token",
          action_name: "transfer",
          data: {
            from: account_name,
            to: item.seller,
            quantity: item.price+".0000 HEP",
            memo: "dd",
          },
        },
        {
          action_account: "eosio.market",
          action_name: "buynft",
          data: {
            buyer: account_name,
            asset_id: [item.asset_id],
            sale_id: item.sale_id,
            offer_id: item.offer_id,
          },
        },
      ]
    })

    console.log(`finalList :`, finalList);
    buyCart(finalList);
  }

  

  


  return (
    <>
      <Modal isOpen={isOpen} style={menuModalStyles} closeTimeoutMS={1000}>
        <div className="h-full flex flex-col">
          <div className="mt-3 flex">
            <div className="flex-1 text-3xl font-bold">장바구니</div>
            <GiCancel className="self-end" size={25} onClick={togglePopup} />
          </div>

          <div className="flex mt-7">
            <div className="flex-1 text-xl">
              <span className="font-bold">Items</span>
              <span className="ml-3 text-slate-500">
                {`${cartList.length}`}/100
              </span>
            </div>
            <div
              className="text-slate-500 hover:text-white cursor-pointer"
              onClick={handleRemoveAllItem}
            >
              전체 삭제
            </div>
          </div>

          <div className="mt-2 flex-1 overflow-y-auto h-scr pr-3">
            {cartList.map((item) => {
              return (
                <BasketItem key={item.cart_id} item={item} handleRemoveItem={handleRemoveItem} />
              );
            })}
          </div>

          <div className="mt-5 flex flex-col items-center py-4 px-4 bg-slate-700 rounded-xl">
            <div className="flex w-full items-center">
              <div className="text-xl font-bold flex-1">구매 총합</div>
              <div className="text-2xl font-bold">
                <span className="text-lime-400">
                  {cartList.reduce((accumulator, currentValue) => {
                    return accumulator + currentValue.price;
                  }, 0)}
                </span>{" "}
                Hep
              </div>
            </div>
            <ButtonPrimary
              css={"w-full mt-8 font-bold text-xl"}
              text={"구매하기"}
              onClick={handleBuyCartList}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}


function BasketItem({ item , handleRemoveItem }) {
  return (
    <div className="mt-4 flex flex-col border rounded-lg border-slate-500 py-4 px-6">
      <div className="flex items-center">
        <img
          src={item.item_img}
          className="w-3/12 h-auto rounded-lg"
        ></img>
        <div className="ml-7 font-bold flex-1">
          <div className="text-slate-500">#{item.sale_id}</div>
          <div className="mt-1">{item.item_name}</div>
          <div className="mt-1 text-xs">{item.collection_name}</div>
        </div>
        <button className="" onClick={() => handleRemoveItem(item.cart_id)}>
          <FaRegTrashAlt size={20} />
        </button>
      </div>
      <div className="mt-4 text-xl font-bold self-end">
        <span className="text-lime-400">{item.price}</span> Hep
      </div>
    </div>
  );
}
