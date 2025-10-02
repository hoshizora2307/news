document.addEventListener('DOMContentLoaded', () => {
    const newsFeedEl = document.getElementById('news-feed');
    const refreshBtn = document.getElementById('refresh-btn');
    
    // ニュースを取得する関数
    async function fetchNews() {
        newsFeedEl.innerHTML = '<p class="loading-message">ニュースを読み込んでいます...</p>';
        
        // RSS2JSON APIを使用
        // NASAのニュースRSSフィードを例として使用
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
            
            // 記事の概要を短くする
            const description = item.description.substring(0, 150) + '...';

            newsCard.innerHTML = `
                <h2>${item.title}</h2>
                <p>${description}</p>
                <a href="${item.link}" target="_blank">記事を読む →</a>
            `;
            
            newsFeedEl.appendChild(newsCard);
        });
    }

    // 初回ロード時とボタンクリック時にニュースを取得
    fetchNews();
    refreshBtn.addEventListener('click', fetchNews);
});
