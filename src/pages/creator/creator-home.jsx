import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { AiOutlinePlusCircle } from "react-icons/ai";
import { VscRefresh } from "react-icons/vsc";
import CreatorHeader from "../../component/creator/creator-header";
import ItemCollection from "../../component/creator/item-collection";
import { postJSON } from "../../js/postJson";
import { GetCollection } from "../../js/api_nft";



export default function CreatorHome() {
  const navigate = useNavigate();

  const [collectionList, setCollectionList] = useState([]);

  const [displayedData, setDisplayedData] = useState([]);
  const [isMoreData, setIsMoreData] = useState(true);
  const [page, setPage] = useState(1);
  let perPage = 12;

  const handleClickCreateCollection = () => {
    navigate("/creator/create-collection");
  };

  const handleLoadMore = () => {
    console.log("handleLoadMore 호출");
    setPage((prev) => prev + 1);
  };

  
  const user_name = localStorage.getItem("account_name");
  useEffect(() => {
    getCollectionList()
  }, [page]);

  useEffect(() => {
    if (collectionList.length > 0) {
      // 현재 페이지에 따라 데이터를 잘라서 표시합니다.
      
      const start = (page - 1) * perPage;
      const end = start + (page === 1 ? 11 : perPage-1);
      console.log(`자르기`, page, end);

      setDisplayedData(collectionList.slice(0, end));
    }
  }, [collectionList, page]);

  async function getCollectionList() {

    const params = {
      datas: {
        sort_type: "user_name",
        bound: [user_name, user_name],
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
        img_background : "https://ipfs.io/ipfs/" + item.serialized_data.find(
          (item) => item.key === "img_background").value[1]
      };
    });
    setCollectionList((prev) => [...prev, ...listingInfo]); // 기존 아이템에 덮어쓰기

    console.log(`load data 이후 page..`, page);

    // 페이지당 데이터 개수에 따라 추가적인 데이터 있는지 확인
    if (response.result.length < perPage) {
      setIsMoreData(false);
    } else {
      setIsMoreData(true);
    }            
  } 


  return (
    <>
      {/* <button onClick={handle}>테스트 버튼</button> */}
      <CreatorHeader
        title="My Collections"
        content="모든 NFT는 컬렉션 내에 있습니다. 이는 동일한 프로젝트의 일부이거나 동일한 작성자가 만든 NFT 그룹입니다."
      />

      <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 grid-cols-1 gap-7">
        <div
          onClick={handleClickCreateCollection}
          className="border-2 border-orange-400 rounded-2xl flex flex-col items-center justify-center h-64"
        >
          <div>
            <AiOutlinePlusCircle size={100} className="text-orange-400" />
          </div>
          <div className="mt-5">NFT Collection 만들기</div>
        </div>

        {displayedData.map((item) => (
          <ItemCollection
            key={item.collection_name}
            img_logo={item.img_logo}
            img_background={item.img_background}
            collection_name={item.collection_name}
            display_name={item.display_name}
          />
        ))}        
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
