import React, { useEffect, useState } from 'react'
import { BiLinkExternal } from "react-icons/bi";
import ButtonPrimary from '../../component/basic/btn-primary';
import {BsLightningCharge, BsCurrencyDollar} from "react-icons/bs"
import { CiGrid41 } from "react-icons/ci";
import { postJSON } from '../../js/postJson';
import { useNavigate, useLocation } from 'react-router-dom';
import { VscRefresh } from "react-icons/vsc";
import { GetMarket} from '../../js/api_market';
import {GetNFT } from '../../js/api_nft';
  
export default function ProfileHome() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedTab = searchParams.get('selectedTab');
  console.log(selectedTab)

  const [selectedTabByUser, setselectedTabByUser] = useState(selectedTab);

  const selectList = [
    "Inventory", "MyListings", "Sold", "Bought", "Transfers"
  ]

  const renderUI = () => {
    if(selectedTabByUser === 'Inventory') {
      return <TabInventory />
    } else if(selectedTabByUser === 'MyListings') {
      return <TabMyListings />
    } else if(selectedTabByUser === 'Sold') {
      return <TabSold />
    } else if(selectedTabByUser === 'Bought') {
      return <TabBought />
    } else if(selectedTabByUser === 'Transfers') {
      return <TabTransfer />
    }
    
  }

  

  return (
    <>
      <div className="flex flex-col">
        <div className="relative h-72">
          <img
            className="absolute w-full h-72"
            src="https://atomichub.io/images/banners/collection-page-banner-placeholder.png"
          ></img>
          <div className="bottom-6 px-5 flex absolute w-full items-center">
            <div className="flex items-center grow">
              <img
                className="w-20 rounded-full"
                src="https://atomichub-ipfs.com/ipfs/QmZNtS2AkpwqF4vfG4wr7JK4jVEsNKWyAcn63iWJ2tnap6"
              ></img>
              <div className="ml-5 font-bold text-2xl">{localStorage.getItem("account_name")}</div>
              <BiLinkExternal className="ml-2" size={20} />
            </div>
            <div>
              {/* <ButtonPrimary text={"프로필 편집하기"} /> */}
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* <div className="col-span-3 flex flex-col bg-card py-9 px-8 rounded-xl">
            <div className="font-bold">Info</div>

            <div className="mt-4 flex items-center">
              <BsLightningCharge />
              <div className="ml-2">구매 총합 : </div>
              <div className="ml-2">1.92 Hep</div>
            </div>

            <div className="mt-4 flex items-center">
              <BsCurrencyDollar />
              <div className="ml-2">판매 총합 : </div>
              <div className="ml-2">1.92 Hep</div>
            </div>

            <div className="mt-4 flex items-center">
              <CiGrid41 />
              <div className="ml-2">인벤토리 총합 : </div>
              <div className="ml-2">1.92 Hep</div>
            </div>
          </div> */}

          <div className="col-span-9 flex flex-col">
            <div className="font-bold text-2xl">Profile Page</div>
            <div className="mt-5 py-5 px-20 bg-tip rounded-lg">
              <div className="font-bold text-lg">
                프로필 페이지에 오신 것을 환영합니다!
              </div>
              <div className="mt-4">
                프로필 사진, 배경 이미지를 추가, 수정할 수 있습니다!
              </div>
              <div>
                또한 교환을 제안한 NFT와 마켓과 관련 NFT를 관리할 수 있습니다.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-32 grid grid-cols-5">
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

      </div>
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

function TabInventory() {
  const navigate = useNavigate();
  
  const [nftsInfo, setNftsInfo] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);

  const [isMoreData, setIsMoreData] = useState(true);
  const [page, setPage] = useState(1);
  let perPage = 12;

  const handleClickNFT = (user_name, asset_id) => {
    console.log("handleClickNFT 호출", user_name, asset_id);
    navigate(`/explorer/nft/${user_name}/${asset_id}`);
  }

  const handleLoadMore = () => {
    console.log("handleLoadMore 호출");
    setPage((prev) => prev + 1);
  };


  useEffect(() => {
    getNFT();
  }, [page]);

  const user_name = localStorage.getItem('account_name'); // 로그인 처리 후, 계정명을 가져와야함.
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
        user_name: user_name,
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
    }
  }


  return (
    <>
      <div className="p-7 grid grid-cols-1 lg:grid-cols-6 gap-4">
        {nftsInfo.map((item) => {
          return <NFTComponent item={item} handleClickNFT={handleClickNFT} />;
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
    </>
  );
}

function NFTComponent({ item, handleClickNFT}) {
  return (
    <div
      key={item.asset_id}
      className="bg-card flex flex-col items-start rounded-xl p-5"
      onClick={() => handleClickNFT(item.user_name, item.asset_id)}
    >
      <img width={250} src={item.nft_img} alt=""></img>
      <div className="mt-2 text-sm font-bold">{item.collection_name}</div>
      <div className="mt-2 text-orange-400 font-bold">{item.nft_name}</div>
      <div className="mt-2 font-bold text-slate-500">{`# ${item.asset_id}`}</div>
    </div>
  );
}

function TabMyListings() {
  const navigate = useNavigate();
  
  const [listingInfo, setListingInfo] = useState([]);
  const [isMoreData, setIsMoreData] = useState(true);
  const [page, setPage] = useState(1);
  let perPage = 12;

  const handleClickListing = (user_name, sale_id) => {
    console.log("handleClickNFT 호출", user_name, sale_id);
    navigate(`/market/sale/${sale_id}`);
  }

  const handleLoadMore = () => {
    console.log("handleLoadMore 호출");
    setPage((prev) => prev + 1);
  };

  
  useEffect(() => {
    get_listing_data();    
  },[page]); 

  const user_name = localStorage.getItem('account_name'); // 로그인 처리 후, 계정명을 가져와야함. 
  async function get_listing_data() {
    const params = {
      datas: {
        sort_type: "seller",
        bound: [user_name, user_name],
        page: page,
        perPage: perPage,
      },
    };
    console.log(`load data - `, params);
    const response = await GetMarket(params);

    process_listing_data(response);
  }

  function process_listing_data(data) {
    console.log("응답 후 데이터 : ", data); // JSON 객체이다. by `data.json()` call
      const listingInfo = data.result
        .filter((item) => item.is_sale === 0) // 해당 아이템이 팔렸으면 판매(리스팅) 목록에 보여주지 않는다.
        .map((item) => {
          
          let price_parts = item.price.split(" "); // 가격 관련 정보 (문자열 데이터 ex-1.0000 Hep)
          let number = parseFloat(price_parts[0]); // 문자열을 숫자로 바꾸어줌
          const formattedNumber = number.toFixed(0); // 소수점 자리 제거
          const resultString = `${formattedNumber} ${price_parts[1]}`; // 문자열 조립

          return {
            sale_id: item.sale_id,
            collection_name: item.collection_name,
            price: resultString,
            asset_name: item.asset_name,
            asset_img: "https://ipfs.io/ipfs/" + item.asset_img,
          };
        });
      setListingInfo((prev) => [...prev, ...listingInfo]);
      if (data.result.length < perPage) {
        setIsMoreData(false);
      }
  }


  return (
    <>
      <div className='p-7 grid grid-cols-1 lg:grid-cols-6 gap-4'>
        {listingInfo.map((item) => {
          return <ListingComponent key={item.sale_id} item={item} handleClickListing={handleClickListing} />;
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
    </>
  );
}

function ListingComponent({ item, handleClickListing}) {
  return (
    <div
      key={item.sale_id}
      className="bg-card flex flex-col items-start rounded-xl overflow-hidden"
      onClick={() => handleClickListing(item.user_name, item.sale_id)}
    >
      <div className='pt-5 px-5'>
        <img width={250} src={item.asset_img} alt=""></img>
        <div className="mt-2 text-sm font-bold">{item.collection_name}</div>
        <div className="mt-2 text-orange-400 font-bold">{item.asset_name}</div>
        <div className="mt-2 font-bold text-lime-400">{`${item.price}`}</div>
      </div>
      <div className="p-2 text-center font-bold mt-2 w-full bg-red-500"><button>판매 수정</button></div>
    </div>
  );
}

function TabSold() {
  const navigate = useNavigate();

  const [listingInfo, setListingInfo] = useState([]);
  const [isMoreData, setIsMoreData] = useState(true);
  const [page, setPage] = useState(1);
  let perPage = 8;

  const handleClickListing = (user_name, sale_id) => {
    console.log("handleClickNFT 호출", user_name, sale_id);
    navigate(`/market/sale/${sale_id}`);
  };

  const handleLoadMore = () => {
    console.log("handleLoadMore 호출");
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    get_listing_data();
  }, [page]);

  const user_name = localStorage.getItem('account_name');; // 로그인 처리 후, 계정명을 가져와야함.
  async function get_listing_data() {
    const params = {
      datas: {
        sort_type: "seller",
        bound: [user_name, user_name],
        page: page,
        perPage: perPage,
      },
    };
    console.log(`load data - `, params);
    const response = await GetMarket(params);

    process_listing_data(response);
  }

  function process_listing_data(data) {
    console.log("응답 후 데이터 : ", data); // JSON 객체이다. by `data.json()` call
    const listingInfo = data.result
      .filter((item) => item.is_sale === 1) // 해당 아이템이 팔린 경우만 데이터를 가져온다.
      .map((item) => {
        let price_parts = item.price.split(" "); // 가격 관련 정보 (문자열 데이터 ex-1.0000 Hep)
        let number = parseFloat(price_parts[0]); // 문자열을 숫자로 바꾸어줌
        const formattedNumber = number.toFixed(0); // 소수점 자리 제거
        const resultString = `${formattedNumber} ${price_parts[1]}`; // 문자열 조립

        return {
          sale_id: item.sale_id,
          collection_name: item.collection_name,
          price: resultString,
          asset_name: item.asset_name,
          asset_img: "https://ipfs.io/ipfs/" + item.asset_img,
          buyer : item.buyer,
          seller : item.seller,
        };
      });
    setListingInfo((prev) => [...prev, ...listingInfo]);
    if (data.result.length < perPage) {
      setIsMoreData(false);
    }
  }

  return (
    <>
      <div className="py-7 px-7 lg:px-28">
        {listingInfo.map((item) => {
          return <SoldComponent key={item.sale_id} item={item} />;
        })}

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
    </>
  );
}

function SoldComponent({item}) {
  return (
    <div
      key={item.sale_id}
      className='bg-card grid grid-cols-1 lg:grid-cols-7 rounded-xl lg:gap-10 px-7 py-10 my-3'
    >
      
      <img className='col-span-1' src={item.asset_img}></img>
      
      <div className='col-span-1 lg:col-span-3 flex flex-col'>
        <div className='grid grid-cols-2 lg:grid-cols-4 p-2'>
          <div className='grid-cols-1 text-sm text-slate-400'>NFT</div>
          <div className='grid-cols-1 font-bold'>{item.asset_name}</div>          
        </div>
        <div className='grid grid-cols-2 lg:grid-cols-4 p-2'>
          <div className='grid-cols-1 text-sm text-slate-400'>Collection</div>
          <div className='grid-cols-1 text-sm'>{item.collection_name}</div>          
        </div>
        <div className='grid grid-cols-2 lg:grid-cols-4 p-2'>
          <div className='grid-cols-1 text-sm text-slate-400'>가격</div>
          <div className='grid-cols-1 font-bold text-lime-400'>{item.price}</div>          
        </div>
      </div>

      <div className='col-span-1 lg:col-span-3 flex flex-col'>
        <div className='grid grid-cols-2 lg:grid-cols-4 p-2'>
          <div className='grid-cols-1 text-sm text-slate-400'>마켓 ID</div>
          <div className='grid-cols-1 font-bold text-orange-400'>{`# ${item.sale_id}`}</div>          
        </div>
        <div className='grid grid-cols-2 lg:grid-cols-4 p-2'>
          <div className='grid-cols-1 text-sm text-slate-400'>판매자</div>
          <div className='grid-cols-1 font-bold text-orange-400'>{item.seller}</div>          
        </div>
        <div className='grid grid-cols-2 lg:grid-cols-4 p-2'>
          <div className='grid-cols-1 text-sm text-slate-400'>구매자</div>
          <div className='grid-cols-1 font-bold text-orange-400'>{item.buyer}</div>          
        </div>
      </div>


    </div>
  )  
}

function TabBought() {
  const navigate = useNavigate();
  
  const [listingInfo, setListingInfo] = useState([]);
  const [isMoreData, setIsMoreData] = useState(true);
  const [page, setPage] = useState(1);
  let perPage = 8;

  const handleClickListing = (user_name, asset_id) => {
    console.log("handleClickNFT 호출", user_name, asset_id);
    navigate(`/explorer/nft/${user_name}/${asset_id}`);
  }

  const handleLoadMore = () => {
    console.log("handleLoadMore 호출");
    setPage((prev) => prev + 1);
  };


  useEffect(() => {
    get_listing_data();
  }, [page]);

  const user_name = localStorage.getItem("account_name"); // 로그인 처리 후, 계정명을 가져와야함.
  async function get_listing_data() {
    const params = {
      datas: {
        sort_type: "buyer",
        bound: [user_name, user_name],
        page: page,
        perPage: perPage,
      },
    };
    console.log(`load data - `, params);
    const response = await GetMarket(params);

    process_listing_data(response);
  }

  function process_listing_data(data) {
    console.log("응답 후 데이터 : ", data); // JSON 객체이다. by `data.json()` call
    const listingInfo = data.result
      .filter((item) => item.is_sale === 1) // 해당 아이템이 팔린 경우만 데이터를 가져온다.
      .map((item) => {
        let price_parts = item.price.split(" "); // 가격 관련 정보 (문자열 데이터 ex-1.0000 Hep)
        let number = parseFloat(price_parts[0]); // 문자열을 숫자로 바꾸어줌
        const formattedNumber = number.toFixed(0); // 소수점 자리 제거
        const resultString = `${formattedNumber} ${price_parts[1]}`; // 문자열 조립

        return {
          sale_id: item.sale_id,
          collection_name: item.collection_name,
          price: resultString,
          asset_name: item.asset_name,
          asset_img: "https://ipfs.io/ipfs/" + item.asset_img,
          buyer : item.buyer,
          seller : item.seller,
        };
      });
    setListingInfo((prev) => [...prev, ...listingInfo]);
    if (data.result.length < perPage) {
      setIsMoreData(false);
    }
  }


  return (
    <>
      <div className="py-7 px-7 lg:px-28">
        {listingInfo.map((item) => {
          return <SoldComponent key={item.sale_id} item={item} />;
        })}

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
    </>
  );
}


function TabTransfer() {
  const navigate = useNavigate();
  
  const [listingInfo, setListingInfo] = useState([]);
  const [isMoreData, setIsMoreData] = useState(true);
  const [page, setPage] = useState(1);
  let perPage = 8;

  const handleClickListing = (user_name, asset_id) => {
    console.log("handleClickNFT 호출", user_name, asset_id);
    navigate(`/explorer/nft/${user_name}/${asset_id}`);
  }

  const handleLoadMore = () => {
    console.log("handleLoadMore 호출");
    setPage((prev) => prev + 1);
  };


  useEffect(() => {
    get_listing_data();
  }, [page]);

  const user_name = localStorage.getItem("account_name"); // 로그인 처리 후, 계정명을 가져와야함.
  async function get_listing_data() {
    const params = {
      datas: {
        sort_type: "buyer",
        bound: [user_name, user_name],
        page: page,
        perPage: perPage,
      },
    };
    console.log(`load data - `, params);
    const response = await GetMarket(params);

    process_listing_data(response);
  }

  function process_listing_data(data) {
    console.log("응답 후 데이터 : ", data); // JSON 객체이다. by `data.json()` call
    const listingInfo = data.result
      .filter((item) => item.is_sale === 1) // 해당 아이템이 팔린 경우만 데이터를 가져온다.
      .map((item) => {
        let price_parts = item.price.split(" "); // 가격 관련 정보 (문자열 데이터 ex-1.0000 Hep)
        let number = parseFloat(price_parts[0]); // 문자열을 숫자로 바꾸어줌
        const formattedNumber = number.toFixed(0); // 소수점 자리 제거
        const resultString = `${formattedNumber} ${price_parts[1]}`; // 문자열 조립

        return {
          sale_id: item.sale_id,
          collection_name: item.collection_name,
          price: resultString,
          asset_name: item.asset_name,
          asset_img: "https://ipfs.io/ipfs/" + item.asset_img,
          buyer : item.buyer,
          seller : item.seller,
        };
      });
    setListingInfo((prev) => [...prev, ...listingInfo]);
    if (data.result.length < perPage) {
      setIsMoreData(false);
    }
  }


  return (
    <>
      <div className="py-7 px-7 lg:px-28">
        {listingInfo.map((item) => {
          return <SoldComponent key={item.sale_id} item={item} />;
        })}

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
    </>
  );
}