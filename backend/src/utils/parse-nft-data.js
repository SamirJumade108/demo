const parseNFTData = async (data) => {
  try {
    const result = data.reduce((acc, item) => {
      item.tokens.forEach((b) => {
        const owner = b.owner || item.owner;
        if (!owner) {
          return "owner not found";
        }
        if (!acc[owner]) {
          acc[owner] = { nfts: [], totalNFTBalanceUSD: 0 };
        }
        acc[owner].nfts.push({
          name: b.name,
          description: item.collection.description,
          imageurl: b.imageUrl,
          chain: item.name,
          floorPrice: item.floorPrice,
          nftPrice: item.marketPrice,
          address: item.collectionId,
          tokenId: b.tokenId ? b.tokenId : null, // some nfts don't have tokenId
          price: item.collection.price,
          chain:item.collection.chain
        });
        acc[owner].totalNFTBalanceUSD += item.marketPrice || 0;
      });
      return acc;
    }, {});

    return result;
  } catch (e) {
    return e;
  }
};
module.exports = { parseNFTData };  