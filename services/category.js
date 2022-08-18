const {
  addNewCategory,
  getCategoryWithId,
  getCategoriesByName,
  editCategoryById,
  getCategories,
  deleteCategory
} = require("../dynamodb/database/category")

const { addNewSubCategory, getSubCategories, editSubCategoryById } = require("../dynamodb/database/subCategory")

const EnableDisableCategory = async (req, res) => {
  const previousCategory = await getCategoryWithId(req.params.id);

  if (!previousCategory) {
    return res.json({ message: "Excercise Not Found" });
  }
  await editCategoryById(previousCategory, {
    isEnabled: !previousCategory.isEnabled,
  });

  const updatedCategory = await getCategoryWithId(req.params.id);
  res.json(updatedCategory);
};

const UpdateCategory = async (req, res) => {
  const previousCategory = await getCategoryWithId(req.params.id);
  console.log(previousCategory);
  var categoryGrades = [];

  if (!previousCategory) {
    return res.json({ message: "Excercise Not Found" });
  }

  let subCat = req.body.subCategory;

  const subCategory = await getSubCategories();
  const subCategoryByCategoryId = subCategory.Items.filter(subCategory => subCategory.categoryId === req.params.id);
  console.log(subCategoryByCategoryId);
  console.log(subCat);
  console.log(subCategoryByCategoryId.length);

  for (let i = 0; i < subCat.length; i++) {
    categoryGrades = GetCategoryGrades(categoryGrades, subCat[i].subCategoryGrades);
    if (i < subCategoryByCategoryId.length) {
      await editSubCategoryById(subCategoryByCategoryId[i], {
        subCategoryName: subCat[i].subCategoryName,
        subCategoryGrades: subCat[i].subCategoryGrades,
        isEnabled: subCategoryByCategoryId[i].isEnabled,
      })
    }
    else {
      await addNewSubCategory({
        categoryId: previousCategory.id,
        subCategoryName: subCat[i].subCategoryName,
        subCategoryGrades: subCat[i].subCategoryGrades,
        isEnabled: true
      });
    }
  }

  console.log(categoryGrades);

  await editCategoryById(previousCategory, {
    categoryName: req.body.exerciseName,
    categoryGrades: categoryGrades,
    numberOfSubCat: subCat.length,
    isEnabled: previousCategory.isEnabled,
  });

  const updatedCategory = await getCategoryWithId(req.params.id);
  console.log(updatedCategory);

  res.json(updatedCategory);
};

const AddNewCategory = async (req, res) => {
  let subCat = req.body.subCategory;
  var categoryGrades = [];

  const categoryId = await addNewCategory({
    categoryName: req.body.exerciseName,
    categoryGrades: categoryGrades || [],
    numberOfSubCat: subCat.length,
    isEnabled: true
  });

  try {
    for (let i = 0; i < subCat.length; i++) {
      console.log(subCat);
      categoryGrades = GetCategoryGrades(categoryGrades, subCat[i].subCategoryGrades);
      console.log(categoryGrades);
      await addNewSubCategory({
        categoryId: categoryId,
        subCategoryName: subCat[i].subCategoryName,
        subCategoryGrades: subCat[i].subCategoryGrades,
        isEnabled: true
      });
    }

    const savedCategory = await getCategoryWithId(categoryId);
    console.log(savedCategory)

    await editCategoryById(savedCategory, {
      categoryGrades,
      isEnabled: true
    });

    const updatedCategory = await getCategoryWithId(req.params.id);
    console.log(updatedCategory);
    res.json(savedCategory);
  } catch (err) {
    res.json({ message: err });
  }
}

const GetCategories = async (req, res) => {
  try {
    const category = await getCategories();
    res.json(category.Items);
  } catch (err) {
    res.json({ message: err });
  }
}

const GetCategoriesByGrade = async (req, res) => {
  const grade = req.params.grade;
  try {
    const category = await getCategories();
    const categoryByGrade = [];
    category.Items.forEach(category => {
      const findCategoryByGrade = category.categoryGrades.find(element => element === grade);
      if (findCategoryByGrade) {
        categoryByGrade.push(category)
      }
    });
    res.json(categoryByGrade);
  } catch (err) {
    res.json({ message: err });
  }
}

const DeleteCategory = async (req, res) => {
  try {
    const deleteCat = await deleteCategory(req.params.id)
    res.json(deleteCat);
  } catch (err) {
    res.json({ message: err });
  }
}

const GetCategoryWithName = async (req, res) => {
  try {
    const categoryByName = await getCategoriesByName(req.params.name);
    res.json(categoryByName);
  } catch (err) {
    res.json({ message: err });
  }
}

const GetCategoryWithId = async (req, res) => {
  try {
    const category = await getCategoryWithId(req.params.id);
    res.json(category);
  } catch (err) {
    res.json({ message: err });
  }

}

const GetCategoryGrades = (categoryGrades, subCategoryGrades) => {

  const updatedCategoryGrades = categoryGrades.concat(subCategoryGrades);

  return updatedCategoryGrades

}
module.exports = { EnableDisableCategory, UpdateCategory, AddNewCategory, GetCategories, GetCategoriesByGrade, DeleteCategory, GetCategoryWithName, GetCategoryWithId };
