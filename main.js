const searchBtn = document.getElementById('search-btn');
const resultsDiv = document.getElementById('results');
const searchDateDiv = document.getElementById('search-date');

const keywords = [
    '멜론',
    '유튜브뮤직',
    '유튜브프리미엄',
    '유튜브프리미엄라이트',
    '스포티파이',
    '지니뮤직',
    '플로',
    '애플뮤직'
];

searchBtn.addEventListener('click', () => {
    const today = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(today.getDate() - 3);

    const formatDate = (date) => {
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}/${month}/${day}`;
    };

    const dateRange = `${formatDate(threeDaysAgo)}~${formatDate(today)}`;
    searchDateDiv.textContent = dateRange;

    resultsDiv.innerHTML = '<p>뉴스 검색 중...</p>';

    const fetchGoogleNews = (keyword) => {
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=ko&gl=KR&ceid=KR:ko&tbs=qdr:d3`;
        const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;

        return fetch(proxyUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(str => new DOMParser().parseFromString(str, "text/xml"))
            .then(data => {
                const items = data.querySelectorAll("item");
                let newsHtml = '<h3>Google News</h3>';
                if (items.length === 0) {
                    newsHtml += '<p>No result within 3 days</p>';
                } else {
                    items.forEach(item => {
                        const title = item.querySelector("title").textContent;
                        const link = item.querySelector("link").textContent;
                        const pubDate = new Date(item.querySelector("pubDate").textContent).toLocaleDateString('ko-KR');

                        newsHtml += `
                            <div class="news-item">
                                <a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a>
                                <p>${pubDate}</p>
                            </div>
                        `;
                    });
                }
                return newsHtml;
            })
            .catch(err => {
                console.error(`Error fetching Google news for ${keyword}:`, err);
                return '<h3>Google News</h3><p>Error fetching news.</p>';
            });
    };

    const fetchNaverNews = (keyword) => {
        const url = `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(keyword)}`;
        const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;

        return fetch(proxyUrl)
            .then(response => response.text())
            .then(str => new DOMParser().parseFromString(str, "text/html"))
            .then(data => {
                const items = data.querySelectorAll(".news_area");
                let newsHtml = '<h3>Naver News</h3>';
                if (items.length === 0) {
                    newsHtml += '<p>No news found.</p>';
                } else {
                    items.forEach(item => {
                        const titleEl = item.querySelector(".news_tit");
                        const title = titleEl.textContent;
                        const link = titleEl.href;
                        // For Naver, we'll just show the title and link as date is not easily available
                        newsHtml += `
                            <div class="news-item">
                                <a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a>
                            </div>
                        `;
                    });
                }
                return newsHtml;
            })
            .catch(err => {
                console.error(`Error fetching Naver news for ${keyword}:`, err);
                return '<h3>Naver News</h3><p>Error fetching news.</p>';
            });
    };

    const fetchTheqooNews = (keyword) => {
        const url = `https://theqoo.net/index.php?mid=hot&filter_mode=normal&search_target=title_content&search_keyword=${encodeURIComponent(keyword)}`;
        const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;

        return fetch(proxyUrl)
            .then(response => response.text())
            .then(str => new DOMParser().parseFromString(str, "text/html"))
            .then(data => {
                const items = data.querySelectorAll("table.parti_list tbody tr");
                let newsHtml = '<h3>theqoo.net</h3>';
                if (items.length === 0) {
                    newsHtml += '<p>No results found.</p>';
                } else {
                    items.forEach(item => {
                        const titleEl = item.querySelector("td.title a:not(.icon_pic)");
                        if (titleEl) {
                            const title = titleEl.textContent;
                            const link = titleEl.href;
                            const date = item.querySelector("td.time").textContent;

                            newsHtml += `
                                <div class="news-item">
                                    <a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a>
                                    <p>${date}</p>
                                </div>
                            `;
                        }
                    });
                }
                return newsHtml;
            })
            .catch(err => {
                console.error(`Error fetching theqoo.net for ${keyword}:`, err);
                return '<h3>theqoo.net</h3><p>Error fetching results.</p>';
            });
    };


    const keywordPromises = keywords.map(keyword => {
        return Promise.all([
            fetchGoogleNews(keyword),
            fetchNaverNews(keyword),
            fetchTheqooNews(keyword)
        ]).then(([googleHtml, naverHtml, theqooHtml]) => {
            return `
                <div class="category">
                    <h2>${keyword}</h2>
                    ${googleHtml}
                    ${naverHtml}
                    ${theqooHtml}
                </div>
            `;
        });
    });

    Promise.all(keywordPromises)
        .then(keywordHtmls => {
            resultsDiv.innerHTML = keywordHtmls.join('');
        });
});
