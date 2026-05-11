const { ApolloServer } = require("@apollo/server")
const { startStandaloneServer } = require("@apollo/server/standalone")
const typeDefs = require("./schema")
const resolvers = require("./resolvers")
const jwt = require("jsonwebtoken")
const User = require("./models/user")

const startServer = async (port) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })

  const { url } = await startStandaloneServer(server, {
    listen: { port },
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null

      if (auth && auth.toLowerCase().startsWith("bearer ")) {
        try {
          const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
          const currentUser = await User.findById(decodedToken.id)
          return { currentUser }
        } catch (error) {
          return {}
        }
      }

      return {}
    },
  })

  console.log(`Server ready at ${url}`)
}

module.exports = { startServer }
