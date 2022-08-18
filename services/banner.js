const formidable = require('formidable');
const {
  addNewBanner,
  getBanners,
  deleteBanner,
  getBannerWithId,
  enableDisableBanner
} = require("../dynamodb/database/banner")

const CreateBanner = async (req, res) => {
  var form = await new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    try {

      const bannerDetails = JSON.parse(fields.data);
      console.log(bannerDetails);

      const savedRequest = await addNewBanner({
        banner: bannerDetails.banner,
        bannerStatus: "Active",
        isEnable: true
      });
      res.json(savedRequest);
    } catch (err) {
      res.json({ message: err });
    }
  })
};

const DeleteBanner = async (req, res) => {
  //Delete Specific User
  try {
    const banner = await deleteBanner(req.params.id);
    res.json(banner);
  } catch (err) {
    res.json({
      message: err,
    });
  }
};

const EnableDisableBanner = async (req, res) => {
  const previousBanner = await getBannerWithId(req.params.id);

  if (previousBanner) {
    const bannerStatus = (!previousBanner.isEnable) ? "Active" : "InActive";
    await enableDisableBanner(previousBanner.id, {
      bannerStatus: bannerStatus,
      isEnable: !previousBanner.isEnable
    });
  }

  const updatedBanner = await getBannerWithId(req.params.id);
  res.json(updatedBanner);
};

const GetBanners = async (req, res) => {
  try {
    const banner = await getBanners();
    res.json(banner.Items);
  } catch (err) {
    res.json({ message: err });
  }
};

module.exports = { CreateBanner, DeleteBanner, EnableDisableBanner, GetBanners };
