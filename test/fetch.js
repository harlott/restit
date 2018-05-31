import fetch from '../src/fetch'
import Headers from '../src/Headers'
import nock from 'nock'

import chai, { expect, should, assert } from 'chai';
should();
import chaiAsPromised from "chai-as-promised";
import 'babel-polyfill';
chai.use(chaiAsPromised);

const nockHost = 'http://fetch.test'

describe('fetch', () => {
  before(function() {
    nock(nockHost)
      .get('/get-success')
      .reply(200, {a: 1});

    nock(nockHost)
      .get('/get-error')
      .reply(415, {code: 'UNSUPPORTED_MEDIA_TYPE'});

    nock(nockHost)
      .get('/get-no-content')
      .reply(201);

    nock(nockHost)
      .get('/get-text-content')
      .reply(200, 'TEXT BODY');

    nock(nockHost)
      .get('/get-with-timeout')
      .socketDelay(32000)
      .reply(200, {code: 'TIMEOUT'});
  });
  it('expect to receive successfull response', async () => {
      let fetchOptions = {
        method: 'GET'
      }
      try{
        const res = await fetch(`${nockHost}/get-success`, {parseResponse: false})
        const resJson = await res.json()
        expect(resJson).to.deep.equal({a: 1});
      } catch(errRes){
        throw new Error(errRes)
      }
    })

  it('expect to receive error response', async () => {

    let fetchOptions = {
      method: 'GET'
    }
    let headers = new Headers().add().acceptApplicationJson().use()
    try{
      const res = await fetch(`${nockHost}/get-error`, {parseResponse: false, headers: headers})
      const resJson = await res.json()
      expect(resJson).to.deep.equal({code: 'UNSUPPORTED_MEDIA_TYPE'});
    } catch(errRes){
      expect(errRes.name).to.be.equal('FetchError');
    }
  })

  it('expect to parse response by defaultParser with isJson flag to true', async () => {
    let fetchOptions = {
      method: 'GET'
    }



    try{
      const res = await fetch(`${nockHost}/get-success`, {parseResponse: true, method: 'GET'})
      const jsonRes = await res.json()
      expect(res.isJson).to.be.equal(true)
      expect(jsonRes).to.be.deep.equal({a: 1})
    } catch(errRes){
      throw new Error(errRes)
    }
  })

  it('expect to parse response by defaultParser with server error response', async () => {
    let fetchOptions = {
      method: 'GET'
    }
    let headers = new Headers().add().acceptApplicationJson().use()
    try{
      const res = await fetch(`${nockHost}/get-server-error`, {parseResponse: true, headers: headers})
      const jsonRes = await res.json()
      expect(res.isJson).to.be.equal(true)
      expect(jsonRes).to.be.deep.equal({a: 1})
    } catch(errRes){
      if (errRes.name !== undefined){
          expect(errRes.name).to.be.equal('FetchError');
      }
    }
  })

  it('expect to parse response by defaultParser with empty response body', async () => {
    let fetchOptions = {
      method: 'GET'
    }
    let headers = new Headers().add().acceptApplicationJson().use()
    try{
      const res = await fetch(`${nockHost}/get-no-content`, {parseResponse: true, headers: headers})
      expect(res.isEmpty).to.be.equal(true)
    } catch(errRes){
      throw new Error(errRes)
    }
  })

  it('expect to parse response by defaultParser with text response body', async () => {
    let fetchOptions = {
      method: 'GET'
    }
    let headers = new Headers().add().acceptApplicationJson().use()
    try{
      const res = await fetch(`${nockHost}/get-text-content`, {parseResponse: true, headers: headers})
      expect(res.isText).to.be.equal(true)
    } catch(errRes){
      throw new Error(errRes)
    }
  })

  it('expect to handle timeout', async function(){
    this.timeout(2500)
    let fetchOptions = {
      method: 'GET'
    }
    let headers = new Headers().add().acceptApplicationJson().use()
    try{
      const res = await fetch(`${nockHost}/get-with-timeout`, {parseResponse: false, headers: headers, timeout: 2000})
      assert.ok(false)
    } catch(errRes){
      throw new Error(errRes)
      if (errRes.name !== undefined){
          expect(errRes.name).to.be.equal('FetchError');
      }
      if (errRes.code !== undefined){
        expect(errRes.code).to.be.equal('GENERIC_TIMEOUT');
      }
    }
  })
})
