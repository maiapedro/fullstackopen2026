import { useState } from 'react'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

const ALL_BOOKS = gql`
  query allBooks($genre: String) {
    allBooks(genre: $genre) {
      title
      published
      genres
      author {
        name
      }
      id
    }
  }
`

const ALL_GENRES = gql`
  query {
    allBooks {
      genres
      id
    }
  }
`

const Books = (props) => {
  const [genre, setGenre] = useState(null)
  const result = useQuery(ALL_BOOKS, {
    skip: !props.show,
    variables: { genre },
  })
  const genresResult = useQuery(ALL_GENRES, { skip: !props.show })

  if (!props.show) {
    return null
  }

  if (result.loading || genresResult.loading) {
    return <div>loading...</div>
  }

  const books = result.data.allBooks
  const genres = [...new Set(genresResult.data.allBooks.flatMap((book) => book.genres))]
  const selectGenre = (nextGenre) => {
    setGenre(nextGenre)
    result.refetch({ genre: nextGenre })
  }

  return (
    <div>
      <h2>books</h2>
      <div>in genre {genre || 'all genres'}</div>

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

      <div>
        {genres.map((currentGenre) => (
          <button key={currentGenre} onClick={() => selectGenre(currentGenre)}>
            {currentGenre}
          </button>
        ))}
        <button onClick={() => selectGenre(null)}>all genres</button>
      </div>
    </div>
  )
}

export default Books
