const {
    addNewSubCategory,
    getSubCategoryWithId,
    getSubCategories,
    getSubCategoriesByCategoryId,
    deleteSubCategory,
    editSubCategoryById
} = require("../dynamodb/database/subCategory")
const {
    getCategoryWithId,
    editCategoryById
} = require("../dynamodb/database/category")

const AddNewSubCategory = async (req, res) => {
    const subCategoryId = await addNewSubCategory({
        categoryId: req.body.category_id,
        subCategoryGrades: req.body.subCategoryGrades || [],
        subCategoryName: req.body.subCategoryName,
        isEnabled: true
    });

    const savedSubCategory = await getSubCategoryWithId(subCategoryId);

    const previousCategory = await getCategoryWithId(req.body.category_id);

    if (!previousCategory) {
        return res.json({ message: "Excercise Not Found" });
    }
    await editCategoryById(previousCategory, {
        isEnabled: previousCategory.isEnabled,
        numberOfSubCat: previousCategory.numberOfSubCat + 1,
    });
    try {
        res.json(savedSubCategory);
    } catch (err) {
        res.json({ message: err });
    }
}

const GetSubCategories = async (req, res) => {
    try {
        const category = await getSubCategories();
        res.json(category);
    } catch (err) {
        res.json({ message: err });
    }
}

const GetSubCategoriesByCategoryId = async (req, res) => {
    try {
        const subCategoryByCategoryId = await getSubCategoriesByCategoryId(req.params.categoryId);
        res.json(subCategoryByCategoryId.Items);

    } catch (err) {
        res.json({ message: err });
    }
}

const GetSubCategoryByCategoryIdAndGrade = async (req, res) => {
    const grade = req.params.grade;
    try {
        const subCategoryByCategoryId = await getSubCategoriesByCategoryId(req.params.categoryId);
        const subCategoryByGrade = [];
        subCategoryByCategoryId.Items.forEach(subCategory => {
            const findSubCategoryByGrade = subCategory.subCategoryGrades.find(element => element === grade);
            if (findSubCategoryByGrade) {
                subCategoryByGrade.push(subCategory)
            }
          });
          res.json(subCategoryByGrade);

    } catch (err) {
        res.json({ message: err });
    }
}

const DeleteSubCategory = async (req, res) => {
    try {
        const deleteCat = await deleteSubCategory(req.params.id)
        res.json(deleteCat);
    } catch (err) {
        res.json({ message: err });
    }
}

const GetSubCategoryWithId = async (req, res) => {
    try {
        const subCategory = await getSubCategoryWithId(req.params.id);
        res.json(subCategory);
    } catch (err) {
        res.json({ message: err });
    }

}

const UpdateSubCategory = async (req, res) => {
    const previousSubCategory = await getSubCategoryWithId(req.params.id);

    if (!previousSubCategory) {
        return res.json({ message: "SunCategory Not Found" });
    }

    console.log(req.body)

    await editSubCategoryById(previousSubCategory, {
        subCategoryName: req.body.subCategoryName,
        subCategoryGrades: req.body.subCategoryGrades,
        isEnabled: previousSubCategory.isEnabled,
    });

    const updatedSubCategory = await getSubCategoryWithId(req.params.id);

    res.json(updatedSubCategory);
};

const EnableDisableSubCategory = async (req, res) => {
    const previousSubCategory = await getSubCategoryWithId(req.params.id);

    if (!previousSubCategory) {
        return res.json({ message: "SunCategory Not Found" });
    }
    await editSubCategoryById(previousSubCategory, {
        isEnabled: !previousSubCategory.isEnabled,
    });

    const updatedSubCategory = await getSubCategoryWithId(req.params.id);
    res.json(updatedSubCategory);
};

module.exports = { AddNewSubCategory, GetSubCategories, GetSubCategoriesByCategoryId, GetSubCategoryByCategoryIdAndGrade, DeleteSubCategory, GetSubCategoryWithId, UpdateSubCategory, EnableDisableSubCategory }