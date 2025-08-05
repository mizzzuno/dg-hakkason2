
fetch('https://tjufwmnunr.ap-northeast-1.awsapprunner.com/api/v1/orders?appId=app_0001')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });
