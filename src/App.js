import React, { Component } from "react";
import IndexSwap from "./abis/IndexSwap.json";
import IndexToken from "./abis/indexToken.json";
import NFTSwap from "./abis/NFTPortfolio.json";
import IERC from "./abis/IERC20.json";
import pancakeSwapRouter from "./abis/IPancakeRouter02.json";
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import { Grid, Button, Card, Form, Input, Image, Menu, Table } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import velvet from "./velvet.png";
import metamask from "./metamask-fox.svg";
import swal from 'sweetalert';

import "./App.css";

const axios = require('axios');

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      SwapContract: null,
      NFTTokenContract: null,
      DeFiTokenContract: null,
      NFTPortfolioContract: null,
      address: "",
      connected: false,
      mapDefi: [],
      mapNft: [],

      defiToMint: 0,
      nftToMint: 0,

      withdrawValueDefi: 0,
      withdrawValueNFT: 0,

      defiBalance: 0,
      nftBalance: 0,

      nftTokenBalance: 0,
      defiTokenBalance: 0,

      btcTokenBalance: 0,
      ethTokenBalance: 0,
      shibaTokenBalance: 0,
      xrpTokenBalance: 0,
      ltcTokenBalance: 0,
      daiTokenBalance: 0,
      makerTokenBalance: 0,
      linkTokenBalance: 0,
      uniTokenBalance: 0,
      aaveTokenBalance: 0,

      btcTokenBalanceBnb: 0,
      ethTokenBalanceBnb: 0,
      shibaTokenBalanceBnb: 0,
      xrpTokenBalanceBnb: 0,
      ltcTokenBalanceBnb: 0,
      daiTokenBalanceBnb: 0,
      makerTokenBalanceBnb: 0,
      linkTokenBalanceBnb: 0,
      uniTokenBalanceBnb: 0,
      aaveTokenBalanceBnb: 0,

      axsTokenBalance: 0,
      racaTokenBalance: 0,
      mboxTokenBalance: 0,
      mcTokenBalance: 0,
      aliceTokenBalance: 0,
      xtzTokenBalance: 0,
      galaTokenBalance: 0,
      chzTokenBalance: 0,
      enjTokenBalance: 0,
      roseTokenBalance: 0,

      axsTokenBalanceBnb: 0,
      racaTokenBalanceBnb: 0,
      mboxTokenBalanceBnb: 0,
      mcTokenBalanceBnb: 0,
      aliceTokenBalanceBnb: 0,
      xtzTokenBalanceBnb: 0,
      galaTokenBalanceBnb: 0,
      chzTokenBalanceBnb: 0,
      enjTokenBalanceBnb: 0,
      roseTokenBalanceBnb: 0,

      rate: 0
    }
  }

  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
    await this.calcTokenBalancesDeFi();
    await this.calcTokenBalancesNFT();
    await this.getRate();
    swal("This project is is beta stage");
  }

  // first up is to detect ethereum provider
  async loadWeb3() {
    const provider = await detectEthereumProvider();

    // modern browsers
    if (provider) {
      console.log('MetaMask is connected');

      window.web3 = new Web3(provider);
    } else {
      console.log('No ethereum wallet detected');
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await window.web3.eth.getAccounts();
    if(accounts[0]) {
      this.setState({ connected: true })
    }
    this.setState({ account: accounts[0]}) 
    const SwapContract = new web3.eth.Contract(IndexSwap.abi, "0x380d2b6742AAD7ae97f199a109c1F81A34E1cb86");
    const NFTPortfolioContract = new web3.eth.Contract(NFTSwap.abi, "0x40A367c5320440a1aa78aCBC5af0A017Ed1F3772"); 
    const NFTTokenContract = new web3.eth.Contract(IndexToken.abi, "0x16dBB234A9a595967DdC2ea1bb53379752f09Ad4"); 
    const DeFiTokenContract = new web3.eth.Contract(IndexToken.abi, "0x6E49456f284e3da7f1515eEE120E2706cab69fD5");
    this.setState({ SwapContract, DeFiTokenContract, NFTPortfolioContract, NFTTokenContract});
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    })
  }

  connectWallet = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      console.log("Connected");
      this.setState({
        connected: true
      })

    } else {
      alert("Metamask not found");
    }

    this.loadBlockchainData();
    window.location.reload()
  }

  investNFT = async () => {
    const web3 = new Web3(window.ethereum);
    const v = this.state.nftToMint;
    const valueInWei = web3.utils.toWei(v, 'ether');
    console.log(this.state.NFTPortfolioContract.methods);
    
    const resp = await this.state.NFTPortfolioContract.methods.investInFundNFT().send({ from: this.state.account, value: valueInWei
    }).once("receipt", (receipt) => {
      console.log(receipt);
    })
      .catch((err) => {
        console.log(err);
      });
    if (resp.status) {
      swal("Investment successfull!", `You invested ${v} BNB into the portfolio.`, "success");
    } else {
      swal("Investment failed!");
    }

    this.calcTokenBalancesNFT();
  }

  investDeFi = async () => {
    const web3 = new Web3(window.ethereum);    
    const v = this.state.defiToMint;
    const valueInWei = web3.utils.toWei(v, 'ether');
    
    const resp = await this.state.SwapContract.methods.investInFundDefi().send({ from: this.state.account, value: valueInWei })
    .once("receipt", (receipt) => {
      console.log(receipt);

    })
      .catch((err) => {
        console.log(err);
      });

      if (resp.status) {
        swal("Investment successfull!", `You invested ${v} BNB into the portfolio.`, "success");
        //window.location.reload();
      } else {
        swal("Investment failed!");
      }

    this.calcTokenBalancesDeFi();

  }

  approveNFTTokens = async() => {
    const web3 = new Web3(window.ethereum);
    
    const contractAddress = "0x40A367c5320440a1aa78aCBC5af0A017Ed1F3772"; 

    const aXSTokenConntract = new web3.eth.Contract(IERC.abi, "0x715D400F88C167884bbCc41C5FeA407ed4D2f8A0");
    await aXSTokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });

    const rACATokenConntract = new web3.eth.Contract(IERC.abi, "0x12BB890508c125661E03b09EC06E404bc9289040");
    await rACATokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });

    const mBOXTokenConntract = new web3.eth.Contract(IERC.abi, "0x3203c9E46cA618C8C1cE5dC67e7e9D75f5da2377");
    await mBOXTokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });

    const mCTokenConntract = new web3.eth.Contract(IERC.abi, "0x949D48EcA67b17269629c7194F4b727d4Ef9E5d6");
    await mCTokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });

    const aLICETokenConntract = new web3.eth.Contract(IERC.abi, "0xAC51066d7bEC65Dc4589368da368b212745d63E8");
    await aLICETokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });
  }

  approveDeFiTokens = async() => {
    const web3 = new Web3(window.ethereum);
    
    const contractAddress = "0x380d2b6742AAD7ae97f199a109c1F81A34E1cb86"; 

    const BTCTokenConntract = new web3.eth.Contract(IERC.abi, "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c");
    BTCTokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });

    const ETHTokenConntract = new web3.eth.Contract(IERC.abi, "0x2170Ed0880ac9A755fd29B2688956BD959F933F8"); 
    ETHTokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });

    const SHIBATokenConntract = new web3.eth.Contract(IERC.abi, "0x2859e4544C4bB03966803b044A93563Bd2D0DD4D");
    SHIBATokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });

    const XRPTokenConntract = new web3.eth.Contract(IERC.abi, "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE");
    XRPTokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });

    const LTCTokenConntract = new web3.eth.Contract(IERC.abi, "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94");
    LTCTokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });

    const DAITokenConntract = new web3.eth.Contract(IERC.abi, "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3");
    DAITokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });

    const MAKERTokenConntract = new web3.eth.Contract(IERC.abi, "0x5f0Da599BB2ccCfcf6Fdfd7D81743B6020864350");
    MAKERTokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });

    const LINKTokenConntract = new web3.eth.Contract(IERC.abi, "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD");
    LINKTokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });

    const UNITokenConntract = new web3.eth.Contract(IERC.abi, "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1");
    UNITokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });

    const AAVETokenConntract = new web3.eth.Contract(IERC.abi, "0xfb6115445Bff7b52FeB98650C87f44907E58f802");
    AAVETokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });
  }

  withdrawDeFi = async () => {
    const vault = "0x6056773C28c258425Cf9BC8Ba5f86B8031863164";

    const web3 = new Web3(window.ethereum);

    var withdrawAmt = this.state.withdrawValueDefi;
    var withdrawAmountInWei = web3.utils.toWei(withdrawAmt, 'ether');

    await this.state.DeFiTokenContract.methods.approve("0x380d2b6742AAD7ae97f199a109c1F81A34E1cb86", "7787357773333787487837458347754874574837458374")
    .send({from: this.state.account});


    var amount = withdrawAmountInWei / 10;
    var sAmount = amount.toString();

    await this.state.SwapContract.methods.withdrawFromFundTOPTokens(sAmount
    ).send({
      from: this.state.account, value: 0
    }).once("receipt", (receipt) => {
      swal("Withdrawal successfull!", "The withdrawal was successful!", "success");
      console.log(receipt);
    })
      .catch((err) => {
        console.log(err);
      });

      this.calcTokenBalancesDeFi();
  }

  withdrawNFT = async () => {
      const vault = "0x6056773C28c258425Cf9BC8Ba5f86B8031863164";
  
      const web3 = new Web3(window.ethereum);
  
      console.log(this.state.DeFiTokenContract);
  
      var withdrawAmt = this.state.withdrawValueNFT;
      var withdrawAmountInWei = web3.utils.toWei(withdrawAmt, 'ether');
  
  
      await this.state.NFTTokenContract.methods.approve("0x40A367c5320440a1aa78aCBC5af0A017Ed1F3772", "7787357773333787487837458347754874574837458374")
      .send({from: this.state.account});
  
      var amount = withdrawAmountInWei / 10;
      var sAmount = amount.toString();
  
      await this.state.NFTPortfolioContract.methods.withdrawFromFundNFT(sAmount
      ).send({
        from: this.state.account, value: 0
      }).once("receipt", (receipt) => {
        swal("Withdrawal successfull!", "The withdrawal was successful!", "success");
        console.log(receipt);
      })
        .catch((err) => {
          console.log(err);
        });

        this.calcTokenBalancesNFT();
  }

  getExchangeRate = async (amountIn, address) => {
    const web3 = window.web3;
    const pancakeRouter = new web3.eth.Contract(pancakeSwapRouter.abi, "0x10ED43C718714eb63d5aA57B78B54704E256024E");

    var path = [];
    path[0] = address;
    path[1] = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";

    const er = await pancakeRouter.methods.getAmountsOut(amountIn, path).call();
    return er[1];
  }

  calcTokenBalancesDeFi = async () => {
    const web3 = window.web3;

    const defiTokenBalanceRes = await this.state.DeFiTokenContract.methods.balanceOf(this.state.account).call();
    const defiTokenBalance = web3.utils.fromWei(defiTokenBalanceRes, "ether");

    // DeFi
    const BTCTokenConntract = new web3.eth.Contract(IERC.abi, "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c");
    const btcTokenBalanceRes = await this.state.SwapContract.methods.btcBalance(this.state.account).call();
    //const btcTokenBalanceRes = await BTCTokenConntract.methods.balanceOf("0x6056773C28c258425Cf9BC8Ba5f86B8031863164").call();
    const helperBtc = await this.getExchangeRate(btcTokenBalanceRes, "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c");
    const btcTokenBalanceBnb = web3.utils.fromWei(helperBtc, "ether");
    const btcTokenBalance = web3.utils.fromWei(btcTokenBalanceRes, "ether");

    const ETHTokenConntract = new web3.eth.Contract(IERC.abi, "0x2170Ed0880ac9A755fd29B2688956BD959F933F8");
    const ethTokenBalanceRes = await this.state.SwapContract.methods.ethBalance(this.state.account).call();
    //const ethTokenBalanceRes = await ETHTokenConntract.methods.balanceOf("0x6056773C28c258425Cf9BC8Ba5f86B8031863164").call();
    const helperEth = await this.getExchangeRate(ethTokenBalanceRes, "0x2170Ed0880ac9A755fd29B2688956BD959F933F8");
    const ethTokenBalanceBnb = web3.utils.fromWei(helperEth, "ether");
    const ethTokenBalance = web3.utils.fromWei(ethTokenBalanceRes, "ether");

    const SHIBATokenConntract = new web3.eth.Contract(IERC.abi, "0x2859e4544C4bB03966803b044A93563Bd2D0DD4D");
    const shibaTokenBalanceRes = await this.state.SwapContract.methods.shibaBalance(this.state.account).call();
    //const shibaTokenBalanceRes = await SHIBATokenConntract.methods.balanceOf("0x6056773C28c258425Cf9BC8Ba5f86B8031863164").call();
    const helperShib = await this.getExchangeRate(shibaTokenBalanceRes, "0x2859e4544C4bB03966803b044A93563Bd2D0DD4D");
    const shibaTokenBalanceBnb = web3.utils.fromWei(helperShib, "ether");
    const shibaTokenBalance = web3.utils.fromWei(shibaTokenBalanceRes, "ether");

    const XRPTokenConntract = new web3.eth.Contract(IERC.abi, "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE");
    const xrpTokenBalanceRes = await this.state.SwapContract.methods.xrpBalance(this.state.account).call();
    //const xrpTokenBalanceRes = await XRPTokenConntract.methods.balanceOf("0x6056773C28c258425Cf9BC8Ba5f86B8031863164").call();
    const helperXrp = await this.getExchangeRate(xrpTokenBalanceRes, "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE");
    const xrpTokenBalanceBnb = web3.utils.fromWei(helperXrp, "ether");
    const xrpTokenBalance = web3.utils.fromWei(xrpTokenBalanceRes, "ether");

    const LTCTokenConntract = new web3.eth.Contract(IERC.abi, "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94");
    const ltcTokenBalanceRes = await this.state.SwapContract.methods.ltcBalance(this.state.account).call();
    //const ltcTokenBalanceRes = await LTCTokenConntract.methods.balanceOf("0x6056773C28c258425Cf9BC8Ba5f86B8031863164").call();
    const helperLtc = await this.getExchangeRate(ltcTokenBalanceRes, "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94");
    const ltcTokenBalanceBnb = web3.utils.fromWei(helperLtc, "ether");
    const ltcTokenBalance = web3.utils.fromWei(ltcTokenBalanceRes, "ether");

    const DAITokenConntract = new web3.eth.Contract(IERC.abi, "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3");
    const daiTokenBalanceRes = await this.state.SwapContract.methods.daiBalance(this.state.account).call();
    //const daiTokenBalanceRes = await DAITokenConntract.methods.balanceOf("0x6056773C28c258425Cf9BC8Ba5f86B8031863164").call();
    const helperDai = await this.getExchangeRate(daiTokenBalanceRes, "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3");
    const daiTokenBalanceBnb = web3.utils.fromWei(helperDai, "ether");
    const daiTokenBalance = web3.utils.fromWei(daiTokenBalanceRes, "ether");

    const MAKERTokenConntract = new web3.eth.Contract(IERC.abi, "0x5f0Da599BB2ccCfcf6Fdfd7D81743B6020864350");
    const makerTokenBalanceRes = await this.state.SwapContract.methods.makerBalance(this.state.account).call();
    //const makerTokenBalanceRes = await MAKERTokenConntract.methods.balanceOf("0x6056773C28c258425Cf9BC8Ba5f86B8031863164").call();
    const helperMaker = await this.getExchangeRate(makerTokenBalanceRes, "0x5f0Da599BB2ccCfcf6Fdfd7D81743B6020864350");
    const makerTokenBalanceBnb = web3.utils.fromWei(helperMaker, "ether");
    const makerTokenBalance = web3.utils.fromWei(makerTokenBalanceRes, "ether");

    const LINKTokenConntract = new web3.eth.Contract(IERC.abi, "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD");
    const linkTokenBalanceRes = await this.state.SwapContract.methods.linkBalance(this.state.account).call();
    //const linkTokenBalanceRes = await LINKTokenConntract.methods.balanceOf("0x6056773C28c258425Cf9BC8Ba5f86B8031863164").call();
    const helperLink = await this.getExchangeRate(linkTokenBalanceRes, "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD");
    const linkTokenBalanceBnb = web3.utils.fromWei(helperLink, "ether");
    const linkTokenBalance = web3.utils.fromWei(linkTokenBalanceRes, "ether");

    const UNITokenConntract = new web3.eth.Contract(IERC.abi, "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1");
    const uniTokenBalanceRes = await this.state.SwapContract.methods.uniBalance(this.state.account).call();
    //const uniTokenBalanceRes = await UNITokenConntract.methods.balanceOf("0x6056773C28c258425Cf9BC8Ba5f86B8031863164").call();
    const helperUni = await this.getExchangeRate(uniTokenBalanceRes, "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1");
    const uniTokenBalanceBnb = web3.utils.fromWei(helperUni, "ether");
    const uniTokenBalance = web3.utils.fromWei(uniTokenBalanceRes, "ether");


    const AAVETokenConntract = new web3.eth.Contract(IERC.abi, "0xfb6115445Bff7b52FeB98650C87f44907E58f802");
    const aaveTokenBalanceRes = await this.state.SwapContract.methods.aaveBalance(this.state.account).call();
    //const aaveTokenBalanceRes = await AAVETokenConntract.methods.balanceOf("0x6056773C28c258425Cf9BC8Ba5f86B8031863164").call();
    const helperAave = await this.getExchangeRate(aaveTokenBalanceRes, "0xfb6115445Bff7b52FeB98650C87f44907E58f802");
    const aaveTokenBalanceBnb = web3.utils.fromWei(helperAave, "ether");
    const aaveTokenBalance = web3.utils.fromWei(aaveTokenBalanceRes, "ether");

    this.setState({
      defiTokenBalance,
      btcTokenBalance, ethTokenBalance, shibaTokenBalance, xrpTokenBalance, ltcTokenBalance,
      btcTokenBalanceBnb, ethTokenBalanceBnb, shibaTokenBalanceBnb, xrpTokenBalanceBnb, ltcTokenBalanceBnb,
      daiTokenBalance, makerTokenBalance, linkTokenBalance, uniTokenBalance, aaveTokenBalance,
      daiTokenBalanceBnb, makerTokenBalanceBnb, linkTokenBalanceBnb, uniTokenBalanceBnb, aaveTokenBalanceBnb,
    });
  }

    calcTokenBalancesNFT = async () => {
    // NFT

    const web3 = window.web3;

    const nftTokenBalanceRes = await this.state.NFTTokenContract.methods.balanceOf(this.state.account).call();
    const nftTokenBalance = web3.utils.fromWei(nftTokenBalanceRes, "ether");

    const AXSTokenConntract = new web3.eth.Contract(IERC.abi, "0x715D400F88C167884bbCc41C5FeA407ed4D2f8A0");
    const axsTokenBalanceRes = await this.state.NFTPortfolioContract.methods.axsBalance(this.state.account).call();
    //const axsTokenBalanceRes = await AXSTokenConntract.methods.balanceOf("0x6056773C28c258425Cf9BC8Ba5f86B8031863164").call();
    const helperAxs = await this.getExchangeRate(axsTokenBalanceRes, "0x715D400F88C167884bbCc41C5FeA407ed4D2f8A0");
    const axsTokenBalanceBnb = web3.utils.fromWei(helperAxs, "ether");
    const axsTokenBalance = web3.utils.fromWei(axsTokenBalanceRes, "ether");

    const RACATokenConntract = new web3.eth.Contract(IERC.abi, "0x12BB890508c125661E03b09EC06E404bc9289040");
    const racaTokenBalanceRes = await this.state.NFTPortfolioContract.methods.racaBalance(this.state.account).call();
    //const racaTokenBalanceRes = await RACATokenConntract.methods.balanceOf("0x6056773C28c258425Cf9BC8Ba5f86B8031863164").call();
    const helperRaca = await this.getExchangeRate(racaTokenBalanceRes, "0x12BB890508c125661E03b09EC06E404bc9289040");
    const racaTokenBalanceBnb = web3.utils.fromWei(helperRaca, "ether");
    const racaTokenBalance = web3.utils.fromWei(racaTokenBalanceRes, "ether");

    const MBOXTokenConntract = new web3.eth.Contract(IERC.abi, "0x3203c9E46cA618C8C1cE5dC67e7e9D75f5da2377");
    const mboxTokenBalanceRes = await this.state.NFTPortfolioContract.methods.mboxBalance(this.state.account).call();
    //const mboxTokenBalanceRes = await MBOXTokenConntract.methods.balanceOf("0x6056773C28c258425Cf9BC8Ba5f86B8031863164").call();
    const helperMbox = await this.getExchangeRate(mboxTokenBalanceRes, "0x3203c9E46cA618C8C1cE5dC67e7e9D75f5da2377");
    const mboxTokenBalanceBnb = web3.utils.fromWei(helperMbox, "ether");
    const mboxTokenBalance = web3.utils.fromWei(mboxTokenBalanceRes, "ether");

    const MCTokenConntract = new web3.eth.Contract(IERC.abi, "0x949D48EcA67b17269629c7194F4b727d4Ef9E5d6");
    const mcTokenBalanceRes = await this.state.NFTPortfolioContract.methods.mcBalance(this.state.account).call();
    //const mcTokenBalanceRes = await MCTokenConntract.methods.balanceOf("0x6056773C28c258425Cf9BC8Ba5f86B8031863164").call();
    const helperMc = await this.getExchangeRate(mcTokenBalanceRes, "0x949D48EcA67b17269629c7194F4b727d4Ef9E5d6");
    const mcTokenBalanceBnb = web3.utils.fromWei(helperMc, "ether");
    const mcTokenBalance = web3.utils.fromWei(mcTokenBalanceRes, "ether");

    const ALICETokenConntract = new web3.eth.Contract(IERC.abi, "0xAC51066d7bEC65Dc4589368da368b212745d63E8");
    const aliceTokenBalanceRes = await this.state.NFTPortfolioContract.methods.aliceBalance(this.state.account).call();
    //const aliceTokenBalanceRes = await ALICETokenConntract.methods.balanceOf("0x6056773C28c258425Cf9BC8Ba5f86B8031863164").call();
    const helperAlice = await this.getExchangeRate(aliceTokenBalanceRes, "0xAC51066d7bEC65Dc4589368da368b212745d63E8");
    const aliceTokenBalanceBnb = web3.utils.fromWei(helperAlice, "ether");
    const aliceTokenBalance = web3.utils.fromWei(aliceTokenBalanceRes, "ether");
   

    this.setState({
      nftTokenBalance,
      axsTokenBalance, racaTokenBalance, mboxTokenBalance, mcTokenBalance, aliceTokenBalance,
      axsTokenBalanceBnb, racaTokenBalanceBnb, mboxTokenBalanceBnb, mcTokenBalanceBnb, aliceTokenBalanceBnb,
    });
  }

  getRate = async () => {
    const rateObj = await this.state.SwapContract.methods.currentRate().call();
    const rate = rateObj.numerator / rateObj.denominator;
    this.setState({ rate });
  }

  render() {
    let button;
    if (!this.state.connected) {
      button = <Button style={{ position: "absolute", top: "30px", right: "20px" }} onClick={this.connectWallet} color="orange">
          <Image style={{ "padding-top": "7px" }} floated="left" size="mini" src={metamask} />
          <p>Connect to MetaMask</p>
        </Button>
    } else {
      button = <p style={{ position: "absolute", top: "90px", right: "20px", color: "#C0C0C0" }}><b>Account:</b> {this.state.account}</p>
    }

    return (
      <div className="App">
        <br></br>

        <Image src={velvet} size="medium" verticalAlign='middle'></Image>

        {button}

        <Grid divided='vertically'>
          <Grid.Row columns={2} style={{ margin: "20px" }}>
            <Grid.Column>

              <Card.Group>
                <Card style={{ width: "900px" }}>
                  <Card.Content style={{ background: "#406ccd" }}>
                    <Card.Header style={{ color: "white" }}>
                    <p style={{ color: "#C0C0C0", "font-weight": "bold", "text-align": "right" }}>APY: XX%</p>
                      Top 10 Tokens
                      </Card.Header>
                    <Card.Description>
                      <p style={{ color: "#C0C0C0" }}>Rate: In return of investing 1 BNB you will receive 1 Top10 Token.</p>

                      <Form onSubmit={this.investDeFi}>
                        <Input style={{ width: "300px", padding: 3 }} required type="text" placeholder="BNB amount to create" name="defiToMint" onChange={this.handleInputChange}></Input>
                        <Button color="green" type="submit" style={{ margin: "20px", width: "150px" }}>Create</Button>
                      </Form>

                      <Form onSubmit={this.withdrawDeFi}>
                        <Input style={{ width: "300px", padding: 3 }} required type="text" placeholder="TOP15 amount to redeem" name="withdrawValueDefi" onChange={this.handleInputChange}></Input>
                        <Button color="green" style={{ margin: "20px", width: "150px" }}>Redeem</Button>
                      </Form>

                      <Table role="grid" style={{ "margin-left": "auto", "margin-right": "auto" }} basic='very' celled collapsing>
                        <Table.Header>
                          <Table.Row>
                            <Table.HeaderCell style={{ color: "white" }}>Token</Table.HeaderCell>
                            <Table.HeaderCell style={{ color: "white" }}>Balance</Table.HeaderCell>
                            <Table.HeaderCell style={{ color: "white" }}>Balance in BUSD</Table.HeaderCell>
                          </Table.Row>
                        </Table.Header>

                        <Table.Body>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Top10 Token</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.defiTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.defiTokenBalance}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Bitcoin (BTC)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.btcTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.btcTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Ethereum (ETH)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.ethTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.ethTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Shiba Ibu (SHIB)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.shibaTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.shibaTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Ripple (XRP)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.xrpTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.xrpTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Litecoin (LTC)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.ltcTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.ltcTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Dai (DAI)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.daiTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.daiTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Maker (MKR)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.makerTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.makerTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Chainlink (LINK)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.linkTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.linkTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Uniswap (UNI)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.uniTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.uniTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Aave (AAVE)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.aaveTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.aaveTokenBalanceBnb}</Table.Cell>
                          </Table.Row>

                        
                        </Table.Body>
                      </Table>

                    </Card.Description>
                  </Card.Content>
                </Card>
              </Card.Group>
            </Grid.Column>

            <Grid.Column>
              <Card.Group>
                <Card style={{ width: "900px" }}>
                  <Card.Content style={{ background: "#406ccd" }}>
                    <Card.Header style={{ color: "white" }}>
                      <p style={{ color: "#C0C0C0", "font-weight": "bold", "text-align": "right" }}>APY: YY%</p>
                      Top 5 Metaverse Tokens
                      </Card.Header>
                    <Card.Description>
                      <p style={{ color: "#C0C0C0" }}>Rate: In return of investing 1 BNB you will receive 1 META Token.</p>

                      <Form onSubmit={this.investNFT}>
                        <Input style={{ width: "300px", padding: 3 }} required type="text" placeholder="BNB amount to create" name="nftToMint" onChange={this.handleInputChange}></Input>
                        <Button color="green" type="submit" style={{ margin: "20px", width: "150px" }}>Create</Button>
                      </Form>

                      <Form onSubmit={this.withdrawNFT}>
                        <Input style={{ width: "300px", padding: 3 }} required type="text" placeholder="META amount to redeem" name="withdrawValueNFT" onChange={this.handleInputChange}></Input>
                        <Button color="green" style={{ margin: "20px", width: "150px" }}>Redeem</Button>
                      </Form>

                      <Table style={{ "margin-left": "auto", "margin-right": "auto" }} basic='very' celled collapsing>
                        <Table.Header>
                          <Table.Row>
                            <Table.HeaderCell style={{ color: "white" }}>Token</Table.HeaderCell>
                            <Table.HeaderCell style={{ color: "white" }}>Balance</Table.HeaderCell>
                            <Table.HeaderCell style={{ color: "white" }}>Balance in BUSD</Table.HeaderCell>
                          </Table.Row>
                        </Table.Header>

                        <Table.Body >
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Metaverse Token</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.nftTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.nftTokenBalance}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Axie Infinity (AXS)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.axsTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.axsTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Radio Caca (RACA)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.racaTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.racaTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>MOBOX (MBOX)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.mboxTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.mboxTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Merit Circle (MC)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.mcTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.mcTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>MyNeighborAlice (ALICE)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.aliceTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.aliceTokenBalanceBnb}</Table.Cell>
                          </Table.Row>

                        </Table.Body>
                      </Table>

                    </Card.Description>
                  </Card.Content>
                </Card>
              </Card.Group>

            </Grid.Column>
           
      
          </Grid.Row>
        </Grid>
      </div >
    );
  }
}

export default App;
