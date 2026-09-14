import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readListing } from '../src/lib/listingData.ts';
const listing={title:'Phone',description:'Good condition',price:100,currency:'UZS',status:'active',images:['https://example.com/photo.jpg'],seller:{id:'seller',name:'Seller'},location:{region:'samarkand'}};
test('malformed remote records cannot become renderable listings',()=>{
 for(const value of [null,{}, {...listing,seller:null},{...listing,price:NaN},{...listing,currency:'EUR'},{...listing,images:[{}]}]) assert.equal(readListing(value,'id'),null);
});
test('remote document ID overrides a payload ID and optional fields are normalized',()=>{
 const result=readListing({...listing,id:'forged',brand:{},seller:{...listing.seller,phone:{}},location:{...listing.location,latitude:1000,longitude:0}},'actual');
 assert.equal(result.id,'actual'); assert.equal(result.brand,undefined); assert.equal(result.seller.phone,''); assert.equal(result.location.latitude,undefined);
});
test('valid location and listing fields survive decoding',()=>{
 const result=readListing({...listing,location:{region:'samarkand',latitude:39.65,longitude:66.95},attributes:{brand:'Apple',bad:{}}},'id');
 assert.equal(result.price,100); assert.equal(result.location.latitude,39.65); assert.deepEqual(result.attributes,{brand:'Apple'});
});
