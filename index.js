const express = require('express')
const axios = require('axios')
const axiosRetry = require('axios-retry');
const bodyParser = require('body-parser')

const app = express()
const port = 5001

app.use(bodyParser.json())

//Endpoint to fetch articles from the provided RSS feed
app.get('/articles', async (req, res) => {
    try {
        const rssFeedUrl = 'https://flipboard.com/@raimoseero/feed-nii8kd0sz.rss'
        const response = await axios.get(rssFeedUrl)

        // Parse the XML response
        const xmlString = response.data
        const parser = require('xml2js').parseString
        parser(xmlString, async (err, result) => {
            if (err) {
                console.error('Error parsing XML:', err)
                throw new Error('Error parsing XML')
            }

            // Extract article URLs from the parsed XML
            const articleUrls = result.rss.channel[0].item.map(item => item.link[0])

            // Fetch and parse article content using the Mercury API
            const clutterFreeArticles = await Promise.all(articleUrls.map(url => parseArticleContent(url)))

            console.log('Clutter free articles:', clutterFreeArticles)

            // Send clutter-free articles in the response
            res.json(clutterFreeArticles)
        })
    } catch (error) {
        console.error('Error fetching articles:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }

})

// Endpoint to add custom RSS feeds
app.post('/feeds', (req, res) => {
    try {
      const { url } = req.body;
  
      // Perform validation checks on the URL if needed
  
      // Add the URL to a list of feeds (you can store it in memory or use a database)
      // For demonstration purposes, we'll just log the URL
      console.log('Custom RSS feed added:', url);
  
      res.json({ message: 'Custom RSS feed added successfully' });
    } catch (error) {
      console.error('Error adding custom RSS feed:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

/*
axiosRetry(axios, {
    retries: 3, // Number of retries
    retryDelay: axiosRetry.exponentialDelay, // Exponential back-off delay between retries
    retryCondition: (error) => {
      // Retry on timeout errors
      return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ESOCKETTIMEDOUT';
    }
});
*/

// Function to fetch and parse article content using the Mercury API
const parseArticleContent = async (url) => {
    try {
        const mercuryApiUrl = 'https://uptime-mercury-api.azurewebsites.net/webparser';
        
        // Make a POST request to the Mercury API with the article URL
        const response = await axios.post(mercuryApiUrl, { url });

        console.log('Mercury API response:', response.data);

        // Check if the response is a 404 error
        if (response.status !== 200) {
            console.log(`Error fetching article at ${url}: ${response.statusText}`);
            return null; // or handle as needed
        }
        // Return the parsed article content
        return response.data;
    } catch (error) {
        console.error('Error parsing article content:', error);
        throw new Error('Error parsing article content');
    }
}

app.get('/', (req, res) => {
    res.send('Hello, Lolo v5 Backend!')
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})