import { GetCollection, GetNFT, GetTemplate } from './api_nft';




// 페이지 라우팅 시, 작동하는 메서드. 라우팅 결과 페이지에서 useLoaderData()를 통해 해당 리턴값을 활용한다.
// db 사용해야하므로 해당 값은 db api를 통해 가져올 것.
// 우선 해당 collectionId 값을 통해 api요청을 하고 데이터를 잘 가져왔다는 가정아래 진행할 것.
export async function explorerCollectionLoader({params}) {
    console.log(`loader 호출..`);

    const params_col = {
      datas: {
        sort_type: "collection",
        bound: [params.collectionId, params.collectionId],
        page: 1,
        perPage: 1,
      },
    };
    console.log(`params_col - `, params_col);
    const response_col = await GetCollection(params_col);
    const parse_data = response_col.result[0];  

    console.log(`parse_data - `, parse_data);    

    const col_data = {
      collection_name: parse_data.collection_name,
      author: parse_data.author,
      market_fee: parse_data.market_fee,
      collection_description: parse_data.serialized_data.find(item => item.key === "collection_description").value[1],
      display_name: parse_data.serialized_data.find(item => item.key === "display_name").value[1],
      img_background: "https://ipfs.io/ipfs/"+parse_data.serialized_data.find(item => item.key === "img_background").value[1],
      img_logo: "https://ipfs.io/ipfs/"+parse_data.serialized_data.find(item => item.key === "img_logo").value[1],
      url: parse_data.serialized_data.find(item => item.key === "url").value[1],
    };
    console.log(`col_data - `, col_data);    

    return col_data;     
}


export async function explorerTemplateLoader({params}) {
    console.log(`explorerTemplateLoader - parms : `, params);

    const params_tem = {
      datas: {
        sort_type: "nft",
        scope : params.collectionId,
        bound: [params.templateId, params.templateId],
        page: 1,
        perPage: 1,
      },
    };
    console.log(`params_tem - `, params_tem);
    const response_tem = await GetTemplate(params_tem);
    const parse_data = response_tem.result[0];
    

    const template_data = {
        template_id : parse_data.template_id,
        collection_name : params.collectionId,
        issued_supply : parse_data.issued_supply,
        schema_name : parse_data.schema_name,
        max_supply : parse_data.max_supply,
        burnable : parse_data.burnable,
        transferable : parse_data.transferable,
        template_img : "https://ipfs.io/ipfs/" +parse_data.immutable_serialized_data.find(item => item.key === "img").value[1],
        template_name :  parse_data.immutable_serialized_data.find(item => item.key === "name").value[1],
        immutable_serialized_data : parse_data.immutable_serialized_data
    }

    console.log(`explorerTemplateLoader - template_data`, template_data);
    return template_data;     
}

export async function explorerNFTLoader({params}) {
  console.log(`explorerNFTLoader - parms : `, params);

  const params_nft = {
    datas: {
      sort_type: "nft",
      scope : params.accountName,
      bound: [params.nftId, params.nftId],
      page: 1,
      perPage: 1,
    },
  };
  console.log(`params_nft - `, params_nft);
  const response_nft = await GetNFT(params_nft);
  const parse_data = response_nft.result[0];
  console.log(`response_nft : `, response_nft);

  const nft_data = {
      asset_id : parseInt(parse_data.asset_id),
      collection_name : parse_data.collection_name,
      schema_name : parse_data.schema_name,
      template_id : parse_data.template_id,
      ram_player : parse_data.ram_player,
      nft_name : parse_data.immutable_serialized_data.find(item => item.key === "name").value[1],
      nft_img : "https://ipfs.io/ipfs/" + parse_data.immutable_serialized_data.find(item => item.key === "img").value[1],
      nft_ori_img : parse_data.immutable_serialized_data.find(item => item.key === "img").value[1],
      immutable_serialized_data : parse_data.immutable_serialized_data,
  }

  console.log(`explorerNFTLoader - NFT_data`, nft_data);
  return nft_data;     
}

