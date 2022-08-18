const Banner = require("../models/banner-model");

const addNewBanner = async (bannerDetails) => {
  const banner = new Banner(bannerDetails);
  return Promise.resolve(await banner.save());
};

const deleteBanner = async (id) => {
  Banner.remove({
    _id: id,
  });
};

const getBannerWithId = async (req, res, next) => {
  const banner = await Banner.findOne({
    _id: req,
  });
  return Promise.resolve(banner);
};

const enableDisableBanner = async (id, details) => {
  var key = {};
  if (details.status) {
    key.status = details.status;
  }
    key.enable = details.enable;

  await Banner.updateOne(
    { _id: id },
    {
      $set: key,
    }
  );
};

module.exports = {
  addNewBanner,
  deleteBanner,
  enableDisableBanner,
  getBannerWithId,
};
