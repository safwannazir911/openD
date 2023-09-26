import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Nat8 "mo:base/Nat8";

actor class NFT(name:Text,owner:Principal,content:[Nat8]) =this{
    private let nftName=name;
    private var nftOwner=owner;
    private let nftContent=content;
    private var nftListedForSale=false;

    public query func getName():async Text{
        return nftName;
    };
    public query func getOwner():async Principal{
        return nftOwner;
    };
    public query func getContent():async [Nat8]{
        return nftContent;
    };
    public query func getCanisterId():async Principal{
        return Principal.fromActor(this)
    };
    public shared(msg) func transferOwnership(newOwner:Principal,isListing:Bool):async Text{
        if(isListing){
            nftListedForSale:=true;
        }
        else{
            nftListedForSale:=false;
        };
        if(msg.caller==nftOwner){
            nftOwner:=newOwner;
            return "Success";
        }
        else{
            return "Error: Not initiated by the owner of the NFT.";
        }

    }
}