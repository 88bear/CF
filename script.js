// 御守抽選圖片的來源
document.querySelectorAll('#omamori-list .omamori-item').forEach(item => {
  item.addEventListener('click', () => {
    // 取消所有御守項目的選取狀態
    document.querySelectorAll('#omamori-list .omamori-item').forEach(el => {
      el.classList.remove('selected');
    });
    
    // 標記被點擊的項目為選取狀態
    item.classList.add('selected');
    
    // 直接捲動到身份選擇區（移除了洗牌動畫）
    document.getElementById('identity-section').scrollIntoView({ behavior: 'smooth' });
  });
});

// 身份選擇邏輯：點選身份後直接捲動到抽卡區，不顯示洗牌動畫
document.querySelectorAll('#identity-list .identity-item').forEach(item => {
  item.addEventListener('click', () => {
    // 取消所有身份項目的選取狀態
    document.querySelectorAll('#identity-list .identity-item').forEach(el => {
      el.classList.remove('selected');
    });
    
    // 標記被點擊的項目為選取狀態
    item.classList.add('selected');
    
    // 直接捲動到抽卡區（移除了洗牌動畫）
    document.getElementById('card-section').scrollIntoView({ behavior: 'smooth' });
  });
});

// 洗牌動畫函數
function showShuffleAnimation() {
  return new Promise((resolve) => {
    const shuffleContainer = document.getElementById('card-shuffle-container');
    shuffleContainer.classList.remove('hidden');
    
    // 添加多副牌的動畫效果
    const cardDeck = document.querySelector('.card-deck');
    
    // 創建一些額外的牌，模擬洗牌效果
    for (let i = 0; i < 5; i++) {
      const extraCard = document.createElement('div');
      extraCard.className = 'card-deck';
      extraCard.style.animationDelay = `${i * 0.2}s`;
      extraCard.style.zIndex = 10 - i;
      shuffleContainer.querySelector('.shuffle-animation').appendChild(extraCard);
    }
    
    // 設定動畫時間（3秒）
    setTimeout(() => {
      shuffleContainer.classList.add('hidden');
      // 清理創建的額外卡牌
      const extraCards = document.querySelectorAll('.card-deck');
      extraCards.forEach((card, index) => {
        if (index > 0) { // 保留原始的卡牌元素
          card.remove();
        }
      });
      resolve();
    }, 2000);
  });
}

// 抽卡用的圖片來源（cards 資料夾，從22張中隨機選1張）
const cardImages = [
  'cards/tarot1.png', 'cards/tarot2.png', 'cards/tarot3.png',
  'cards/tarot4.png', 'cards/tarot5.png', 'cards/tarot6.png',
  'cards/tarot7.png', 'cards/tarot8.png', 'cards/tarot9.png',
  'cards/tarot10.png', 'cards/tarot11.png', 'cards/tarot12.png',
  'cards/tarot13.png', 'cards/tarot14.png', 'cards/tarot15.png',
  'cards/tarot16.png', 'cards/tarot17.png', 'cards/tarot18.png',
  'cards/tarot19.png', 'cards/tarot20.png', 'cards/tarot21.png',
  'cards/tarot22.png'
];

// 抽卡功能：點選抽卡按鈕後顯示洗牌動畫，再顯示一張隨機選中的卡片
document.getElementById('draw-cards').addEventListener('click', () => {
  // 先顯示洗牌動畫
  showShuffleAnimation().then(() => {
    const cardResultDiv = document.getElementById('card-result');
    cardResultDiv.innerHTML = ""; // 清除先前的結果
    
    // 隨機選取一張卡片
    const randomIndex = Math.floor(Math.random() * cardImages.length);
    const randomCard = cardImages[randomIndex];
    
    // 顯示卡片
    const img = document.createElement('img');
    img.src = randomCard;
    img.alt = 'Selected Card';
    img.classList.add('selected'); // 自動標記為已選中

    // 確保圖片完全載入後再顯示
    img.onload = function() {
      // 加載完成時可以添加特效
      img.style.animation = 'fadeIn 0.5s ease-in';
    };
    
    cardResultDiv.appendChild(img);
    
    // 自動捲動到提交區
    document.getElementById('submit-section').scrollIntoView({ behavior: 'smooth' });
  });
});

// 提交資料並產生推薦
document.getElementById('submit').addEventListener('click', () => {
  // get被選的御守
  const omamoriElement = document.querySelector('#omamori-list .omamori-item.selected');
  if (!omamoriElement) {
    alert('請先選擇一個御守！');
    return;
  }
  const omamori = omamoriElement.dataset.value;

  // get被選的身份
  const identityElement = document.querySelector('#identity-list .identity-item.selected');
  if (!identityElement) {
    alert('請選擇身份！');
    return;
  }
  const identity = identityElement.dataset.value;

  // get被選的卡片
  const selectedCard = document.querySelector('#card-result img');
  if (!selectedCard) {
    alert('請先抽取卡片！');
    return;
  }

  // 要送出的data
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
      
      // 顯示SAM情緒評估區域
      document.getElementById('sam-section').classList.remove('hidden');
      
      // 自動捲動到推薦結果區
      document.getElementById('result-section').scrollIntoView({ behavior: 'smooth' });
    })
    .catch(error => console.error('Error:', error));
});

// SAM
['valence', 'arousal', 'dominance'].forEach((dimension, index) => {
  document.querySelectorAll(`#${dimension}-options .sam-option`).forEach(option => {
    option.addEventListener('click', () => {
      // 取消其他選項的選中狀態
      document.querySelectorAll(`#${dimension}-options .sam-option`).forEach(opt => {
        opt.classList.remove('selected');
      });
      
      // 被點擊的選項為選中狀態
      option.classList.add('selected');
      
      // 自動捲動
      if(index < 2){ 
        const nextDimension = ['valence', 'arousal', 'dominance'][index + 1];
        document.querySelector(`.sam-dimension:nth-child(${index + 2})`).scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'  // 確保捲動後的元素置中
        });
      }else{
        // 捲動到提交按鈕
        document.getElementById('submit-sam').scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    });
  });
});

// 提交情緒評估
document.getElementById('submit-sam').addEventListener('click', () => {
  // 獲取選中的值
  const valenceOption = document.querySelector('#valence-options .sam-option.selected');
  const arousalOption = document.querySelector('#arousal-options .sam-option.selected');
  const dominanceOption = document.querySelector('#dominance-options .sam-option.selected');
  
  // 驗證是否所有維度都已選擇
  if (!valenceOption || !arousalOption || !dominanceOption) {
    alert('請在每個維度中選擇一個選項！');
    return;
  }
  
  // 準備要送出的情緒評估資料
  const samData = {
    valence: parseInt(valenceOption.dataset.value),
    arousal: parseInt(arousalOption.dataset.value),
    dominance: parseInt(dominanceOption.dataset.value),
    // 可以添加先前已提交的資訊，便於後端整合數據
    omamori: document.querySelector('#omamori-list .omamori-item.selected').dataset.value,
    identity: document.querySelector('#identity-list .identity-item.selected').dataset.value
  };
  
  // 發送情緒評估資料到後端（可以新建一個端點或與現有端點整合）
  fetch('http://127.0.0.1:5000/api/emotional_feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(samData)
  })
    .then(response => response.json())
    .then(result => {
      alert('感謝您的情緒評估提交！');
      // 完成所有流程
      document.getElementById('sam-section').innerHTML += `
        <div class="completion-message">
          <h3>謝謝您的參與！</h3>
          <p>您的選擇和情緒評估已成功記錄。</p>
        </div>
      `;
    })
    .catch(error => {
      console.error('Error submitting emotional feedback:', error);
      alert('提交情緒評估時發生錯誤，請稍後再試。');
    });
});
