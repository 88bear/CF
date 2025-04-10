// 御守抽選圖片的來源（此處假設御守圖片位於 omamori 資料夾）
document.querySelectorAll('#omamori-list .omamori-item').forEach(item => {
  item.addEventListener('click', () => {
    // 取消所有御守項目的選取狀態
    document.querySelectorAll('#omamori-list .omamori-item').forEach(el => {
      el.classList.remove('selected');
    });
    // 標記被點擊的項目為選取狀態
    item.classList.add('selected');
    // 自動捲動到身份選擇區
    document.getElementById('identity-section').scrollIntoView({ behavior: 'smooth' });
  });
});

// 身份選擇邏輯：點選身份後自動捲動到抽卡區
document.querySelectorAll('#identity-list .identity-item').forEach(item => {
  item.addEventListener('click', () => {
    // 取消所有身份項目的選取狀態
    document.querySelectorAll('#identity-list .identity-item').forEach(el => {
      el.classList.remove('selected');
    });
    // 標記被點擊的項目為選取狀態
    item.classList.add('selected');
    // 自動捲動到抽卡區
    document.getElementById('card-section').scrollIntoView({ behavior: 'smooth' });
  });
});

// 抽卡用的圖片來源（cards 資料夾，只作為抽卡功能使用）
const cardImages = [
  'cards/card1.jpg', 'cards/card2.jpg', 'cards/card3.jpg',
  'cards/card4.jpg', 'cards/card5.jpg', 'cards/card6.jpg',
  'cards/card7.jpg', 'cards/card8.jpg', 'cards/card9.jpg',
  'cards/card10.jpg'
];

// 抽卡功能：點選抽卡按鈕後顯示五張卡片，點選後自動捲動到提交區
document.getElementById('draw-cards').addEventListener('click', () => {
  const cardResultDiv = document.getElementById('card-result');
  cardResultDiv.innerHTML = ""; // 清除先前的結果

  // 隨機選取 5 張不重複的卡片
  const selectedCards = [];
  while (selectedCards.length < 5) {
    const randomIndex = Math.floor(Math.random() * cardImages.length);
    const randomCard = cardImages[randomIndex];
    if (!selectedCards.includes(randomCard)) {
      selectedCards.push(randomCard);
    }
  }

  // 顯示卡片
  selectedCards.forEach(cardSrc => {
    const img = document.createElement('img');
    img.src = cardSrc;
    img.alt = 'Card';
    img.addEventListener('click', () => {
      // 取消其它卡片的選取狀態
      document.querySelectorAll('#card-result img').forEach(img => img.classList.remove('selected'));
      // 標記點擊的卡片為選取
      img.classList.add('selected');
      // 自動捲動到提交區
      document.getElementById('submit-section').scrollIntoView({ behavior: 'smooth' });
    });
    cardResultDiv.appendChild(img);
  });
});

// 提交資料並產生推薦
document.getElementById('submit').addEventListener('click', () => {
  // 取得被選取的御守
  const omamoriElement = document.querySelector('#omamori-list .omamori-item.selected');
  if (!omamoriElement) {
    alert('請先選擇一個御守！');
    return;
  }
  const omamori = omamoriElement.dataset.value;  // 從 data-value 取得御守值

  // 取得被選取的身份
  const identityElement = document.querySelector('#identity-list .identity-item.selected');
  if (!identityElement) {
    alert('請選擇身份！');
    return;
  }
  const identity = identityElement.dataset.value;

  // 取得被選取的卡片
  const selectedCard = document.querySelector('#card-result img.selected');
  if (!selectedCard) {
    alert('請先抽取卡片並選擇一張！');
    return;
  }

  // 準備要送出的資料
  const data = {
    omamori,
    identity,
    selectedCard: selectedCard.src
  };

  fetch('http://127.0.0.1:5000/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(result => {
      // 將推薦結果顯示在結果區域
      document.getElementById('result').innerText =
        `Recommended Products: ${result.products.join(', ')}\n\nPrompt: ${result.prompt}`;
      // 選擇性：自動捲動到推薦結果區
      document.getElementById('result-section').scrollIntoView({ behavior: 'smooth' });
    })
    .catch(error => console.error('Error:', error));
});
