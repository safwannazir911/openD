import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import List "mo:base/List";
import Nat8 "mo:base/Nat8";
import Prelude "mo:base/Prelude";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
import Text "mo:base/Text";
import NFTActorClass "../nft/nft";

actor OpenD {
    Debug.print("hello from opend");

    private type Listing = {
        nftOwner : Principal;
        nftPrice : Nat;
    };

    //Maps NFT to the newly created NFTActorClass
    var mapOfNFTs = HashMap.HashMap<Principal, NFTActorClass.NFT>(1, Principal.equal, Principal.hash);

    //Maps Owners to the List of NFTs they hold
    var mapOfOwners = HashMap.HashMap<Principal, List.List<Principal>>(1, Principal.equal, Principal.hash);

    //Maps an NFT which is to be sold with the ListingRecord which contains the nft owner and his set price;
    var mapOfListings = HashMap.HashMap<Principal, Listing>(1, Principal.equal, Principal.hash);

    public shared (msg) func mint(imgData : [Nat8], name : Text) : async Principal {
        let owner : Principal = msg.caller;

        let newNFT = await NFTActorClass.NFT(name, owner, imgData);

        let newNFTPrincipal = await newNFT.getCanisterId();

        mapOfNFTs.put(newNFTPrincipal, newNFT);
        addToOwnershipMap(owner, newNFTPrincipal);

        return newNFTPrincipal;

    };
    private func addToOwnershipMap(owner : Principal, nftId : Principal) {
        var ownedNFTs : List.List<Principal> = switch (mapOfOwners.get(owner)) {
            case null List.nil<Principal>();
            case (?result) result;
        };
        ownedNFTs := List.push(nftId, ownedNFTs);
        mapOfOwners.put(owner, ownedNFTs);
    };

    public query func getOwnedNFTs(user : Principal) : async [Principal] {
        var userNFTs : List.List<Principal> = switch (mapOfOwners.get(user)) {
            case null List.nil<Principal>();
            case (?result) result;
        };
        return List.toArray(userNFTs);
    };
    public query func getListedNFTs() : async [Principal] {
        let ids = Iter.toArray(mapOfListings.keys());
        return ids;
    };
    public shared (msg) func listItem(NFT_Id : Principal, price : Nat) : async Text {
        var item : NFTActorClass.NFT = switch (mapOfNFTs.get(NFT_Id)) {
            case null return "NFT does not exist.";
            case (?result) result;
        };
        let owner = await item.getOwner();
        if (Principal.equal(owner, msg.caller)) {
            let ListingRecord : Listing = {
                nftOwner = owner;
                nftPrice = price;
            };
            mapOfListings.put(NFT_Id, ListingRecord);
            return "Success";
        } else {
            return "You don't own the NFT.";
        };
    };

    public query func getOpenDCanisterID() : async Principal {
        return Principal.fromActor(OpenD);
    };

    public query func isListed(id : Principal) : async Bool {
        if (mapOfListings.get(id) == null) {
            return false;
        } else {
            return true;
        };
    };

    public query func getOriginalOwner(id : Principal) : async Principal {
        var listing : Listing = switch (mapOfListings.get(id)) {
            case null return Principal.fromText("");
            case (?result) result;
        };
        return listing.nftOwner;
    };

    public query func getListedNFTPrice(id : Principal) : async Nat {
        var listing : Listing = switch (mapOfListings.get(id)) {
            case null return 0;
            case (?result) result;
        };

        return listing.nftPrice;

    };
    public shared (msg) func completePurchase(id : Principal, ownerId : Principal, newOwnerId : Principal) : async Text {
        var purchasedNFT : NFTActorClass.NFT = switch (mapOfNFTs.get(id)) {
            case null return "";
            case (?result) result;
        };
        let transferResult = await purchasedNFT.transferOwnership(newOwnerId,false);
        if (transferResult == "Success") {
            //delete it from listing hash map
            mapOfListings.delete(id);
            //assign delete it from sellers nft hash map
            var userNFTs : List.List<Principal> = switch (mapOfOwners.get(ownerId)) {
                case null List.nil<Principal>();
                case (?result) result;
            };
            userNFTs:=List.filter(userNFTs, func (litItemId:Principal):Bool{
                return litItemId !=id;
            });
            //add it to new buyers owned nfts hash map
            addToOwnershipMap(newOwnerId,id);
            return "Success";
        }
        else{
            return transferResult
        }

    };

};
