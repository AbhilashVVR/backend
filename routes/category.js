const express = require('express');
const router = express.Router();

const { EnableDisableCategory, UpdateCategory, AddNewCategory, GetCategories, GetCategoriesByGrade, DeleteCategory, GetCategoryWithName, GetCategoryWithId } = require('../services/category')

const { AddNewSubCategory, GetSubCategories, GetSubCategoriesByCategoryId, GetSubCategoryByCategoryIdAndGrade, DeleteSubCategory, GetSubCategoryWithId, UpdateSubCategory, EnableDisableSubCategory } = require('../services/subCategory');

const { AddNewExcercise } = require('../services/excercise')
// CRUD FOR CATEGORY

//Creating NewCategory with subCategory
router.post('/createCategory', AddNewCategory);

//Get All Category
router.get('/getAllCategory', GetCategories);

//Get All Category
router.get('/getCategoryByGrade/:grade', GetCategoriesByGrade);

router.get("/:name/get-category-by-name", GetCategoryWithName);

router.put("/:id/enableDisable", EnableDisableCategory);

router.put("/:id", UpdateCategory);

//Get Single Category Based On id
router.get('/getCategory/:id', GetCategoryWithId);

//Delete Category
router.delete('/deleteCategory/:id', DeleteCategory);

// CRUD FOR SUBCATEGORY

//Submit New SubCategory
router.post('/createSubCategory', AddNewSubCategory);

//Get All SubCategories
router.get('/getAllSubCategories', GetSubCategories);

//Get All SubCategories
router.get('/getAllSubCategories/:categoryId', GetSubCategoriesByCategoryId);

//Get All SubCategories
router.get('/getSubCategoryByCategoryIdAndGrade/:categoryId/:grade', GetSubCategoryByCategoryIdAndGrade);

//Get Single SubCategory Based On id
router.get('/getSubCategory/:id', GetSubCategoryWithId);

router.put("/:id/enableDisableSubCategory", EnableDisableSubCategory);

//Edit Sub Category
router.put('/editSubCategory/:id', UpdateSubCategory);

//Delete SubCategory
router.delete('/deleteSubCategory/:id', DeleteSubCategory);

router.post('/uploadCategory', AddNewExcercise);

module.exports = router;