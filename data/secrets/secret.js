module.exports = {
  //secret should be in an environment variable in .env file, shouldn't be in the source code
  //the .env file is not pushed to GitHub, should be included in .gitignore file
  jwtSecret: process.env.JWT_SECRET
}