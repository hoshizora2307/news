document.addEventListener('DOMContentLoaded', () => {
    const newsFeedEl = document.getElementById('news-feed');
    const refreshBtn = document.getElementById('refresh-btn');
    
    // マトリックス背景の描画
    const canvas = document.getElementById('matrix-background');
    const ctx = canvas.getContext('2d');
    
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    let yPositions = Array(300).join(0).split('');
    
    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#0F0';
        ctx.font = '15px monospace';
        yPositions.map((y, index) => {
            const text = String.fromCharCode(65 + Math.random() * 33);
            const x = index * 10;
            ctx.fillText(text, x, y);
            if (y > 100 + Math.random() * 10000) {
                yPositions[index] = 0;
            } else {
                yPositions[index] = y + 10;
            }
        });
    }

    // ウィンドウのリサイズ時にキャンバスサイズを調整
    window.addEventListener('resize', () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        yPositions = Array(Math.floor(w / 10)).join(0).split('');
    });

    setInterval(drawMatrix, 50);

    // ニュースを取得する関数
    async function fetchNews() {
        newsFeedEl.innerHTML = '<p class="loading-message">ニュースを読み込んでいます...</p>';
        
        // RSS2JSON APIを使用
        const rssUrl = 'https://www.nasa.gov/rss/dyn/breaking_news.rss';
        const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

        try {
            const response = await fetch(proxyUrl);
            const data = await response.json();
            
            if (data.status === 'ok') {
                displayNews(data.items);
            } else {
                newsFeedEl.innerHTML = '<p class="loading-message">ニュースの取得に失敗しました。</p>';
            }
        } catch (error) {
            console.error('Error fetching news:', error);
            newsFeedEl.innerHTML = '<p class="loading-message">ニュースの取得に失敗しました。ネットワーク接続を確認してください。</p>';
        }
    }

    // ニュースを表示する関数
    function displayNews(items) {
        newsFeedEl.innerHTML = '';
        if (items.length === 0) {
            newsFeedEl.innerHTML = '<p class="loading-message">現在、新しいニュースはありません。</p>';
            return;
        }

        items.forEach(item => {
            const newsCard = document.createElement('div');
            newsCard.classList.add('news-card');
            
            const description = item.description.substring(0, 150) + '...';

            newsCard.innerHTML = `
                <h2>${item.title}</h2>
                <p>${description}</p>
                <a href="${item.link}" target="_blank">記事を読む →</a>
            `;
            
            newsFeedEl.appendChild(newsCard);
        });
    }

    fetchNews();
    refreshBtn.addEventListener('click', fetchNews);
});
