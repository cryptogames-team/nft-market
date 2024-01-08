import { FaDiscord , FaTwitter, FaYoutube } from "react-icons/fa";
import { FaMedium } from "react-icons/fa6";

import ButtonPrimary from "./basic/btn-primary";
import React from 'react';
const mySvg = require('../asset/footer_social.svg').default;

export default function Footer() {
    return (
      <>
        <footer className="border-t-2 border-gray-700 text-white p-4 text-center w-full"></footer>
        <div className="container border-b-2 border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10 p-5">
            <Footer_email></Footer_email>
            <Footer_sns></Footer_sns>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 p-5 gap-5">
            <Footer_info />                       
            <Footer_menu/>
          </div>
        </div>

        <div className="mt-3 mb-10 text-slate-400 text-sm flex justify-between container">
            <div>© 2023 CryptoGames</div>
            <div className="flex">
                <div className="mr-4">Privacy Policy</div>
                <div>Terms of Service</div>
            </div>
        </div>
      </>
    );    
}

function Footer_email() {
  return (
    <div className="flex flex-col bg-footer-card rounded-lg p-8">
      <div className="text-xs mb-4">SUBSCRIBE TO OUR NEWSLETTER</div>
      <div className="font-bold text-xl lg:text-2xl mb-4">
        최신 소식을 받고 싶다면, 이메일을 입력해주세요.
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:mt-5">
        <div className="col-span-1 lg:col-span-9 flex flex-grow border border-slate-400 items-center p-3 rounded-2xl">
          <input
            className="ml-1 bg-inherit w-full focus:outline-none"
            placeholder="이메일 주소를 입력해주세요."
          ></input>
        </div>
        <div className="col-span-1 lg:col-span-3">
          <ButtonPrimary text={"구독하기"} css={"w-full"} />
        </div>
      </div>
    </div>
  );
}

function Footer_sns() {
    return (
        <div className="bg-footer-card rounded-lg p-8">
              <div className="text-xs mb-4">JOIN OUR COMMUNITY</div>              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3 mb-4">
                    <div className="font-bold text-xl lg:text-2xl">SNS 서비스를 통해 소통하세요!</div>
                    <div className="mt-7 grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="flex border rounded-xl p-2 items-center justify-center">
                            <FaTwitter size={22}/>
                            <div className="ml-2 text-xs font-bold">TWITTER</div>
                        </div>
                        
                        <div className="flex border rounded-xl p-2 items-center justify-center">
                            <FaDiscord size={22}/>
                            <div className="ml-2 text-xs font-bold">DISCORD</div>
                        </div>
                        
                    </div>
                </div>
                <img className="hidden lg:block lg:col-span-2" src={mySvg}></img>                
              </div>
            </div>
    );    
}

function Footer_info() {
  return (
    <div>
      <div className="font-bold text-xl mb-4">NFT 거래소</div>
      <div className="text-slate-400 mb-8">
        NFT 거래소는 Heptagon 기반의 nft를 구매하고 판매하고, 교환하고 생성할 수
        있는 플랫폼입니다.
      </div>
      <div className="grid grid-cols-4 lg:grid-cols-12 justify-items-center">
        <FaTwitter size={20} />
        <FaDiscord size={20} />
        <FaYoutube size={20} />
        <FaMedium size={20} />
      </div>
    </div>
  );
}

function Footer_menu() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3">
      <div>
        <div className="font-bold mb-4">DISCOVER</div>
        <div className="text-slate-400 mb-2">Advertise</div>
        <div className="text-slate-400 mb-2">Our Blog</div>
        <div className="text-slate-400 mb-2">Tools</div>
        <div className="text-slate-400 mb-2">SA Bridge</div>
      </div>
      <div>
        <div className="font-bold mb-4">DEVELOPERS</div>
        <div className="text-slate-400 mb-2">NFT Standard</div>
        <div className="text-slate-400 mb-2">Documentation</div>
        <div className="text-slate-400 mb-2">Dev Group</div>
        <div className="text-slate-400 mb-2">API</div>
      </div>
      <div>
        <div className="font-bold mb-4">CONTACT</div>
        <div className="text-slate-400 mb-2">FAQ</div>
        <div className="text-slate-400 mb-2">Feedback</div>
        <div className="text-slate-400 mb-2">Careers</div>
        <div className="text-slate-400 mb-2">Partnership</div>
      </div>
    </div>
  );
}