const Category = require("../models/category-model");
const SubCategory = require("../models/sub-category-model");

const getCategoryById = async (req, res, next) => {
  const category = await Category.findOne({
    _id: req,
  });
  return Promise.resolve(category);
};

const editCategoryById = async (id, details) => {
  var key = {};

  if (details.categoryName) {
    key.categoryName = details.categoryName;
  }
  if (details.numberOfSubCat) {
    key.numberOfSubCat = details.numberOfSubCat;
  }
  key.isEnabled = details.isEnabled;

  const updatedCategory = await Category.updateOne(
    { _id: id },
    {
      $set: key,
    }
  );

  return Promise.resolve(updatedCategory);
};

const addSubCategory = async (id, name) => {
  const subCategory = new SubCategory({
    categoryId: id,
    subCategoryName: name,
  });
  return Promise.resolve(await subCategory.save());
};
module.exports = {
  getCategoryById,
  editCategoryById,
  addSubCategory,
};
