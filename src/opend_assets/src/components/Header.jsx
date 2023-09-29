import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { BrowserRouter, Link, Switch, Route } from "react-router-dom";
import homeImage from "../../assets/home-img.png";
import Minter from "./Minter";
import Gallery from "./Gallery";
import { opend } from "../../../declarations/opend"
import CURRENT_USER_ID from "../index";


function Header() {
  const [userOwnerGallery,setUserOwnedGallery]=useState([]);  //was [] before 
  const [listingGallery,setListingGallery]=useState([]);  //was [] before 
  const [isLoading, setIsLoading] = useState(true); // Add loading state


    async function getUserNFTs() {
      try {
        const NFTs = await opend.getOwnedNFTs(CURRENT_USER_ID);
        setUserOwnedGallery([...NFTs]);
        // setUserOwnedGallery(<Gallery title="My NFTs" ids={NFTs}/> );

        const listedNFTs=await opend.getListedNFTs();
        setListingGallery([...listedNFTs]);

      } catch (error) {
        console.error("Error fetching NFTs:", error);
      } finally {
        // Set loading to false regardless of success or failure
        setIsLoading(false);
      }
    }

  
  useEffect(() => {
    getUserNFTs()
    console.log(listingGallery)
  }, [])

  return (
    <BrowserRouter forceRefresh={true}>
      <div className="app-root-1">
        <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
          <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
            <div className="header-left-4"></div>
            <Link to="/">
              <img className="header-logo-11" src={logo} />
            </Link>
            <div className="header-vertical-9"></div>
            <Link to="/">
              <h5 className="Typography-root header-logo-text">OpenD</h5>
            </Link>
            <div className="header-empty-6"></div>
            <div className="header-space-8"></div>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/discover">
                Discover
              </Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/minter">
                Minter
              </Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/collection">
                My NFTs
              </Link>
            </button>
          </div>
        </header>
      </div>
      <Switch>
        <Route exact path="/">
          <img className="bottom-space" src={homeImage} />
        </Route>
        <Route path="/discover">
          <h1>Discover</h1>
          {isLoading ? (
             <div className="lds-ellipsis">
             <div></div>
             <div></div>
             <div></div>
             <div></div> 
           </div>
          ) : (
            <Gallery title="My NFTs" ids={listingGallery} role="discover" />
          )}
        </Route>
        <Route path="/minter">
          <Minter />
        </Route>
        <Route path="/collection">
        {isLoading ? (
             <div className="lds-ellipsis">
             <div></div>
             <div></div>
             <div></div>
             <div></div> 
           </div>
          ) : (
            <Gallery title="My NFTs" ids={userOwnerGallery} role="collection" />
          )}
          {/* {userOwnerGallery} */}
        </Route>
      </Switch>
    </BrowserRouter>

  );
}

export default Header;
