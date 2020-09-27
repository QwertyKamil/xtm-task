import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';

const SearchResult = ({ title, snippet }) => {
    return (
        <li>
            <h2>{title}</h2>
            <div
                dangerouslySetInnerHTML={{
                    __html: snippet,
                }}
            />
        </li>
    );
};

const App = () => {
    const inputEl = useRef(null);
    const [searchPhrase, setSearchPhrase] = useState('');
    const [search, setSearch] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [replacePhrase, setReplacePhrase] = useState('');

    useEffect(() => {
        if (searchPhrase) {
            setIsSearching(true);
            axios
                .get(
                    `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=%22${searchPhrase}%22&srlimit=10`,
                )
                .then(
                    ({
                        data: {
                            query: { search: searchResult },
                        },
                    }) => {
                        setSearchResults(searchResult);
                    },
                )
                .catch((e) => {
                    console.error(e);
                })
                .then(() => {
                    setIsSearching(false);
                });
        }
    }, [searchPhrase, search]);

    return (
        <>
            <div>
                <input
                    ref={inputEl}
                    type="text"
                    onChange={debounce(() => {
                        setSearchPhrase(inputEl.current.value);
                    }, 1000)}
                />
                <input
                    type="text"
                    onChange={({ target: { value } }) => {
                        setReplacePhrase(value);
                    }}
                />
                <button type="button" disabled={isSearching} onClick={() => setSearch((state) => !state)}>
                    Search
                </button>
                <button
                    type="button"
                    disabled={isSearching}
                    onClick={() => {
                        const toReplace = [...searchResults];
                        const regex = new RegExp(`<span class="searchmatch">${searchPhrase}</span>`, 'i');
                        for (let i = 0; i < toReplace.length; i++) {
                            if (toReplace[i].snippet.match(regex)) {
                                toReplace[i].snippet = toReplace[i].snippet.replace(regex, () => replacePhrase);
                                setSearchResults(toReplace);
                                break;
                            }
                        }
                    }}
                >
                    Replace
                </button>
                <button
                    type="button"
                    disabled={isSearching}
                    onClick={() => {
                        const regex = new RegExp(`<span class="searchmatch">${searchPhrase}</span>`, 'gi');
                        const toReplace = searchResults.map((item) => {
                            return {
                                ...item,
                                snippet: item.snippet.replace(regex, () => replacePhrase),
                            };
                        });
                        setSearchResults(toReplace);
                    }}
                >
                    Replace all
                </button>
            </div>

            {isSearching && 'SEARCHING'}
            {!isSearching && (
                <ul>
                    {searchResults.map((item) => (
                        <SearchResult key={item.pageid} {...item} />
                    ))}
                </ul>
            )}
        </>
    );
};

export default App;
