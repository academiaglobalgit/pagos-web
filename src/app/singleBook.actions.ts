import { createAction, props } from '@ngrx/store';
import { Book } from './models/books';
import { BookUsers } from './models/booksUser'


export const selectBook = createAction('[books page] selectBook', props< Book >());
export const cleanBook = createAction('[books page] cleanBook');
export const selectBooksUser = createAction('[books page] selectBooksUser', props< BookUsers >());
//export const decrement = createAction('[Counter Component] Decrement');
//export const reset = createAction('[Counter Component] Reset');