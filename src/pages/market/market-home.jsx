import React, { useEffect, useState } from 'react'
import {
  AiOutlineSearch,
  AiOutlineShoppingCart,
  AiOutlineLoading3Quarters,
  AiOutlineCheckCircle,
} from "react-icons/ai";
import { TbTilde } from "react-icons/tb";
import { BsTrash } from "react-icons/bs";
import { VscRefresh } from "react-icons/vsc";
import { MdOutlineCancel } from "react-icons/md";
import { postJSON } from '../../js/postJson';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { GetMarket } from '../../js/api_market';
import { GetCollection } from '../../js/api_nft';
import { new_deleteJSON_by_token, new_deleteJSON_by_token_data, new_getJSON_by_token, new_postJSON_by_token } from '../../js/api-new';
import Modal from "react-modal";

// import { GetMarket } from '../../js/api_market';

const filter_list = ["basic", "search"]; // basic - 기본 모드 (안팔린 마켓 제품 모두), search - 검색 모드 (검색된 제품 모두)
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
  
export default function MarketHome() {

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
  

  const [saleItems, setSaleItems] = useState([]); // 마켓 아이템을 담는 변수
  const [isMoreData, setIsMoreData] = useState(false); // 더 가져올 데이터가 있는지 확인하는 변수

  const [filterMode, setFilterMode] = useState(filter_list[0]);
  const [searchText, setSearchText] = useState(""); // 검색어 관련 변수
  const [price, setPrice] = useState({low:0 , high : 10000000});
  const [selectFilter, setSelectFilter] = useState('recent');
  
  const [page, setPage] = useState(1); // 페이지 수
  const perPage = 12; // 페이지 당 보여주는 최대 데이터의 개수
  

  useEffect(() => {
    new_fetch_data()
  }, [page, filterMode, price, selectFilter]);

  async function new_fetch_data() {
    let sort_type; // api 요청 방식
    let bound_data;

    if (filterMode === filter_list[0]) {
      // 기본 모드 - basic 라면 bound는 isSale이 아닌 값 = 0
      bound_data = [0, 0];
      sort_type = "isSale";
      
    } else if (filterMode === filter_list[1]) {
      // 기본 모드 - 검색 모드라면 bound는 검색어가 되어야함
      bound_data = [searchText, searchText+"z"];
      sort_type = "asset name";
    }


    const params = {
      datas: {
        sort_type: sort_type,
        bound: bound_data,
        page: page,
        perPage: perPage,
        filter_datas : [price.low, price.high],
        selectFilter : selectFilter        
      },
    };
    console.log(`load data - `, params);

    const response = await GetMarket(params);
    console.log(`응답 데이터 : `, response);
    
    process_data(response);  
  }

  // 응답 후 데이터를 처리해주는 메서드
  function process_data(response) {
    const listingInfo = response.result.map((item) => {
      let price_parts = item.price.split(" "); // 가격 관련 정보 (문자열 데이터 ex-1.0000 Hep)
      let number = parseFloat(price_parts[0]); // 문자열을 숫자로 바꾸어줌
      const formattedNumber = number.toFixed(0); // 소수점 자리 제거
      const resultString = `${formattedNumber} ${price_parts[1]}`; // 문자열 조립

      return {
        sale_id: item.sale_id,
        collection_name: item.collection_name,
        price: formattedNumber,
        asset_name: item.asset_name,
        asset_img: "https://ipfs.io/ipfs/" + item.asset_img,
        seller: item.seller,
        buyer: item.buyer,
        asset_id : item.asset_id,
        offer_id : item.offer_id,
        seller : item.seller
      };
    });
    setSaleItems((prev) => [...prev, ...listingInfo]); // 기존 아이템에 덮어쓰기

    console.log(`load data 이후 page..`, page);

    // 페이지당 데이터 개수에 따라 추가적인 데이터 있는지 확인
    if (listingInfo.length < perPage) {
      setIsMoreData(false);
    } else {
      setIsMoreData(true);
    }    
  }


  const handleSearch = () => {
    console.log("handleSearch 호출 됨....");
    setSaleItems([]); // 아이템 초기화
    setFilterMode(filter_list[1]) // 모드 설정
    setPage(1); // 페이지 설정    
  }

  const handleReset = () => {
    console.log("handle 호출");
    setSaleItems([]); // 아이템 초기화
    setFilterMode(filter_list[0]) // 모드 설정
    setPage(1); // 페이지 설정    
  }
  
  // 데이터를 추가적으로 불러오는 함수. 기본모드일때와 검색 모드일 때 불러오는 데이터가 다르다.
  const handleLoadMore = () => {
    console.log("handleLoadMore 호출 - page : ", page);
    setPage((prev) => prev + 1);   
  }

  // 모달 창 관련 변수
  const navigate =  useNavigate();

  const [modalWaitingIsOpen, setModalWaitingIsOpen] = useState(false);
  const [modalSuccessIsOpen, setModalSuccessIsOpen] = useState(false);

  const [trxId, setTrxId] = useState("");
  const [shortId, setShortId] = useState("");
  
  const openWaitingModal = () => setModalWaitingIsOpen(true); // 트랜잭션 대기 모달을 띄어주는 메서드
  const closeWaitingModal = () => setModalWaitingIsOpen(false); // 트랜잭션 대기 모달을 닫아주는 메서드
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
    navigate(`/profile?selectedTab=Bought`)   
  }

  const handleBuyItem = (trx_data, sale_id) => {
    console.log(`handleBuyItem 호출`, trx_data);
    openWaitingModal(); // 트랜잭션 대기 모달 열기

    ref_trx_data.ref_trx_data.current.value = JSON.stringify(trx_data);  
    ref_user_data.ref_user_data.current.value = localStorage.getItem('account_name');
    if (ref_wallet_start.ref_wallet_start.current && ref_wallet_finish.ref_wallet_finish.current) {
      console.log(`트랜잭션 발생 버튼 클릭시키기..`);

      const handleCompleteTrxWithArgs = () => {
        handleCompleteTrx(sale_id);
      };

      ref_wallet_finish.ref_wallet_finish.current.addEventListener('click', handleCompleteTrxWithArgs);
      ref_wallet_start.ref_wallet_start.current.click(); // 지갑에서 주입한 이벤트를 발동시키 위해 버튼을 클릭해준다.      
    }
  }
  
  const handleCompleteTrx = (sale_id) => {
    console.log("handleCompleteTrx 호출", sale_id); 
    console.log(`status 밸류 : `,ref_status.ref_status.current.value);

    
    if(ref_status.ref_status.current.value === "SUCCESS") {
      // 지갑에서 트랜잭션 요청 성공 시 로직을 작성한다.
      console.log(`transaction id : `, ref_result.ref_result.current.value);
      
      closeWaitingModal(); // 트랜잭션 대기 중인 모달을 닫아준다.
      openSuccessModal(JSON.parse(ref_result.ref_result.current.value)[0]);
      

      // 장바구니 삭제 요청을 보낸다.
      let url = `http://221.148.25.234:6666/cart/bySaleId/${sale_id}`;
      new_deleteJSON_by_token_data(url, {
        secretKey: "crypto-games-market-scret-key",
      })
      .then((res) => {
        console.log(`장바구니 전체 삭제 성공`, res);
      })
      .catch((error) => {
        console.log(`장바구니 전체 삭제 실패`, error);
      });
    
    } else {
      // 지갑에서 트랜잭션 요청 실패 시 로직을 작성한다.
      // alert("장바구니 결제 실패")
    }

    ref_wallet_finish.ref_wallet_finish.current.removeEventListener('click', handleCompleteTrx);
    
  };


  return (
    <>
    <Modal
        isOpen={modalWaitingIsOpen}
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


    <div className="flex">
      <div className="w-96 h-fit bg-card p-5 hidden lg:flex lg:flex-col rounded-xl">
        <div className="text-xl font-bold">Filter by</div>
        <SearchCollectionFilter />
        <PriceFilter setPrice={setPrice} setFilterMode={setFilterMode} setSaleItems={setSaleItems} />
      </div>

      <div className="w-full p-5">
        <MainFilters
          searchText={searchText}
          setSearchText={setSearchText}
          handleSearch={handleSearch}
          handleReset={handleReset}
          setSelectFilter={setSelectFilter}
          setSaleItems={setSaleItems}
        />
        <div className="mt-7">
          <div className="font-bold text-xl">Listings</div>

          <div className="mt-7 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {saleItems.map((item) => {
              return <MarketItemComponent key={"sale"+item.sale_id} item={item} handleBuyItem={handleBuyItem} />;
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
      </div>
    </div>
    </>
  );
  
}

/*
우측 메인화면
*/

// 메인화면의 필터들
function MainFilters({searchText,setSearchText,handleSearch,handleReset, setSelectFilter, setSaleItems}) {

  const [showEnterButton, setShowEnterButton] = useState(false);
  const [isSearch, setIsSearch] = useState(false);

  const handleInputChange = (e) => {
    setSearchText(e.target.value.trim());

    // 입력 필드에 문자열이 있는 경우 Enter 버튼을 표시
    setShowEnterButton(e.target.value.trim().length > 0);
  };

  const handleEnterKeyPress = (e) => {
    if (e.key === "Enter" && searchText.length > 0) {
      handleSearch();
      setIsSearch(true);      
    }
  };

  const handleEnterKeyClick = (e) => {
    handleSearch();
    setIsSearch(true);
  };

  const handleRemoveSearch = () => {
    console.log("handleRemoveSearch 호출");
    setIsSearch(false);
    setShowEnterButton(false);
    handleReset();
    setSearchText("");
  }

  const handleSelectChange = (e) => {
    console.log("handleSelectChange 호출",e.target.value);
    setSelectFilter(e.target.value)  
    setSaleItems([])
  }


  return (
    <>
      <div className="text-2xl font-bold">Hep Market</div>
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-4 p-2 rounded-2xl flex border border-slate-400">
          <button className="flex-grow bg-orange-400 p-1 rounded-2xl">
            Listing
          </button>
          <button className="mx-2 flex-grow p-1 rounded-2xl">Auctions</button>
          <button className="flex-grow p-1 rounded-2xl">History</button>
        </div>
        <div className="group lg:col-span-6 flex flex-grow border border-slate-400 items-center p-3 rounded-2xl">
          <AiOutlineSearch size={20} />
          <input
            className="ml-2 bg-inherit w-full focus:outline-none"
            placeholder="검색하고자 하는 NFT의 이름을 입력하세요."
            value={searchText}
            onChange={handleInputChange}
            onKeyDown={handleEnterKeyPress}
          ></input>
          {showEnterButton && (
            <button
              className="mr-2 text-xs border rounded-xl px-2 border-slate-400 bg-slate-600"
              onClick={handleEnterKeyClick}
            >
              Enter
            </button>
          )}
        </div>

        <select
          className="lg:col-span-2 bg-inherit text-center border border-slate-400 rounded-2xl p-2"
          name="type"
          onChange={handleSelectChange}
        >
          <option className="bg-card" name="type" value="recent">
            최신순
          </option>
          <option className="bg-card" name="type" value="old">
            오래된 순
          </option>
          <option className="bg-card" name="type" value="alpha">
            알파벳순(A-Z)
          </option>
          <option className="bg-card" name="type" value="reverseAlpha">
            알파벳 역순(A-Z)
          </option>
        </select>
      </div>

      {isSearch && (
        <div className="mt-5 flex">
          <button
            className="flex items-center justify-center text-sm bg-slate-600 p-2 rounded-xl"
            onClick={handleRemoveSearch}
          >
            <div className="mr-2">검색어 : {searchText}</div>
            <MdOutlineCancel size={17} />
          </button>

          <button
            className="ml-3 flex items-center justify-center text-sm bg-red-500 p-2 rounded-xl"
            onClick={handleRemoveSearch}
          >
            <div className="mr-2">필터 제거</div>
            <BsTrash size={17} />
          </button>
        </div>
      )}
    </>
  );
}

// 마켓에 올라온 아이템의 컴포넌트
function MarketItemComponent({item, handleBuyItem}) {
  const navigate =  useNavigate();
  const {
    isLogin,
    setIsLogin,
    setIsNeedLoginModal,
    ref_user_data,
    ref_trx_data,
    ref_wallet_start,
    ref_status,
    ref_result,
    ref_wallet_finish,
  } = useOutletContext();

  const [isCart, setIsCart] = useState(false);

  useEffect(() => {
    const url = "http://221.148.25.234:6666/cart/";

    if(isLogin.isLogin) {
      console.log(`로그인되어있음...`);
      new_getJSON_by_token(url).then(response => {
        // console.log(`장바구니 데이터 : `, response);
        if(response.some(e => e.sale_id === item.sale_id)) {
          setIsCart(true)
        } else {
          setIsCart(false)
        }
       })
    }
    
     
  }, []);

  const handleClickSaleItem = (saleId) => {
    console.log("handleClickSaleItem 호출");  
    navigate(`/market/sale/${saleId}`)
  }

  const handleBuy = () => {
    console.log("handleBuyItem 호출");
    if(isLogin.isLogin) {
      const user_name = localStorage.getItem('account_name'); // 세션 요청으로부터 user의 이름을 가져와야함.
      const new_data = [
        {
          action_account: "eosio.token",
          action_name: "transfer",
          data: {
            from: user_name,
            to: item.seller,
            quantity: item.ori_price,
            memo: "dd",
          },
        },
        {
          action_account: "eosio.market",
          action_name: "buynft",
          data: {
            buyer: user_name,
            asset_id: [item.asset_id],
            sale_id: item.sale_id,
            offer_id: item.offer_id,
          },
        },
      ];

      handleBuyItem(new_data, item.sale_id)      
    } else {
      setIsNeedLoginModal.setIsNeedLoginModal(true);      
    }
  
  }

  const handleAddCart = () => {
    console.log("handleAddCart 호출");
    if(isLogin.isLogin){
      const url = "http://221.148.25.234:6666/cart/";
      const params = {
        sale_id: item.sale_id,
        collection_name: item.collection_name,
        nft_name: item.asset_name,
        nft_image: item.asset_img,
        price: parseInt(item.price, 10),
        asset_id : item.asset_id,
        offer_id : parseInt(item.offer_id,10),
        seller : item.seller
      };
      console.log(`handleAddCart 데이터 : `, params);
      new_postJSON_by_token(url, params).then(response => {
        console.log(`장바구니 호출 후 응답 `, response);
        setIsCart(true);
      }) ;  

    } else {
      setIsNeedLoginModal.setIsNeedLoginModal(true);      
    }
    
  }

  const handleRemoveCart = () => {
    console.log("handleRemoveCart 호출", item.sale_id);
    const url = `http://221.148.25.234:6666/cart/removeBySaleID/${item.sale_id}`;
    new_deleteJSON_by_token(url).then(response => {
      setIsCart(false);
    });    
  }
  


  return (
    <>
      <div
        key={item.sale_id}
        className="bg-card flex flex-col items-start rounded-xl col-span-2 lg:col-span-1 overflow-hidden"
      >
        <div className="px-5" onClick={() => handleClickSaleItem(item.sale_id)}>
          <img className="mt-4" src={item.asset_img} alt=""></img>
          <div className="mt-2 text-sm font-bold">{item.collection_name}</div>
          <div className="mt-2 text-orange-400 font-bold">
            {item.asset_name}
          </div>
          <div className="mt-2 text-lime-400 font-bold">{item.price} HEP</div>
        </div>

        {isCart === true ? (
          <div className="mt-2 flex w-full">
            <button className='bg-red-500 w-full font-bold p-2' onClick={handleRemoveCart}>장바구니 제거</button>
          </div>
        ) : (
          <div className="mt-2 flex w-full">
            <button className="flex-grow bg-slate-700 p-2 font-bold" onClick={handleBuy}>구매하기</button>
            <button className="bg-slate-700 ml-1 p-2" onClick={handleAddCart}>
              <AiOutlineShoppingCart />
            </button>
          </div>
        )}

      </div>
    </>
  );
}




/*
좌측 필터 관련 컴포넌트
*/

// 20개 정도 보여주고, Load More을 눌렀을 때 데이터를 추가적으로 가져오도록 한다.
function SearchCollectionFilter() {

  const [searchedCollections, setSearchedCollections] = useState([]);

  const [isSearch, setIsSearch] = useState(false);
  const [searchText, setSearchText] = useState(""); // 검색어 관련 변수
  const [isMoreData, setIsMoreData] = useState(true);
  const [page, setPage] = useState(1);
  let perPage = 12;

  useEffect(() => {
    getCollectionList();
  }, [page, searchText, isSearch]);

  const handleLoadMore = () => {
    console.log("handleLoadMore 호출 - page : ", page);
    setPage((prev) => prev + 1);   
  }

  const handleOnSearchText = (e) => {
    console.log("handleOnSearch 호출", e.target.value);

    if(e.target.value === "") {
      setSearchedCollections([]);
      setPage(1);
      setIsSearch(false);  
    } else {
      const regex =  /^(?:[a-z1-5]{1,12})$/; // 정규 표현식: 소문자 a~z와 숫자 1~5까지만 허용
      if (regex.test(e.target.value)) {
        console.log(`허용`);
        setSearchText(e.target.value.trim());
        setSearchedCollections([]);
        setPage(1);
        setIsSearch(true);  
      }
      console.log(`허용x`);
    }
  }

  async function getCollectionList() {

    let sort_type = "";
    let bound_data = [];

    if(isSearch) {
      sort_type = "collection"
      bound_data = [searchText, searchText+"z"]
    } else {
      sort_type = "all"
    }


    const params = {
      datas: {
        sort_type: sort_type,
        bound: bound_data,
        page: page,
        perPage: perPage,
      },
    };
    console.log(`load data - `, params);
    const response = await GetCollection(params);

    process_col_data(response);
  }

  function process_col_data(response) {
    const listingInfo = response.result.map((item) => {
      
      return {
        collection_name: item.collection_name,
        display_name: item.serialized_data.find(
          (item) => item.key === "display_name").value[1],
        img_logo: "https://ipfs.io/ipfs/" + item.serialized_data.find(
          (item) => item.key === "img_logo").value[1],
      };
    });
    setSearchedCollections((prev) => [...prev, ...listingInfo]); // 기존 아이템에 덮어쓰기

    console.log(`load data 이후 page..`, page);

    // 페이지당 데이터 개수에 따라 추가적인 데이터 있는지 확인
    if (response.result.length < perPage) {
      setIsMoreData(false);
    } else {
      setIsMoreData(true);
    }            
  } 


  return (
    <div className="mt-10">
      <div className="text-xs font-bold">Collections</div>
      <div className="mt-2 text-sm">
        <div className="flex border border-slate-400 items-center p-2 rounded-md">
          <AiOutlineSearch size={20} />
          <input
            className="ml-2 bg-inherit w-full focus:outline-none"
            placeholder="컬렉션을 검색하세요."
            onChange={handleOnSearchText}
          ></input>
        </div>
      </div>

      <div className="mt-4 bg-body p-2 rounded-md overflow-auto max-h-96 ">
        {searchedCollections.map((item) => {
          return (
            <SearchedCollectionItem
              key={item.collection_name}
              collection_info={item}
            />
          );
        })}

        {isMoreData && (
          <div className="mx-4 mt-4 flex justify-center border-2 rounded-xl p-2">
            <VscRefresh size={25} />
            <div className="ml-2 text-lg font-bold " onClick={handleLoadMore}>
              Load More
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 검색된 콜렉션 리스트의 아이템들
function SearchedCollectionItem({ collection_info }) {
  return (
    <div className="flex p-2 my-1">
      <img
        src={collection_info.img_logo}
        className=" rounded-full"
        width={40}
      ></img>
      <div className="ml-3 flex flex-col text-xs justify-center">
        <div className="font-bold">{collection_info.collection_name}</div>
        <div className="mt-1 text-slate-500">{collection_info.display_name}</div>
      </div>
    </div>
  );
}

// 가격 관련 컴포넌트
function PriceFilter({setPrice, setSaleItems}) {

  const handleChangeLowPrice = (e) => {
    console.log("handleChangeLowPrice 호출", e.target.value);
    
    setPrice(prev => {
      if(e.target.value === ""){
        return {...prev, low : 0}      
      } else {
        return {...prev, low : e.target.value}
      }
    })    
    setSaleItems([]);
  }

  const handleChangeHighPrice = (e) => {
    console.log("handleChangeHighPrice 호출", e.target.value);
    setPrice(prev => {
      if(e.target.value === ""){
        return {...prev, high : 10000000}      
      } else {
        return {...prev, high : e.target.value}
      }
    })    
    setSaleItems([]);
  }


  return (
    <div className="mt-10">
      <div className="text-xs font-bold">Price</div>
      <div className="mt-2 flex items-center text-xs">
        <div className="flex border border-slate-400 items-center p-2 rounded-md">
          <input
            className="bg-inherit w-full focus:outline-none"
            type="num"
            placeholder="Min price"
            onChange={handleChangeLowPrice}
          ></input>
          <div className="ml-2">Hep</div>
        </div>
        <TbTilde size={35} className="mx-2" />
        <div className="flex border border-slate-400 items-center p-2 rounded-md">
          <input
            className="bg-inherit w-full focus:outline-none"
            type="num"
            placeholder="Max price"
            onChange={handleChangeHighPrice}
          ></input>
          <div className="ml-2">Hep</div>
        </div>
      </div>
    </div>
  );
}


