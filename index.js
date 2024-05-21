const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const { parseStringPromise } = require('xml2js');
const cors = require('cors');

const app = express();
const port = 5001;

app.use(cors());
app.use(bodyParser.json());


app.use(cors({
    origin: 'https://lolo-v5-front.onrender.com',
    allowedHeaders: ['Content-Type', 'Authorization'] // Include the allowed headers
}));

const defaultFeed = 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml';

let customFeeds = [];

// Endpoint to fetch articles from both default and custom RSS feeds
app.get('/articles', async (req, res) => {
    try {
        const allFeedUrls = [defaultFeed, ...customFeeds];
        const promises = allFeedUrls.map(feedUrl => axios.get(feedUrl));
        const responses = await Promise.all(promises);

        responses.forEach((response, index) => {
            const feedUrl = allFeedUrls[index];
            console.log(`Data received from feed: ${feedUrl}`);
            //console.log(response.data); // Log initial data
        });

        const articlePromises = responses.map(async (response, index) => {
            const xmlData = response.data;
            const result = await parseStringPromise(xmlData);
            const feedUrl = allFeedUrls[index];
        
            return result.rss.channel[0].item.map(item => {
                const categories = item.category ? item.category.map(cat => cat._) : [];
                let author = 'Unknown';
                
                if (item.author) {
                    author = item.author[0];
                } else if (item['dc:creator']) {
                    author = item['dc:creator'][0];
                } else if (item['creator']) {
                    author = item['creator'][0];
                }
                
                return {
                    title: item.title[0],
                    link: item.link[0],
                    pubDate: new Date(item.pubDate[0]),
                    description: item.description[0],
                    author: author,
                    mediaContent: item['media:content'] ? item['media:content'][0].$ : null,
                    categories: categories,
                    feedUrl: feedUrl
                };
            });
        });

        const articles = await Promise.all(articlePromises);
        const aggregatedArticles = articles.flat();

        // Sort articles by publication date (newest first)
        const sortedArticles = aggregatedArticles.sort((a, b) => b.pubDate - a.pubDate);

        res.json(sortedArticles);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to get custom feeds
app.get('/feeds', (req, res) => {
    res.json(customFeeds);
});

// Endpoint to add custom RSS feeds
app.post('/feeds', (req, res) => {
    try {
        const { url } = req.body;
        if (!customFeeds.includes(url) && url !== defaultFeed) {
            customFeeds.push(url);
            console.log('Custom RSS feed added:', url);
            res.json({ message: 'Custom RSS feed added successfully' });
        } else {
            res.status(400).json({ error: 'Feed URL already exists or is a default feed' });
        }
    } catch (error) {
        console.error('Error adding custom RSS feed:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to delete custom RSS feeds
app.delete('/feeds/:url', (req, res) => {
    try {
        const { url } = req.params;
        const decodedUrl = decodeURIComponent(url);
        if (customFeeds.includes(decodedUrl)) {
            customFeeds = customFeeds.filter(feed => feed !== decodedUrl);
            console.log('Custom RSS feed deleted:', decodedUrl);
            res.json({ message: 'Custom RSS feed deleted successfully' });
        } else {
            res.status(404).json({ error: 'Feed URL not found in custom feeds' });
        }
    } catch (error) {
        console.error('Error deleting custom RSS feed:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/fetch-article-content', async (req, res) => {
    const { url } = req.body;
    try {
        const response = await axios.post('https://uptime-mercury-api.azurewebsites.net/webparser', { url });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching article content:', error);
        res.status(500).send('Failed to fetch article content');
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
