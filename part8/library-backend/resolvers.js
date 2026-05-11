const Author = require("./models/author")
const Book = require("./models/book")
const User = require("./models/user")
const { GraphQLError } = require("graphql")
const jwt = require("jsonwebtoken")

const formatMutationError = (error, invalidArgs) =>
  new GraphQLError(error.message, {
    extensions: {
      code: "BAD_USER_INPUT",
      invalidArgs,
      error,
    },
  })

const requireAuth = (currentUser) => {
  if (!currentUser) {
    throw new GraphQLError("not authenticated", {
      extensions: {
        code: "UNAUTHENTICATED",
      },
    })
  }
}

const resolvers = {
  Query: {
    bookCount: async () => Book.countDocuments({}),
    authorCount: async () => Author.countDocuments({}),
    allBooks: async (root, args) => {
      const query = {}

      if (args.genre) {
        query.genres = args.genre
      }

      if (args.author) {
        const author = await Author.findOne({ name: args.author })

        if (!author) {
          return []
        }

        query.author = author._id
      }

      return Book.find(query).populate("author")
    },
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => context.currentUser,
  },
  Mutation: {
    addBook: async (root, args, context) => {
      requireAuth(context.currentUser)

      try {
        let author = await Author.findOne({ name: args.author })

        if (!author) {
          author = new Author({ name: args.author })
          await author.save()
        }

        const book = new Book({
          title: args.title,
          published: args.published,
          genres: args.genres,
          author: author._id,
        })

        const savedBook = await book.save()
        return savedBook.populate("author")
      } catch (error) {
        throw formatMutationError(error, [args.title, args.author])
      }
    },
    editAuthor: async (root, args, context) => {
      requireAuth(context.currentUser)

      const author = await Author.findOne({ name: args.name })

      if (!author) {
        return null
      }

      author.born = args.setBornTo
      try {
        return await author.save()
      } catch (error) {
        throw formatMutationError(error, args.name)
      }
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      })

      try {
        return await user.save()
      } catch (error) {
        throw formatMutationError(error, [args.username, args.favoriteGenre])
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
          },
        })
      }

      if (!process.env.JWT_SECRET) {
        throw new GraphQLError("JWT_SECRET is not defined", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
    _resetDatabase: async () => {
      if (process.env.NODE_ENV !== "test") {
        throw new GraphQLError("_resetDatabase is only available in test mode")
      }
      await Author.deleteMany({})
      await Book.deleteMany({})
      await User.deleteMany({})
      return true
    },
  },
  Book: {
    author: async (root) => {
      if (root.author && root.author.name) {
        return root.author
      }

      return Author.findById(root.author)
    },
  },
  Author: {
    bookCount: async (root) => Book.countDocuments({ author: root._id }),
  },
}

module.exports = resolvers
