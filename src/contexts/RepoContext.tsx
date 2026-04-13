import { createContext, useContext, type ReactNode } from 'react'
import { localStorageExpenseRepo, type ExpenseRepo } from '../lib/expenseRepo'

const RepoContext = createContext<ExpenseRepo>(localStorageExpenseRepo)

export function RepoProvider(props: {
  repo?: ExpenseRepo
  children: ReactNode
}) {
  return (
    <RepoContext.Provider value={props.repo ?? localStorageExpenseRepo}>
      {props.children}
    </RepoContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useExpenseRepo(): ExpenseRepo {
  return useContext(RepoContext)
}
