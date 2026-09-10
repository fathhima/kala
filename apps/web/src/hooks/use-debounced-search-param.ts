import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebouncedValue } from './use-debounced-value'

const applySearchParam = (search: string) => (prev: URLSearchParams) => {
    const next = new URLSearchParams(prev)
    const nextSearch = search.trim()

    if (nextSearch) next.set('search', nextSearch)
    else next.delete('search')

    next.set('page', '1')
    return next
}

export function useDebouncedSearchParam(delay = 400) {
    const [searchParams, setSearchParams] = useSearchParams()
    const committedSearch = searchParams.get('search')?.trim() ?? ''
    const [searchInput, setSearchInput] = useState(committedSearch)
    const debouncedSearch = useDebouncedValue(searchInput, delay)

    useEffect(() => {
        setSearchInput(committedSearch)
    }, [committedSearch])

    useEffect(() => {
        const nextSearch = debouncedSearch.trim()
        if (nextSearch === committedSearch) return

        setSearchParams(applySearchParam(nextSearch), { replace: true })
    }, [debouncedSearch, committedSearch, setSearchParams])

    const commitSearchNow = useCallback(() => {
        const nextSearch = searchInput.trim()
        if (nextSearch === committedSearch) return

        setSearchParams(applySearchParam(nextSearch), { replace: true })
    }, [searchInput, committedSearch, setSearchParams])

    return { searchInput, setSearchInput, committedSearch, commitSearchNow }
}