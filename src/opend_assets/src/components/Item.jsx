import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent"
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenIdlFactory} from "../../../declarations/token";
import { Principal } from "@dfinity/principal"
import { opend } from "../../../declarations/opend";
import Button from "./Button";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";

function Item(props) {
  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true)
  const [sellStatus, setSellStatus] = useState("")
  const [blur, setBlur] = useState()
  const [priceLable, setPriceLable] = useState()
  const [shouldDisplay, setDisplay] = useState(true);



  const id = props.id;
  const locahost = "http://localhost:8080/"
  const agent = new HttpAgent({
    host: locahost
  })
  agent.fetchRootKey();  //verifies agent on local network
  let NFTActor;

  async function loadNFT() {
    NFTActor = await Actor.createActor(idlFactory,
      {
        agent,
        canisterId: id,
      })
    const name = await NFTActor.getName();
    setName(name);
    const owner = await NFTActor.getOwner();
    setOwner(owner.toText());
    const imageData = await NFTActor.getContent();
    const imageContent = new Uint8Array(imageData);
    const image = URL.createObjectURL(new Blob([imageContent.buffer], { type: "image/png" }))
    setImage(image);
    if(props.role=="collection"){
      const nftIsListed = await opend.isListed(id)
      if (nftIsListed) {
        setButton();
        setPriceInput();
        setOwner("OpenD")
        setBlur({ filter: "blur(4px)" })
        setSellStatus("Listed")
      }
      else{
        setButton(<Button handleClick={handleSell} text="Sell" />)
      }
    }
    else{
      const originalOwner=await opend.getOriginalOwner(props.id);
      if(originalOwner!=CURRENT_USER_ID.toText()){
        setButton(<Button handleClick={handleBuy} text="Buy" />)
      }
      const price =await opend.getListedNFTPrice(props.id);
      setPriceLable(<PriceLabel sellPrice={price.toString()} />)
       
    }
  
  }

  useEffect(() => {
    loadNFT();
  }, [])
  let price;
   function handleSell() {
    console.log("hello")
    setPriceInput(<input
      placeholder="Price in DANG"
      type="number"
      className="price-input"
      value={price}
      onChange={(e) => price = e.target.value}
    />)
    setButton(<Button handleClick={sellItem} text="Confirm" />)
  }


  async function sellItem() {
    setBlur({ filter: "blur(4px)" })
    setLoaderHidden(false);
    const result = await opend.listItem(id, Number(price))
    console.log(result)
    if (result == "Success") {
      const openDId = await opend.getOpenDCanisterID()
      const trasferResult = await NFTActor.transferOwnership(openDId, true)
      console.log(trasferResult)
      if (trasferResult == "Success") {
        setLoaderHidden(true);
        setButton();
        setPriceInput();
        setOwner("OpenD")
        setSellStatus("Listed")
      }
    }

  }

  async function handleBuy(){
    console.log("buy was trigered ")
    setLoaderHidden(false);
    const TokenActor = await Actor.createActor(tokenIdlFactory,
      {
        agent,
        canisterId: Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai"),
      })
    const sellerId=await opend.getOriginalOwner(props.id);
    const itemprice =await opend.getListedNFTPrice(props.id);


    const result=await TokenActor.transfer(sellerId,itemprice);
    console.log(result)
    if (result == "Success") {
      const transferResult = await opend.completePurchase(
        props.id,
        sellerId,
        CURRENT_USER_ID
      );
      console.log("purchase: " + transferResult);
      setLoaderHidden(true);
      setDisplay(false);
    }


  }


  return (
    <div
    style={{ display: shouldDisplay ? "inline" : "none" }}
    className="disGrid-item"
  >
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
        <div hidden={loaderHidden} className="lds-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
          {priceLable}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}
            <span className="purple-text" style={{display:"block"}}>{sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
    </div>
  );
}

export default Item;
