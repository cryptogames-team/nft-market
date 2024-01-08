export async function new_postJSON_by_token(url = "", data = {}) {
    console.log(`access_token : `, localStorage.getItem("access_token"));
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`          
        },
        body: JSON.stringify(data),
      });

      if(response.ok) {
        const result = await response.json();
        console.log("new_postJSON_by_token Success:", result);
        return result;
      } else {
        // HTTP 응답 코드가 200 또는 201이 아닌 경우
        console.log(
          "new_postJSON_by_token Error: Unexpected response status",
          response.status
        );
        // 여기서 throw를 사용하여 원하는 방식으로 처리할 수 있습니다.
        throw new Error("Unexpected response status");
      }
  
      
    } catch (error) {
      console.log("new_postJSON_by_token Error:", error);
      throw error;
    }
  }

  export async function new_postJSON(url = "", data = {}) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
      });
  
      const result = await response.json();
      console.log("new_postJSON Success:", result);
      return result;
      
    } catch (error) {
      console.error("new_postJSON Error:", error);
    }
  }

  export async function new_getJSON_by_token(url = "") {
    console.log(`access_token : `, localStorage.getItem("access_token"));
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization":`Bearer ${localStorage.getItem("access_token")}`          
        }
      });
  
      const result = await response.json();
      console.log("new_getJSON_by_token:", result);
      return result;
      
    } catch (error) {
      console.error("new_getJSON_by_token Error:", error);
    }
  }

  export async function new_deleteJSON_by_token(url = "") {
    console.log(`access_token : `, localStorage.getItem("access_token"));
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization":`Bearer ${localStorage.getItem("access_token")}`          
        },
        
      });
  
      const result = await response;
      console.log("new_deleteJSON_by_token:", result);
      return result;
      
    } catch (error) {
      console.error("new_deleteJSON_by_token Error:", error);
    }
  }

  export async function new_deleteJSON_by_token_data(url = "", data = {}) {
    console.log(`access_token : `, localStorage.getItem("access_token"));
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization":`Bearer ${localStorage.getItem("access_token")}`          
        },
        body: JSON.stringify(data),
      });

      if(response.ok) {
        const result = await response;
        console.log("new_deleteJSON_by_token_data Success:", result);
        return result;
      } else {
        // HTTP 응답 코드가 200 또는 201이 아닌 경우
        console.log(
          "new_deleteJSON_by_token_data Error: Unexpected response status",
          response.status
        );
        // 여기서 throw를 사용하여 원하는 방식으로 처리할 수 있습니다.
        throw new Error("Unexpected response status");
      }
      
    } catch (error) {
      console.error("new_deleteJSON_by_token_data Error:", error);
      throw error;
    }
  }

  export async function isLogin_user() {
    
    try {
      const url = "http://221.148.25.234:6666/user/isAuth";
      const res = await new_postJSON_by_token(url, {});
      console.log(`로그인 되어있음`, res);
      return res;
    } catch (error) {
      console.log(`로그인 되어 있지 않음.`, error);
      throw error;        
    }
  }
