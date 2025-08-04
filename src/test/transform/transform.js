const fs = require('fs');
const path = require('path');


function transformToChart() { // getJson関数もインポートする場合は同じファイルから
  const orders = transformOrders();
  const monthlyOrders = getMonthlyOrders(orders);
  const monthlyPriceByUser = getMonthlyPriceByUser(monthlyOrders);
  console.log(monthlyPriceByUser);
}


// raw dataを適切なjsonに変換する
function transformOrders() {
  const raw_data = getOrder();
  if (!raw_data.orders || !Array.isArray(raw_data.orders)) return [];

  const orders = raw_data.orders.map((order) => ({
    // 注文基本情報
    id: order.id,
    orderAt: order.orderAt,
    status: order.status,

    // 顧客情報
    customer: {
      id: order.customer?.id,
      name: order.customer?.name,
      email: order.customer?.email,
      phoneNumber: order.customer?.phoneNumber,
      gender: order.customer?.gender,
      birthDate: order.customer?.birthDate,
      prefecture: order.customer?.prefecture?.name,
    },

    // アプリケーション情報
    app: {
      id: order.app?.id,
      name: order.app?.name,
      platform: order.app?.platform,
    },

    // 決済方法
    paymentMethod: order.paymentMethod,

    // 購入アイテム情報
    item: {
      id: order.item?.id,
      name: order.item?.name,
      price: order.item?.price,
      currency: order.item?.currency,
      category: order.item?.category,
    },
  }));

  return orders;
}


// テスト用
function getOrder(){
  const filePath = path.join(__dirname, '../data/orders.json');
  const jsonData = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(jsonData);
}

function getPrice() {
  return order.item?.price || 0;
}

function getIndicator(){
  const filePath = path.join(__dirname, '../data/exinput.json');
  const jsonData = fs.readFileSync(filePath, 'utf8');
  const indicator = JSON.parse(jsonData)["current"];
  return indicator;
}


//月別の注文をまとめる関数
function getMonthlyOrders(orders) {
  const monthlyOrders = {};
  orders.forEach(order => {
    const month = new Date(order.orderAt).toISOString().slice(0, 7); // YYYY-MM形式
    if (!monthlyOrders[month]) {
      monthlyOrders[month] = [];
    }
    monthlyOrders[month].push(order);
  });
  return monthlyOrders;
}

//月ごとにユーザーごとの購入履歴を取得する関数
function getMonthlyPriceByUser(monthlyOrders) {
  const monthlyPriceByUser = {};

  for (const month in monthlyOrders) {
    monthlyPriceByUser[month] = {};

    monthlyOrders[month].forEach(order => {
      const userId = order.customer.id;
      if (!monthlyPriceByUser[month][userId]) {
        monthlyPriceByUser[month][userId] = [];
      }
      monthlyPriceByUser[month][userId].push(order);
    });
  }

  return monthlyPriceByUser;
}


// テスト実行

if (require.main === module) {
  getIndicator();
}