import React, { useEffect, useState } from "react";
import { useNavigate, useLoaderData } from "react-router-dom";
import CreatorHeader from "../../component/creator/creator-header";
import CardInput from "../../component/creator/card-input";
import CardPrimary from "../../component/creator/card-primary";
import { postJSON } from "../../js/postJson";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { VscRefresh } from "react-icons/vsc";
import { GetCategory, GetNFT, GetTemplate } from "../../js/api_nft";

export default function ManageCollection() {
  const collection_data = useLoaderData(); // 콜렉션의 정보를 가져온다. collection_name, author, market_fee 등등.
  console.log(`collection_info : `, collection_data);

  const [selectedTab, setSelectedTab] = useState("NFTs");

  const renderUI = () => {
    if (selectedTab === "NFTs") {
      return <TabNFTs author={collection_data.author} collection_name={collection_data.collection_name} />;
    } else if (selectedTab === "Templates") {
      return <TabTemplates collection_name={collection_data.collection_name} />;
    } else if (selectedTab === "Categories") {
      return (
        <TabCategories collection_name={collection_data.collection_name} />
      );
    }
  };

  return (
    <>
      <CreatorHeader
        title={`Collection : ${collection_data.collection_name}`}
        content="컬렉션과 관련된 모든 것을 관리할 수 있습니다."
      />
      <CollectionInfo collection_data={collection_data} />

      <div className="mt-10 grid grid-cols-3">
        <SelectBtn
          text={"NFTs"}
          onClick={setSelectedTab}
          isClick={selectedTab === "NFTs" ? true : false}
        />
        <SelectBtn
          text={"Templates"}
          onClick={setSelectedTab}
          isClick={selectedTab === "Templates" ? true : false}
        />
        <SelectBtn
          text={"Categories"}
          onClick={setSelectedTab}
          isClick={selectedTab === "Categories" ? true : false}
        />
      </div>

      {renderUI()}
    </>
  );
}

// 로그인 처리 후, 계정명을 가져와야함.
function TabNFTs({ author, collection_name }) {
  const navigate = useNavigate();
  console.log(`TabNFTs - collection name : `, collection_name);
  const [nftsInfo, setNftsInfo] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);

  const [isMoreData, setIsMoreData] = useState(true);
  const [page, setPage] = useState(1);
  let perPage = 12;

  const handleCreateNFT = () => {
    console.log("handleCreateNFT 호출");
  };
  const handleClickNFT = (asset_id) => {
    console.log("handleClickNFT 호출", author, asset_id);
    navigate(`/explorer/nft/${author}/${asset_id}`);
  };

  const handleLoadMore = () => {
    console.log("handleLoadMore 호출");
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    getNFT();
  }, [page]);

  useEffect(() => {
    if (nftsInfo.length > 0) {
      // 현재 페이지에 따라 데이터를 잘라서 표시합니다.
      
      const start = (page - 1) * perPage;
      const end = start + (page === 1 ? 11 : perPage-1);
      console.log(`자르기`, page, end);

      setDisplayedData(nftsInfo.slice(0, end));
    }
  }, [nftsInfo, page]);


  async function getNFT() {
    const params = {
      datas: {
        sort_type: "collection",
        scope : author,
        bound: [collection_name, collection_name],
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
    setNftsInfo((prev) => [...prev, ...nftsInfo]);
    if (data.result.length < perPage) {
      setIsMoreData(false);
    }
  }

  return (
    <>
      <div className="p-5 mt-5 grid grid-cols-2 lg:grid-cols-6 gap-5">
        {/* <CreateBtn onClick={handleCreateNFT} text={"NFT 민팅하기"} /> */}
        {nftsInfo.map((item) => {
          return <NFTComponent key={item.asset_id} item={item} handleClickNFT={handleClickNFT} />;
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

function TabTemplates({ collection_name }) {
  const navigate = useNavigate();
  const [templatesInfo, setTemplatesInfo] = useState([]);

  const [displayedData, setDisplayedData] = useState([]);
  const [isMoreData, setIsMoreData] = useState(true);
  const [page, setPage] = useState(1);
  let perPage = 12;

  const handleCreateTemplate = () => {
    console.log("handleCreateTemplate 호출");
    navigate(`/creator/${collection_name}/create-template`);
  };
  const handleClickTemplate = (template_id) => {
    console.log("handleClickTemplate 호출", template_id);
    navigate(`/explorer/template/${collection_name}/${template_id}`);
  };

  const handleLoadMore = () => {
    console.log("handleLoadMore 호출");
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    getTemplate();
  }, [page]);

  useEffect(() => {
    if (templatesInfo.length > 0) {
      // 현재 페이지에 따라 데이터를 잘라서 표시합니다.
      
      const start = (page - 1) * perPage;
      const end = start + (page === 1 ? 11 : perPage-1);
      console.log(`자르기`, page, end);

      setDisplayedData(templatesInfo.slice(0, end));
    }
  }, [templatesInfo, page]);


  async function getTemplate() {
    const params = {
      datas: {
        sort_type: "collection",
        scope : collection_name,
        bound: ["", ""],
        page: page,
        perPage: perPage,
      },
    };
    console.log(`load data - `, params);
    const response = await GetTemplate(params);

    process_tem_data(response);
  }

  function process_tem_data(data) {
    console.log("응답 후 데이터 : ", data); // JSON 객체이다. by `data.json()` call
    const listInfo = data.result.map((item) => {
      return {
        template_id: item.template_id,
        collection_name: item.collection_name,
        issued_supply : item.issued_supply,
        template_name: item.immutable_serialized_data.find(
          (item) => item.key === "name"
        ).value[1],
        template_img:
          "https://ipfs.io/ipfs/" +
          item.immutable_serialized_data.find((item) => item.key === "img")
            .value[1],
      };
    });
    console.log(`nftInfo : `, listInfo);
    setTemplatesInfo((prev) => [...prev, ...listInfo]);
    if (data.result.length < perPage) {
      setIsMoreData(false);
    }
  }


  return (
    <>
      <div className="p-5 mt-5 grid grid-cols-2 lg:grid-cols-6 gap-5">
        <CreateBtn onClick={handleCreateTemplate} text={"템플릿 생성하기"} />
        {displayedData.map((item) => {
          return (
            <TemplateComponent
              item={item}
              handleClickTemplate={handleClickTemplate}
            />
          );
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

function TemplateComponent({ item, handleClickTemplate }) {
  return (
    <div
      key={item.template_id}
      className="bg-card flex flex-col items-start rounded-xl p-5"
      onClick={() => handleClickTemplate(item.template_id)}
    >
      <img src={item.template_img} alt=""></img>
      <div className="mt-2 text-sm font-bold">{item.collection_name}</div>
      <div className="mt-2 text-orange-400 font-bold">{item.template_name}</div>
      <div className="mt-2 font-bold">{`# ${item.template_id}`}</div>
      <div className="mt-2 font-bold text-slate-500">{`# ${item.issued_supply} NFTs`}</div>
    </div>
  );
}

function TabCategories({ collection_name }) {
  const navigate = useNavigate();
  const [categoriesInfo, setCategoriesInfo] = useState([]);

  const [displayedData, setDisplayedData] = useState([]);
  const [isMoreData, setIsMoreData] = useState(true);
  const [page, setPage] = useState(1);
  let perPage = 10;

  const handleLoadMore = () => {
    console.log("handleLoadMore 호출");
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    getCategory();
  }, [page]);

  const handleCreateCategory = () => {
    console.log("handleCreateCategory 호출");
    navigate(`/creator/${collection_name}/create-category`)

  };
  const handleClickCategory = (schema_name) => {
    console.log("handleClickCategory 호출", schema_name);
  };

  useEffect(() => {
    if (categoriesInfo.length > 0) {
      // 현재 페이지에 따라 데이터를 잘라서 표시합니다.
      
      const start = (page - 1) * perPage;
      const end = start + (page === 1 ? 11 : perPage-1);
      console.log(`자르기`, page, end);

      setDisplayedData(categoriesInfo.slice(0, end));
    }
  }, [categoriesInfo, page]);


  async function getCategory() {
    const params = {
      datas: {
        sort_type: "collection",
        scope : collection_name,
        bound: ["", ""],
        page: page,
        perPage: perPage,
      },
    };
    console.log(`load data - `, params);
    const response = await GetCategory(params);

    process_category_data(response);
  }

  function process_category_data(data) {
    console.log("응답 후 데이터 : ", data); // JSON 객체이다. by `data.json()` call
    const listInfo = data.result.map((item) => {
      return {
        schema_name: item.schema_name,
        att_count : item.format.length,
      };
    });
    console.log(`nftInfo : `, listInfo);
    setCategoriesInfo((prev) => [...prev, ...listInfo]);
    if (data.result.length < perPage) {
      setIsMoreData(false);
    }
  }

  return (
    <>
      <div className="p-5 mt-5 grid grid-cols-2 lg:grid-cols-6 gap-5">
        <CreateBtn onClick={handleCreateCategory} text={"카테고리 생성하기"} />
        {displayedData.map((item) => {
          return (
            <CategoryComponent
              item={item}
              handleClickCategory={handleClickCategory}
            />
          );
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

function CategoryComponent({ item, handleClickCategory }) {
  return (
    <>
      <div
        key={item.schema_name}
        className="border-2 bg-card border-orange-400 flex flex-col items-center rounded-xl p-5"
      >
        <div className="text-orange-400 text-xl font-bold">
          {item.schema_name}
        </div>
        <div className="mt-2 text-xl font-bold">{item.collection_name}</div>
        <div className="mt-2">{`${item.att_count} Attributes`}</div>
      </div>
    </>
  );
}

function CollectionInfo({ collection_data }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="bg-card p-3 rounded-xl flex justify-center">
        <img
          src={collection_data.img_logo}
          className="p-10 rounded-xl object-cover"
        ></img>
      </div>
      <CardPrimary
        css={"col-span-1 lg:col-span-2"}
        card_name={"Collection Details"}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CardInput
            input_name={"Collection Name *"}
            name={"collection_name"}
            type={"text"}
            value={collection_data.collection_name}
            isReadOnly={true}
          />
          <CardInput
            input_name={"Display Name *"}
            name={"display_name"}
            type={"text"}
            value={collection_data.display_name}
            isReadOnly={true}
          />
          <CardInput
            input_name={"Website URL *"}
            name={"url"}
            type={"text"}
            value={collection_data.url}
            isReadOnly={true}
          />
          <CardInput
            input_name={"Market Fee *"}
            name={"fee"}
            type={"num"}
            value={collection_data.market_fee}
            isReadOnly={true}
          />
          <CardInput
            input_name={"Collection Description"}
            name={"collection_name"}
            css={"col-span-2"}
            type={"text"}
            value={collection_data.collection_description}
            isReadOnly={true}
          />
        </div>
      </CardPrimary>
    </div>
  );
}

function SelectBtn({ text, isClick, onClick }) {
  const handleClick = () => {
    console.log("handleClick 호출");
    onClick(text);
  };

  return (
    <button
      className={`${
        isClick === true
          ? "border-b-2 border-white text-white"
          : "border-b border-slate-500 text-slate-500"
      } hover:text-white font-bold pb-2`}
      onClick={handleClick}
    >
      {text}
    </button>
  );
}

function CreateBtn({ onClick, text }) {
  return (
    <>
      <div
        onClick={onClick}
        className="border-2 border-orange-400 rounded-2xl flex flex-col items-center justify-center"
      >
        <div>
          <AiOutlinePlusCircle size={70} className="text-orange-400" />
        </div>
        <div className="mt-5 font-bold">{text}</div>
      </div>
    </>
  );
}
