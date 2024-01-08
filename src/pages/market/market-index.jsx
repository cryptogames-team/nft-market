import React from 'react'
import { Outlet, useOutletContext } from 'react-router-dom';
  
export default function MarketIndex() {
  const {
    isLogin,
    setIsLogin,
    setIsNeedLoginModal,
    ref_user_data,
    ref_trx_data,
    ref_wallet_start,
    ref_status,
    ref_result,
    ref_wallet_finish,
  } = useOutletContext();
  console.log(`MarketIndex : `, useOutletContext());

  return (
    <>
      <Outlet context={
            {
              isLogin,
              setIsLogin,
              setIsNeedLoginModal,
              ref_user_data,
              ref_trx_data,
              ref_wallet_start,
              ref_status,
              ref_result,
              ref_wallet_finish
            }
          } 
          />
    </>
  );
  
}