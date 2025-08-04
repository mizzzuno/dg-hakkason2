const fs = require('fs');
const { get } = require('http');
const path = require('path');
//どの整形にも使う関数
function transform_init(){
  const orders = transformOrders();
  const monthlyOrders = getMonthlyOrders(orders);
 return monthlyOrders;
}

//チャートと円グラフで使用するデータ
function transformToHL() { // getJson関数もインポートする場合は同じファイルから
  const monthlyOrders = transform_init();
  const monthlyPriceByUser = getMonthlyPriceByUser(monthlyOrders);
  const monthlySumPriceByUser = getMonthlySumPriceByUser(monthlyPriceByUser);
  const monthlySortedUser = sortMonthlyUser(monthlySumPriceByUser);
  console.log(monthlySortedUser); // --- IGNOR
  console.log(monthlyPriceByUser); // --- IGNORE
  return monthlySortedUser;
}

function transformToR(){
    const monthlyOrders = transform_init();
    const getLatestOrders= getLatestOrders(monthlyOrders);
    console.log(monthlyOrders); // --- IGNORE
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



function getIndicator(){
  const filePath = path.join(__dirname, '../data/exinput.json');
  const jsonData = fs.readFileSync(filePath, 'utf8');
  const indicator = JSON.parse(jsonData)["current"];
  console.log(indicator);
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

//月ごとにユーザーごとの購入金額の合計
function getMonthlySumPriceByUser(monthlyPriceByUser) {
  const monthlySumPriceByUser = {};
  for (const month in monthlyPriceByUser) {
    monthlySumPriceByUser[month] = {};
    for (const userId in monthlyPriceByUser[month]) {
      const orders = monthlyPriceByUser[month][userId];
      const totalPrice = orders.reduce((sum, order) => sum + (order.item?.price || 0), 0);
      monthlySumPriceByUser[month][userId] = totalPrice;
    }
  }
  return monthlySumPriceByUser;
}


//ヘビーユーザーのソートと人数のカウント
function sortMonthlyUser(monthlySumPriceByUser) {
  const indicators = getIndicator();
  // ステータス判定関数
  function getStatus(total, config) {
    for (const [status, range] of Object.entries(config)) {
      const [min, max] = range;
      if (max === 0) {
        if (total >= min) return status;
      } else {
        if (total >= min && total < max) return status;
      }
    }
    return null;
  }

  const monthlySortedUser = {};
  for (const month in monthlySumPriceByUser) {
    // ステータスごとにカウントと合計金額
    const statusStats = {
      super_heavy: { count: 0, total: 0 },
      heavy: { count: 0, total: 0 },
      light: { count: 0, total: 0 },
      super_light: { count: 0, total: 0 }
    };
    for (const userId in monthlySumPriceByUser[month]) {
      const total = monthlySumPriceByUser[month][userId];
      const status = getStatus(total, indicators);
      if (status) {
        statusStats[status].count++;
        statusStats[status].total += total;
      }
    }
    monthlySortedUser[month] = statusStats;
  }
  return monthlySortedUser;
}
// テスト実行

if (require.main === module) {
  transformToR();
}