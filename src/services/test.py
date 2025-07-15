const database = client.db("sample_mflix");
const movies = database.collection("movies");

// Create an ascending index on the "title" field in the
// "movies" collection.
const result = await movies.createIndex({ title: 1 });
console.log(`Index created: ${result}`);

// Define a query to find movies in the "Drama" genre
const query = { type: "movie", genre: "Drama" };
// Define sorting criteria for the query results
const sort = { type: 1, genre: 1 };
// Include only the type and genre fields in the query results
const projection = { _id: 0, type: 1, genre: 1 };

// Execute the query using the defined criteria and projection
const cursor = movies
  .find(query)
  .sort(sort)
  .project(projection);