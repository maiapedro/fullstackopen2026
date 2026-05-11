import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

const ME = gql`
  query {
    me {
      favoriteGenre
    }
  }
`

const ALL_BOOKS = gql`
  query allBooksByGenre($genre: String) {
    allBooks(genre: $genre) {
      title
      author {
        name
      }
      published
      id
    }
  }
`

const Recommendations = ({ show }) => {
  const meResult = useQuery(ME, { skip: !show })
  const favoriteGenre = meResult.data?.me?.favoriteGenre

  const booksResult = useQuery(ALL_BOOKS, {
    skip: !show || !favoriteGenre,
    variables: { genre: favoriteGenre },
  })

  if (!show) {
    return null
  }

  if (meResult.loading || booksResult.loading) {
    return <div>loading...</div>
  }

  const books = booksResult.data?.allBooks ?? []

  return (
    <div>
      <h2>recommendations</h2>
      <div>books in your favorite genre</div>
      <div>{favoriteGenre}</div>

      <table>
        <tbody>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommendations
