# Lolo-v5-back

This is the backend server for the Lolo-v5 website, which fetches articles from RSS feeds. Users can add and remove custom RSS feeds. The website displays articles in a grid layout, and when clicked on an image or title, the content is displayed in a clutter-free manner using the Mercury API and shown in a scalable modal.

## Instructions

To run the backend server locally, follow these steps:

1. Clone this repository to your local machine:

```markdown
git clone https://github.com/TaaviToomsalu/Lolo-v5-back
```

2. Navigate into the cloned directory:

```markdown
cd Lolo-v5-back
```

3. Install dependencies using npm or yarn:

```markdown
npm install
```
or
```markdown
yarn install
```

4. Configure environment variables:
Create a `.env` file in the root directory of the project and define the required environment variables. Refer to the `.env.example` file for the required variables.

5. Start the server:

```markdown
npm start
```
or
```markdown
yarn start
```

6. The server should now be running locally on port 3000 by default.

## Environment Variables

Make sure to set the following environment variables in your `.env` file:

- `PORT`: The port on which the server will listen.
- Any other environment variables required for your specific configuration.

## Endpoints

GET /articles: This endpoint fetches articles from both default and custom RSS feeds. It returns a sorted list of articles with metadata such as title, link, publication date, description, author, media content, categories, and feed URL.

GET /feeds: This endpoint retrieves the list of custom RSS feeds that have been added by users.

POST /feeds: This endpoint allows users to add custom RSS feeds to the server. Users can provide the URL of the feed they want to add, and if the feed is not already in the list of custom feeds, it will be added.

DELETE /feeds/:url: This endpoint allows users to delete custom RSS feeds from the server. Users must provide the URL of the feed they want to delete, and if the feed exists in the list of custom feeds, it will be removed.

POST /fetch-article-content: This endpoint fetches the content of an article from a given URL using the Mercury API. Users need to provide the URL of the article they want to fetch, and the server will return the cleaned and formatted content of the article.

## Technologies Used

- Express.js
- Axios
- axios-retry
- Body-parser
- xml2js


## Contributing

If you'd like to contribute to this project, please follow the standard procedures for forking the repository, making changes, and submitting pull requests.

