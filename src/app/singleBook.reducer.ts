import { Action, createReducer, on } from '@ngrx/store'
import { selectBook, cleanBook, selectBooksUser } from './singleBook.actions'
import { Book } from './models/books'
import { BookUsers } from './models/booksUser'

export const initialState = {}

const _counterReducer = createReducer(
  initialState,
  on(selectBook, (state, action) => {
    return {
      ...state,
      ...action
    }
  }),
  on(cleanBook, () => {
    return {
      initialState
    }
  }),
  on(selectBooksUser, (state, action) => {
    return {
      ...state,
      ...action
    }
  })
)

export function singleBookReducer (state: object = Book, action: Action) {
  //return state;
  return _counterReducer(state, action)
}

