import {JsonRpc} from "eosjs";

export async function GetMarket(params) {
  console.log(`GetMarket 호출 : `, params);
  const rpc = new JsonRpc("http://14.63.34.160:8888");

  const { sort_type, bound, page, perPage, filter_datas = [0, 100000], selectFilter} = params.datas;
  console.log(`sort type - `, sort_type);

  // 페이지 번호에 따라 시작과 끝을 계산
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage - 1;

  // 검색 유형을 정해준다. 1 : sale id, 2 : collection, 3 : seller, 4 : asset name, 5 : buyer, 6 : is sale, 7 : schema, 8: asset_id
  let index = 0;
  let key_type = "";
  if (sort_type === "sale_id") {
    index = 1;
    key_type = "i64";
  } else if (sort_type === "collection") {
    index = 2;
    key_type = "name";
  } else if (sort_type === "seller") {
    index = 3;
    key_type = "name";
  } else if (sort_type === "asset name") {
    index = 4;
    key_type = "name";
  } else if (sort_type === "buyer") {
    index = 5;
    key_type = "name";
  } else if (sort_type === "isSale") {
    index = 6;
    key_type = "i64";
  } else {
    return { result: "sort_type 오류 입니다." };
  }

  try {
    const response = await rpc.get_table_rows({
      json: true,
      code: "eosio.market",
      scope: "eosio.market",
      table: "sales",
      index_position: index,
      key_type: key_type,
      lower_bound: bound[0],
      upper_bound: bound[1],
      limit: 10000,
    });

    console.log(`GetMarket 응답값 : `, response);
    let data;
    data = response.rows
      .filter(item => {
        let parts = item.price.split(' ');
        let number = parseInt(parts[0]);
        return filter_datas[0] <= number && number <= filter_datas[1];
      })
      .sort((a,b) =>{ 
        if(selectFilter === "recent") {
          return b.sale_id - a.sale_id
        } else if(selectFilter === "old"){
          return a.sale_id - b.sale_id
        } else if(selectFilter === "alpha"){
          return a.asset_name.localeCompare(b.asset_name);          
        } else if(selectFilter === "reverseAlpha"){
          return b.asset_name.localeCompare(a.asset_name);          
        }
      })
      .slice(startIndex, endIndex + 1);
    
    console.log(`GetMarket 최종 결과값 : `, data);
    return { result: data };
  } catch (error) {
    console.error(`GetMarket 오류 : `, error);
    throw error; // 발생한 오류를 호출자에게 전달하기 위해 에러를 다시 던집니다.
  }
}

