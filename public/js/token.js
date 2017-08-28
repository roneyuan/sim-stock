let getToken = (function(keyset) {
  let res = keyset.split('=', 2)[1];
  
  return res;
}(location.search.substr(1)));

let access_token = getToken;