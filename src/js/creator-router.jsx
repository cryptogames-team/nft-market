import React from 'react'
import { postJSON } from './postJson';
import { GetCollection } from './api_nft';

// Getcol api 를 사용해서, 콜렉션 이름을 통해서 콜렉션의 정보를 받아오면 된다.
// 유저의 이름은 로그인된 정보로부터 받아온다. (현재는 하드코딩함)
export async function creatorCollectionLoader({params}) {
    console.log(`creatorCollectionLoader - parms : `, params.collectionId);

    const api_params = {
      datas: {
        sort_type: "collection",
        bound: [params.collectionId, params.collectionId],
        page: 1,
        perPage: 1,
      },
    };
    console.log(`load data - `, api_params);
    const response = await GetCollection(api_params);
    
    console.log(`creatorCollectionLoader - Getcol 호출..`, response);

    const listingInfo = response.result.map((item) => {
      return {
        author : item.author,
        collection_name: item.collection_name,
        display_name: item.serialized_data.find(
          (item) => item.key === "display_name").value[1],
        img_logo: "https://ipfs.io/ipfs/" + item.serialized_data.find(
          (item) => item.key === "img_logo").value[1],
        img_background : "https://ipfs.io/ipfs/" + item.serialized_data.find(
          (item) => item.key === "img_background").value[1],
        market_fee : item.market_fee,
        url : item.serialized_data.find(
          (item) => item.key === "url").value[1],
        collection_description : item.serialized_data.find(
          (item) => item.key === "collection_description").value[1],

      };
    });

    console.log(`creatorCollectionLoader - 출력 전, collection_data..`, listingInfo[0]);
    return listingInfo[0];     
}