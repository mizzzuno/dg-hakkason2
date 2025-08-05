const fs = require('fs');
const { get } = require('http');
const path = require('path');

//チャートと円グラフで使用するデータ
function transformToHL() { // getJson関数もインポートする場合は同じファイルから
  const orders = transformOrders();
  const monthlyOrders = getMonthlyOrders(orders);
  const monthlyPriceByUser = getMonthlyPriceByUser(monthlyOrders);
  const monthlySumPriceByUser = getMonthlySumPriceByUser(monthlyPriceByUser);
  const monthlySortedUser = sortMonthlyUser(monthlySumPriceByUser);
  console.log(monthlySortedUser); // --- IGNORE
  postResultsHL(monthlySortedUser); // 結果をファイルに保存
  return monthlySortedUser;
}

function transformToR(){
    const orders = transformOrders();
    const userDays= getLatestOrders(orders);
    const sectionCount= sortUserDays(userDays);
    console.log(sectionCount); // --- IGNORE
    postResultsR(sectionCount); // 結果をファイルに保存
    return sectionCount;
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



function getIndicatorHL(){
  const filePath = path.join(__dirname, '../data/exinput.json');
  const jsonData = fs.readFileSync(filePath, 'utf8');
  const indicatorHL = JSON.parse(jsonData)["current"];
  return indicatorHL;
}

function getIndicatorR(){
  const filePath = path.join(__dirname, '../data/exremove.json');
  const jsonData = fs.readFileSync(filePath, 'utf8');
  const indicatorR = JSON.parse(jsonData)["current"];
  return indicatorR;
}

function postResultsHL(monthlySortedUser) {
  const filePath = path.join(__dirname, '../data/hl_results.json');
  fs.writeFileSync(filePath, JSON.stringify(monthlySortedUser, null, 2));
  console.log("HL results saved to", filePath);
}

function postResultsR(sectionCount) {
  const filePath = path.join(__dirname, '../data/r_results.json');
  fs.writeFileSync(filePath, JSON.stringify(sectionCount, null, 2));
  console.log("R results saved to", filePath);
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
  const indicatorHL = getIndicatorHL();
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
      const status = getStatus(total, indicatorHL);
      if (status) {
        statusStats[status].count++;
        statusStats[status].total += total;
      }
    }
    monthlySortedUser[month] = statusStats;
  }
  return monthlySortedUser;
}

function getLatestOrders(orders) {
  // orders: 注文配列
  const userLatest = {};
  orders.forEach(order => {
    const userId = order.customer.id;
    if (!userLatest[userId] || order.orderAt > userLatest[userId].orderAt) {
      userLatest[userId] = order;
    }
  });
  // 日数計算（2024年12月1日0時0分0秒に固定）最新データがそこ
  const now = new Date('2024-12-31T23:59:59+09:00').getTime();
  const userDays = {};
  for (const userId in userLatest) {
    const orderAt = userLatest[userId].orderAt;
    const days = Math.floor((now - orderAt) / (1000 * 60 * 60 * 24));
    userDays[userId] = days;
  }
  return userDays;
}


function sortUserDays(userDays) {
  const indicatorR = getIndicatorR();
  // 区分判定関数
  function getSection(days, config) {
    for (const [section, range] of Object.entries(config)) {
      const [min, max] = range;
      if (max === 0) {
        if (days >= min) return section;
      } else {
        if (days >= min && days < max) return section;
      }
    }
    return null;
  }

  const sectionCount = {};
  // 初期化
  for (const section in indicatorR) {
    sectionCount[section] = 0;
  }
  for (const userId in userDays) {
    const days = userDays[userId];
    const section = getSection(days, indicatorR);
    if (section) sectionCount[section]++;
  }
  return sectionCount;
}


// テスト実行

if (require.main === module) {
  transformToHL();
  transformToR(); // --- IGNORE ---
}