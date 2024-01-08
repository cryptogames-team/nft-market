import React from "react";
import { Outlet, useOutletContext } from "react-router-dom";

export default function ExplorerIndex() {
  const {
    isLogin,
    setIsLogin,
    ref_user_data,
    ref_trx_data,
    ref_wallet_start,
    ref_status,
    ref_result,
    ref_wallet_finish,
  } = useOutletContext();
  return (
    <>
      <Outlet
        context={{
          isLogin,
          setIsLogin,
          ref_user_data,
          ref_trx_data,
          ref_wallet_start,
          ref_status,
          ref_result,
          ref_wallet_finish,
        }}
      />
    </>
  );
}
