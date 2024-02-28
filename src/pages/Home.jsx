import React, { useEffect, useRef, useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import homeImg from "../asset/home.png";
import cryptoguysImg from "../asset/cryptoguys.png";
import sunflowerImg from "../asset/sunflower.png";
import explorerImg from "../asset/익스플로러.png";
import walletImg from "../asset/지갑.png";


// import required modules
import { Pagination, Navigation } from 'swiper/modules';
import ButtonPrimary from '../component/basic/btn-primary';
import { GetMarket } from '../js/api_market';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  
  const [saleItems, setSaleItems] = useState([]); // 마켓 아이템을 담는 변수
  useEffect(() => {
    new_fetch_data()
  }, []);

  async function new_fetch_data() {
    let sort_type = "isSale"; // api 요청 방식
    let bound_data = [0, 0];

    const params = {
      datas: {
        sort_type: sort_type,
        bound: bound_data,
        page: 1,
        perPage: 6
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
    setSaleItems(listingInfo); // 기존 아이템에 덮어쓰기
  }
  

  return (
    <>
      <Slide />        
      <News />

      <div className='mt-5 p-10'>
        <div className="font-bold text-2xl mb-8">New Sales</div>
        <div className='grid grid-cols-2 lg:grid-cols-6 gap-4'>
        {
          saleItems.map(item => <MarketItemComponent key={item.sale_id} item={item}/>)
        }
        </div>
        
      </div>

      
    </>
  );
}

function Slide() {
  return (
    <div className="mt-10">
        <Swiper
          pagination={true}
          navigation={true}
          modules={[Pagination, Navigation]}
          className="mySwiper w-full h-full"
        >
          <SwiperSlide>
            <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-4 justify-items-center">
              <div className=''>
                <div className='text-slate-400 text-sm mb-4'>Welcome to NFT 거래소</div>
                <div className='font-bold text-2xl lg:text-4xl mb-4'>Heptagon에 기반한 <span className='text-orange-400'>게임용</span> NFT 플랫폼</div>
                <div className='text-slate-400 mb-10'>Get Started!</div>
                <div className='flex'>
                  <ButtonPrimary text={"Login"} />
                </div>
              </div>
              <img src={homeImg} className='w-80'></img>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
  )  
}

function News() {
  return (
    <div className="mt-10 p-10">
      <div className="font-bold text-2xl mb-8">News and Stories</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg overflow-hidden p-5">
          <img src={cryptoguysImg}></img>
          <div className="px-5 pt-3 pb-3">
            <div className="text-slate-400 text-sm mt-10 mb-3">2023.11.20 (월)</div>
            <div className="font-bold text-xl">
              <a>크립토 가이즈 - Heptagon 기반 라스트 맨 스탠딩 장르 게임 출시임박!</a>
            </div>
          </div>
        </div>
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-5 mb-5 border-b-2 border-slate-500">
            <img className="hidden lg:block" src={sunflowerImg}></img>
            <div className="col-span-2">
              <div className="text-slate-400 mb-2">2023.11.18 (토)</div>
              <div className="font-bold text-xl">
                <a href='https://crypto-farm.store' target='_blank' className=''>크립토 팜 - Heptagon 기반 농장 재배 및 자원 채굴 게임 출시 임박!{" "}</a>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-5 mb-5 border-b-2 border-slate-500">
            <img className="hidden lg:block" src={explorerImg}></img>
            <div className="col-span-2">
              <div className="text-slate-400 mb-2">2023.11.16 (목)</div>
              <div className="font-bold text-xl">
                <a href='https://cryptoexplorer.store' target='_blank'>크립토 익스플로러 - Heptagon 기반 블록 탐색기 출시</a>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-5 mb-5 ">
            <img className="hidden lg:block" src={walletImg}></img>
            <div className="col-span-2">
              <div className="text-slate-400 mb-2">2023.11.14 (화)</div>
              <div className="font-bold text-xl">
                <a>Hep Wallet - Heptagon 기반 HD Wallet 출시</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function MarketItemComponent({item}) {
  const navigate =  useNavigate();

  const handleClickSaleItem = (saleId) => {
    console.log("handleClickSaleItem 호출");  
    navigate(`/market/sale/${saleId}`)
  }

  return (
    <>
      <div
        className="bg-card flex flex-col items-start rounded-xl col-span-2 lg:col-span-1 overflow-hidden"
      >
        <div className="px-5" onClick={() => handleClickSaleItem(item.sale_id)}>
          <img className="mt-4" src={item.asset_img} alt=""></img>
          <div className="mt-2 text-sm font-bold">{item.collection_name}</div>
          <div className="mt-2 text-orange-400 font-bold">
            {item.asset_name}
          </div>
          <div className="my-2 text-lime-400 font-bold">{item.price} HEP</div>
        </div>

      </div>
    </>
  );
}