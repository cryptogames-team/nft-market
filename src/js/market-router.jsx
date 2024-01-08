import { GetMarket } from './api_market';
import { GetNFT } from './api_nft';
import { postJSON } from './postJson';



export async function markeSaleLoader({params}) {
  const params_market = {
    datas: {
      sort_type: "sale_id",
      bound: [params.saleId, params.saleId],
      page: 1,
      perPage: 1,
    },
  };
  console.log(`params_market - `, params_market);
  const response_market = await GetMarket(params_market);
  const market_data = response_market.result[0];
  console.log(`market_data : `, market_data);


  let price_parts = market_data.price.split(" "); // 가격 관련 정보 (문자열 데이터 ex-1.0000 Hep)
  let number = parseFloat(price_parts[0]); // 문자열을 숫자로 바꾸어줌
  const formattedNumber = number.toFixed(0); // 소수점 자리 제거
  const resultString = `${formattedNumber} ${price_parts[1]}`; // 문자열 조립



  const params_nft = {
    datas: {
      sort_type: "nft",
      scope : market_data.seller,
      bound: [market_data.asset_id, market_data.asset_id],
      page: 1,
      perPage: 1,
    },
  };
  console.log(`params_nft - `, params_nft);
  const response_nft = await GetNFT(params_nft);
  const nft_data = response_nft.result[0];
  console.log(`nft_data : `, nft_data);


  const sale_data = {
    seller : market_data.seller,
    sale_id :  market_data.sale_id,  
    offer_id : market_data.offer_id,
    collection_name: market_data.collection_name,
    schema_name : market_data.schema_name,
    asset_id : market_data.asset_id,
    ori_price : market_data.price,
    price : resultString,
    asset_name : market_data.asset_name,
    asset_img : "https://ipfs.io/ipfs/"+market_data.asset_img,
    is_sale : market_data.is_sale,
    buyer : market_data.buyer,
    nft_att : nft_data.immutable_serialized_data,
  }


  console.log(`markeSaleLoader - 출력 전, sale_data..`, sale_data);
  return sale_data;
  
  
}