import { createContext, useContext, useState, type ReactNode } from 'react'

interface ClassFilterContextValue {
  selectedClass: string
  setSelectedClass: (c: string) => void
}

const ClassFilterContext = createContext<ClassFilterContextValue>({
  selectedClass: '',
  setSelectedClass: () => {},
})

const STORAGE_KEY = 'acgme_selected_class'

export function ClassFilterProvider({ children }: { children: ReactNode }) {
  const [selectedClass, setSelectedClassState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? ''
    } catch {
      return ''
    }
  })

  const setSelectedClass = (c: string) => {
    setSelectedClassState(c)
    try {
      localStorage.setItem(STORAGE_KEY, c)
    } catch {}
  }

  return (
    <ClassFilterContext.Provider value={{ selectedClass, setSelectedClass }}>
      {children}
    </ClassFilterContext.Provider>
  )
}

export function useClassFilter() {
  return useContext(ClassFilterContext)
}