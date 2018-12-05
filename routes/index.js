const express = require('express');
const router = express.Router();
const coroutine = require('bluebird').coroutine;
const formatter = require('../utils/formatter');
const misc = require('../utils/misc');
const ProductService = require('../services/products');
const CategoryService = require('../services/categories');
const SellerService = require('../services/sellers');
const BannerService = require('../services/banners');
const BrandService = require('../services/brands');
const Banners = require('../models/banners');
const Products = require('../models/products');
const Categories = require('../models/categories');

const getHomeSlider = () => {
  return new Promise((resolve, reject) => {
    Banners.find({location : 'homepage_slider'})
    .populate('category')
    .sort({ createdAt : -1})
    .exec((err,docs) => {
      if(err) reject(err);
      resolve(docs);
    });
  });
};

const getHotDeals = () => {
  return new Promise((resolve,reject) => {
    Products.find({ $and: [{ flag : 'hot_deals' }, { status : 'published' }] })
    .populate('category')
    .limit(15)
    .sort({ createdAt : -1})
    .exec((err,docs) => {
      if(err) reject(err);
      resolve(docs);
    });
  });
}

const getCategoryDetails = () =>{
  return new Promise((resolve,reject) => {
    Categories.find({ $or: [ { _id : '5b5304907935d7081cd5e1e3' }, { _id: '5b5304b07935d7081cd5e1e4' }, { _id: '5b5304c67935d7081cd5e1e5' }, { _id: '5b5303f87935d7081cd5e1e2' }, { _id: '5b53051c7935d7081cd5e1e6' } ] })
    .exec((err,docs) => {
      if(err) reject(err);
      resolve(docs);
    });
  });
}

const getProducts = () => {
  return new Promise((resolve,reject) => {
    Products.find({$and : [{status: 'published' }, {$or : [{category: '5b5304907935d7081cd5e1e3'}, {category: '5b5304b07935d7081cd5e1e4'},{category: '5b5304c67935d7081cd5e1e5'},{category: '5b5303f87935d7081cd5e1e2'},{category: '5b53051c7935d7081cd5e1e6'} ]}]})
    .populate('category')
    .sort({ createdAt : -1})
    .exec((err,docs) => {
      if(err) reject(err);
      resolve(docs);
    });
  });
}

router.get('/',function(req,res,next){
  const arrayPromise = [getHomeSlider(), getHotDeals(), getCategoryDetails(), getProducts()];
  try {
    Promise.all(arrayPromise)
    .then((results) => {
      const categories = results[2];
      const products = results[3];
      const data = {
        foodsCat : categories[0],
        foods : products.filter(item => item.category.categoryName.toLowerCase() === 'foods'),
        groceryCat : categories[1],
        grocery : products.filter(item => item.category.categoryName.toLowerCase() === 'grocery'),
        electronicsCat : categories[2],
        electronics : products.filter(item => item.category.categoryName.toLowerCase() === 'computer_and_electronics'),
        menCat : categories[3],
        men : products.filter(item => item.category.categoryName.toLowerCase() === 'men'),
        womenCat : categories[4],
        women : products.filter(item => item.category.categoryName.toLowerCase() === 'women'),
        homeSlider : results[0],
        hotDeals : results[1],
        nepaliCurrency : misc.nepaliCurrency,
        assets : process.env.ASSETS_URL,
        formatter
      }
      console.log(data.assets);
      res.render('index',data);
    });
  } catch (e) {
    return next(e);
  }
});

router.get('/:seller', coroutine(function*(req,res,next){
  const seller = req.params.seller.trim().toLowerCase().replace(/ /g,"_");
  let products = [];
  const limit = 24;
  let totalPages;
  let currentPage;
  let offset;
  try {
    const category_list = yield CategoryService.list();
    const brand_list = yield BrandService.list();
    const profile = yield SellerService.getByCompany(seller);
    let docs = [];
    if(profile){
       products = yield ProductService.bySellers(profile.userId,0,0);
       const limit = 24;
       totalPages = Math.ceil(products.length / limit);
       currentPage = req.query.pageNum || 1;
       offset = (currentPage - 1) * limit;
       docs = yield ProductService.bySellers(profile.userId,offset,limit);
    }
    const data = {
      total : products,
      results : docs,
      categories : category_list,
      brands : brand_list,
      seller : profile || '',
      nepaliCurrency : misc.nepaliCurrency,
      assets : process.env.ASSETS_URL,
      totalPages,
      currentPage,
      formatter
    }
    res.render('sellers/listings',data);
  } catch (e) {
    return next(e);
  }
}));

router.get('/brand/:brand', coroutine(function*(req,res,next) {
  try {
    const category_list = yield CategoryService.list();
    const brand_list = yield BrandService.list();
    const products = yield ProductService.getProductsByBrands(req.params.brand,0,0);

    const limit = 24;
    const totalPages = Math.ceil(products.length / limit);
    const currentPage = req.query.pageNum || 1;
    const offset = (currentPage - 1) * limit;
    const docs = yield ProductService.getProductsByBrands(req.params.brand,offset,limit);
    data = {
      results : docs,
      brand : req.params.brand,
      totalProducts : products.length,
      nepaliCurrency : misc.nepaliCurrency,
      assets : process.env.ASSETS_URL,
      categories : category_list,
      brands : brand_list,
      totalPages,
      currentPage,
      formatter
    }
    res.render('products/listByBrands',data);
  } catch (e) {
    return next(e);
  }
}));

module.exports = router;
