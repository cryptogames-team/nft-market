import React, { useEffect, useState } from "react";
import explorerImg from "../../asset/explorer.png";
import { Link } from "react-router-dom";
import { GetCollection, GetNFT } from "../../js/api_nft";
import { useLoaderData, useNavigate, useOutletContext } from "react-router-dom";

export default function ExplorerHome() {

  
  
  return (
    <>
      <div className="mt-10 p-10 grid grid-cols-1 lg:grid-cols-2 justify-items-center">
        <div>
          <div className="text-slate-400 mb-4">Explore Collections, Templates, NFT </div>
          <div className="font-bold text-2xl lg:text-3xl mb-10">Hep 거래소의 콜렉션, 템플릿, NFT를 탐색해보세요.</div>
          <div className="flex font-bold">
            <div className="text-4xl pr-4 border-r-2 border-slate-500">108K <span className="text-sm font-normal">Collections</span></div>
            <div className="text-4xl px-4 border-r-2 border-slate-500">450M <span className="text-sm font-normal">NFT</span></div>
            <div className="text-4xl px-4">13K <span className="text-sm font-normal">Sales</span></div>
          </div>
        </div>
        <img src={explorerImg} className="w-64 hidden lg:block"></img>
      </div>

      <CollectionList />
      <NFTList />
    </>
  );
}

function CollectionList() {
  const [collectionList, setCollectionList] = useState([]);

  useEffect(() => {
    getCollectionList();  
  }, []);

  async function getCollectionList() {

    const params = {
      datas: {
        sort_type: "user_name",
        bound: ["", ""],
        page: 1,
        perPage: 16,
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
        img_background : "https://ipfs.io/ipfs/" + item.serialized_data.find(
          (item) => item.key === "img_background").value[1]
      };
    });
    setCollectionList((prev) => [...prev, ...listingInfo]); // 기존 아이템에 덮어쓰기
  } 


  return (
    <div className="mt-5 p-10">
        <div className="font-bold text-xl mb-7">Collections</div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {
            collectionList.map(item => {
              return (
                <ItemCollection key={item.collection_name} item={item}/>
              )
            })
          }
        </div>
      </div>
  )
  
}

function ItemCollection({item}) {
  const navigate = useNavigate();
  const handleManageCollection = () => {
    navigate(`/explorer/collection/${item.collection_name}`);
    console.log("handleManageCollection 호출", item.collection_name);
  };

  return (
    <>
      <div
        className="border-2 border-orange-400 rounded-2xl flex flex-col overflow-hidden h-64"
        onClick={() => handleManageCollection(item.collection_name)}
      >
        <div className="grow relative overflow-hidden">
          <img src={item.img_background} className="h-full w-full object-cover"></img>
          <div className="absolute inset-x-0 bottom-0 flex items-center p-3 bg-gray-400 m-5 rounded-lg opacity-75 overflow-hidden">
            <img
              className="h-10 rounded-full opacity-100"
              src={item.img_logo}
            ></img>
            <div className="ml-5">
              <div className="font-bold text-sm">{item.collection_name}</div>
              <div className="text-xs">{item.display_name}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function NFTList() {
  const navigate = useNavigate();
  const [nftList, setNftList] = useState([]);
  
  useEffect(() => {
    getNFT();  
  }, []);

  const handleClickNFT = (asset_id) => {
    console.log("handleClickNFT 호출", asset_id);
    navigate(`/explorer/nft/${"test4"}/${asset_id}`);
  };

  async function getNFT() {
    const params = {
      datas: {
        sort_type: "nft",
        scope : "test4",
        bound: [1099511627776, 2099511627776],
        page: 1,
        perPage: 24,
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
    setNftList((prev) => [...prev, ...nftsInfo]);
  }

  return (
    <div className="mt-5 p-10">
        <div className="font-bold text-xl mb-7">NFTs</div>
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {
            nftList.map(item => {
              return (
                <NFTComponent key={item.asset_id} item={item} handleClickNFT={handleClickNFT}/>
              )
            })
          }
        </div>
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