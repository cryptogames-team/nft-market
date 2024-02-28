import {JsonRpc} from "eosjs";

export async function GetNFT(params) {
    console.log(`GetNFT 호출 : `, params);
    console.log("")
    const rpc = new JsonRpc(`${process.env.REACT_APP_BLOCKCHAIN_URL}`);
  
    const { sort_type, scope, bound, page, perPage } = params.datas;
    // console.log(`sort type - `, sort_type);
  
    // 페이지 번호에 따라 시작과 끝을 계산
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage - 1;
  
    // 검색 유형을 정해준다. 1 : nft, 2 : collection, 3 : schema, 4 : template, user_name - scope만 적용됨.
    let index = 0;
    let key_type = "";
    if (sort_type === "nft") {
      index = 1;
      key_type = "i64";
    } else if (sort_type === "collection") {
      index = 2;
      key_type = "name";
    } else if (sort_type === "schema") {
      index = 4;
      key_type = "name";
    } else if (sort_type === "template") {
      index = 5;
      key_type = "i64";
    } else if (sort_type === "user_name") {
      index = null;
      key_type = "name";
    } else {
      return { result: "sort_type 오류 입니다." };
    }
  
    try {
      let response;
      if (sort_type !== "user_name") {
        response = await rpc.get_table_rows({
          json: true,
          code: "eosio.nft",
          scope: scope,
          table: "assets",
          index_position: index,
          key_type: key_type,
          lower_bound: bound[0],
          upper_bound: bound[1],
          limit: 10000,
        });
      } else {
        response = await rpc.get_table_rows({
          json: true,
          code: "eosio.nft",
          scope: scope,
          table: "assets",
          limit: 10000,
        });
      }
  
      console.log(`GetNFT 응답값 : `, response);
      const data = response.rows.slice(startIndex, endIndex + 1);
      console.log(`GetNFT 최종 결과값 : `, data);
      return { result: data };
    } catch (error) {
      console.error(`GetNFT 오류 : `, error);
      throw error; // 발생한 오류를 호출자에게 전달하기 위해 에러를 다시 던집니다.
    }
  }


  export async function GetCollection(params) {
    console.log(`GetCollection 호출 : `, params);
    const rpc = new JsonRpc(`${process.env.REACT_APP_BLOCKCHAIN_URL}`);
  
    const { sort_type, scope, bound, page, perPage } = params.datas;
    console.log(`sort type - `, sort_type);
  
    // 페이지 번호에 따라 시작과 끝을 계산
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage - 1;
  
    // 검색 유형을 정해준다. 2 - user-name, 3- collection.
    let index = 0;
    let key_type = "";
    if (sort_type === "all") {
      
    } else if (sort_type === "user_name") {
      index = 2;
      key_type = "name";
    } else if (sort_type === "collection") {
      index = 3;
      key_type = "name";
    } else {
      return { result: "sort_type 오류 입니다." };
    }
  
    try {
      let response;
      if (sort_type === "all") {
        response = await rpc.get_table_rows({
            json: true,
            code: "eosio.nft",
            scope: "eosio.nft",
            table: "collections",
            limit: 10000,
          });
      } else {
        response = await rpc.get_table_rows({
            json: true,
            code: "eosio.nft",
            scope: "eosio.nft",
            table: "collections",
            index_position: index,
            key_type: key_type,
            lower_bound: bound[0],
            upper_bound: bound[1],
            limit: 10000,
          });
        
      }
  
      console.log(`GetCollection 응답값 : `, response);
      const data = response.rows.slice(startIndex, endIndex + 1);
      console.log(`GetCollection 최종 결과값 : `, data);
      return { result: data };
    } catch (error) {
      console.error(`GetCollection 오류 : `, error);
      throw error; // 발생한 오류를 호출자에게 전달하기 위해 에러를 다시 던집니다.
    }
  }


  export async function GetTemplate(params) {
    console.log(`GetTemplate 호출 : `, params);
    const rpc = new JsonRpc(`${process.env.REACT_APP_BLOCKCHAIN_URL}`);
  
    const { sort_type, scope, bound, page, perPage } = params.datas;
    console.log(`sort type - `, sort_type);
  
    // 페이지 번호에 따라 시작과 끝을 계산
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage - 1;
  
    // 검색 유형을 정해준다. 1 : nft, 2 : collection, 3 : schema, 4 : template, user_name - scope만 적용됨.
    let index = 0;
    let key_type = "";
    if (sort_type === "nft") {
      index = 1;
      key_type = "i64";
    } else if (sort_type === "collection") {
      index = 0;
      key_type = "name";
    } else if (sort_type === "schema") {
      index = 4;
      key_type = "name";
    } else if (sort_type === "template") {
      index = 5;
      key_type = "i64";
    } else if (sort_type === "user_name") {
      index = null;
      key_type = "name";
    } else {
      return { result: "sort_type 오류 입니다." };
    }
  
    try {
      let response;
      if (sort_type !== "user_name") {
        response = await rpc.get_table_rows({
          json: true,
          code: "eosio.nft",
          scope: scope,
          table: "templates",
          index_position: index,
          key_type: key_type,
          lower_bound: bound[0],
          upper_bound: bound[1],
          limit: 10000,
        });
      } else {
        response = await rpc.get_table_rows({
          json: true,
          code: "eosio.nft",
          scope: scope,
          table: "assets",
          limit: 10000,
        });
      }
  
      console.log(`GetTemplate 응답값 : `, response);
      const data = response.rows.slice(startIndex, endIndex + 1);
      console.log(`GetTemplate 최종 결과값 : `, data);
      return { result: data };
    } catch (error) {
      console.error(`GetTemplate 오류 : `, error);
      throw error; // 발생한 오류를 호출자에게 전달하기 위해 에러를 다시 던집니다.
    }
  }

  export async function GetCategory(params) {
    console.log(`GetCategory 호출 : `, params);
    const rpc = new JsonRpc(`${process.env.REACT_APP_BLOCKCHAIN_URL}`);

    const { sort_type, scope, bound, page, perPage } = params.datas;
    console.log(`sort type - `, sort_type);

    // 페이지 번호에 따라 시작과 끝을 계산
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage - 1;

    // 검색 유형을 정해준다. 1 : schema, collection - scope만 적용됨.
    let index = 0;
    let key_type = "";
    if (sort_type === "schema") {
      index = 1;
      key_type = "name";
    } else if (sort_type === "collection") {
      index = 0;
      key_type = "name";
    } else {
      return "sort type 오류.."
    }

    try {
      const response = await rpc.get_table_rows({
        json: true,
        code: "eosio.nft",
        scope: scope,
        table: "schemas",
        index_position: index,
        key_type: key_type,
        lower_bound: bound[0],
        upper_bound: bound[1],
        limit: 10000,
      });

      console.log(`GetCategory 응답값 : `, response);
      const data = response.rows.slice(startIndex, endIndex + 1);
      console.log(`GetCategory 최종 결과값 : `, data);
      return { result: data };
    } catch (error) {
      console.error(`GetCategory 오류 : `, error);
      throw error; // 발생한 오류를 호출자에게 전달하기 위해 에러를 다시 던집니다.
    }
  }


  export async function GetOffer(params) {
    console.log(`GetOffer 호출 : `, params);
    const rpc = new JsonRpc(`${process.env.REACT_APP_BLOCKCHAIN_URL}`);

    const { sort_type, scope, bound, page, perPage } = params.datas;
    console.log(`sort type - `, sort_type);

    // 페이지 번호에 따라 시작과 끝을 계산
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage - 1;

    // 검색 유형을 정해준다. 1 : offer_id, 2 : sender, 3 : receiver.
    let index = 0;
    let key_type = "";
    if (sort_type === "offer_id") {
      index = 1;
      key_type = "name";
    } else if (sort_type === "sender") {
      index = 2;
      key_type = "name";
    } else if (sort_type === "receiver") {
      index = 3;
      key_type = "name";
    } else {
      return "sort type 오류.."
    }

    try {
      const response = await rpc.get_table_rows({
        json: true,
        code: "eosio.nft",
        scope: 'eosio.nft',
        table: "offers",
        index_position: index,
        key_type: key_type,
        lower_bound: bound[0],
        upper_bound: bound[1],
        limit: 10000,
      });

      console.log(`GetOffer 응답값 : `, response);
      // const data = response.rows.slice(startIndex, endIndex + 1);
      // console.log(`GetOffer 최종 결과값 : `, data);

      const offer_data = response.rows
      .filter(item => item.recipient !== "eosio.market" && item.sender !== "eosio.market")
      .map((item) => {
        return {
          offer_id: item.offer_id,
          sender: item.sender,
          recipient: item.recipient,
          sender_asset_ids: item.sender_asset_ids,
          recipient_asset_ids: item.recipient_asset_ids,
        };
      });

      console.log(`마켓 필터링된 GetOffer 최종 결과값 : `, offer_data);

      if(offer_data.length === 0){
        return {result : "데이터 없음"};
      }

      const offer_img_promise = offer_data
      .map(async (item) => {
        const sender_params = {
          datas: {
            sort_type: "nft",
            scope : item.sender,
            bound: [item.sender_asset_ids[0], item.sender_asset_ids[0]],
            page: 1,
            perPage: 1,
          },
        };

        const receiver_params = {
          datas: {
            sort_type: "nft",
            scope : item.recipient,
            bound: [item.recipient_asset_ids[0], item.recipient_asset_ids[0]],
            page: 1,
            perPage: 1,
          },
        };
        console.log(`sender_params `, sender_params);
        console.log(`receiver_params `, receiver_params);

        const response_for_nft = await Promise.all([GetNFT(sender_params), GetNFT(receiver_params)]);
        console.log(`response_for_nft : `, response_for_nft);

        const sender_response = response_for_nft[0].result[0];
        const recipient_response = response_for_nft[1].result[0];

        return {
          offer_id: item.offer_id,
          sender: item.sender,
          recipient: item.recipient,
          sender_asset_ids: item.sender_asset_ids,
          sender_asset_name : 
            sender_response
            .immutable_serialized_data
            .find((item) => item.key === "name").value[1],
          sender_asset_img : 
            "https://ipfs.io/ipfs/" +
            sender_response
            .immutable_serialized_data
            .find((item) => item.key === "img").value[1],
          sender_collection_name :  sender_response.collection_name,

          recipient_asset_ids: item.recipient_asset_ids,
          recipient_asset_name : 
            recipient_response
            .immutable_serialized_data
            .find((item) => item.key === "name").value[1],
          recipient_asset_img : 
            "https://ipfs.io/ipfs/" +
            recipient_response
            .immutable_serialized_data
            .find((item) => item.key === "img").value[1],       
          recipient_collection_name :  recipient_response.collection_name,
        }                
      })
      const final_response = await Promise.all(offer_img_promise);
      console.log(`final_response `, final_response);


      return final_response;
    } catch (error) {
      console.error(`GetOffer 오류 : `, error);
      throw error; // 발생한 오류를 호출자에게 전달하기 위해 에러를 다시 던집니다.
    }
  }