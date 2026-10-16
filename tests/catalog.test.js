import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, searchCatalog, publicInterviews, safeUrl } from '../src/lib/catalog.js';
const restaurant = { id:'r1',name:'테스트 식당',branch:'본점',district:'성동구',neighborhood:'행당',stations:['한양대역'],category:'한식',venueType:'options',nearHanyang:true };
const verified = { status:'verified',checkedAt:'2026-10-16',method:'업체 공식 답변',sourceUrl:'https://example.com/evidence' };
const menu = { id:'m1',restaurantId:'r1',name:'콩 덮밥',ingredients:['콩'],price:9000,dietTypes:['vegan'],available:true,verification:verified };
const search = (filters={}, items=[menu], stories=[], favorites=[]) => searchCatalog([restaurant],items,stories,{...defaults,...filters},favorites);
test('restaurant, menu, ingredient and station searches', () => {
  for (const query of ['테스트','콩','한양대역',' 행당 ']) assert.equal(search({query}).length,1);
  assert.equal(search({query:'없는 메뉴'}).length,0);
});
test('diet and price must match the same menu', () => {
  const items = [{...menu,price:16000},{...menu,id:'m2',dietTypes:['ovo'],price:8000}];
  assert.equal(search({diet:'vegan',price:'10000'},items).length,0);
  assert.equal(search({diet:'ovo',price:'10000'},items).length,1);
});
test('pending, unavailable and unknown-price menus cannot match unsafe filters', () => {
  assert.equal(search({diet:'vegan'},[{...menu,verification:{...verified,status:'pending'}}]).length,0);
  assert.equal(search({diet:'vegan'},[{...menu,verification:{...verified,sourceUrl:''}}]).length,0);
  assert.equal(search({price:'10000'},[{...menu,price:null}]).length,0);
  assert.equal(search({diet:'vegan'},[{...menu,available:false}]).length,0);
});
test('district, station, category, venue, campus and favorite filters compose', () => {
  assert.equal(search({district:'성동구',station:'한양대역',category:'한식',venue:'options',hanyang:true,favorites:true},[menu],[],['r1']).length,1);
  assert.equal(search({favorites:true}).length,0);
  assert.equal(search({station:'왕십리역'}).length,0);
});
test('only consented published interviews appear and qualify filters', () => {
  const story={id:'i1',restaurantId:'r1',status:'published',consent:true,date:'2026-10-16'};
  assert.equal(publicInterviews([story,{...story,consent:false},{...story,status:'draft'}]).length,1);
  assert.equal(search({interview:true},[menu],[{...story,consent:false}]).length,0);
  assert.equal(search({interview:true},[menu],[story]).length,1);
});
test('external links reject script and insecure protocols', () => {
  for (const url of ['javascript:alert(1)','http://example.com','',null]) assert.equal(safeUrl(url),'');
  assert.equal(safeUrl('https://example.com/place'),'https://example.com/place');
});
