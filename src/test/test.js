// 正しいURLを指定
const url = 'https://tjufwmnunr.ap-northeast-1.awsapprunner.com/api/v1/orders';

fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Referer': 'https://tjufwmnunr.ap-northeast-1.awsapprunner.com/',
    'Origin': 'https://tjufwmnunr.ap-northeast-1.awsapprunner.com'
  }
})
  .then(response => {
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => console.log(data)) // ✅ 成功すれば、ここに注文データが表示される
  .catch(error => console.error('There has been a problem with your fetch operation:', error));